import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';

const SHUTDOWN_TIMEOUT_MS = 25_000;   // force-kill workers after this
const RESPAWN_DELAY_MS = 1_000;
const CRASH_WINDOW_MS = 60_000;
const MAX_CRASHES_PER_WINDOW = 10;    // crash loop → primary exits so your supervisor alerts

function resolveWorkerCount (): number
{
  const fromEnv = Number( process.env.CLUSTER_WORKERS );
  if ( Number.isInteger( fromEnv ) && fromEnv >= 1 ) return fromEnv;
  // unset: single process in dev, one worker per core in production
  return process.env.NODE_ENV === 'production' ? availableParallelism() : 1;
}

function runPrimary ( count: number ): void
{
  console.log( `[primary ${ process.pid }] starting ${ count } workers` );

  let shuttingDown = false;
  const slots = new Map<number, number>(); // worker.id → slot (0..count-1)
  const crashes: number[] = [];

  const spawn = ( slot: number ) =>
  {
    // NODE_APP_INSTANCE gives each worker its own log file name (see logger config)
    const worker = cluster.fork( { NODE_APP_INSTANCE: String( slot ) } );
    slots.set( worker.id, slot );
  };

  cluster.on( 'exit', ( worker, code, signal ) =>
  {
    const slot = slots.get( worker.id ) ?? 0;
    slots.delete( worker.id );

    if ( shuttingDown )
    {
      if ( slots.size === 0 ) process.exit( 0 );
      return;
    }

    console.error(
      `[primary] worker ${ worker.process.pid } (slot ${ slot }) died (code=${ code }, signal=${ signal }), respawning`,
    );

    const now = Date.now();
    crashes.push( now );
    while ( crashes.length && now - crashes[ 0 ] > CRASH_WINDOW_MS ) crashes.shift();
    if ( crashes.length > MAX_CRASHES_PER_WINDOW )
    {
      console.error( '[primary] workers keep crashing, exiting' );
      process.exit( 1 );
    }

    setTimeout( () =>
    {
      if ( !shuttingDown ) spawn( slot );
    }, RESPAWN_DELAY_MS );
  } );

  const shutdown = ( signal: string ) =>
  {
    if ( shuttingDown ) return;
    shuttingDown = true;
    console.log( `[primary] ${ signal } received, asking workers to stop` );

    if ( slots.size === 0 ) process.exit( 0 );
    for ( const worker of Object.values( cluster.workers ?? {} ) ) worker?.send( 'shutdown' );

    setTimeout( () =>
    {
      console.error( '[primary] shutdown timed out, killing workers' );
      for ( const worker of Object.values( cluster.workers ?? {} ) ) worker?.kill( 'SIGKILL' );
      process.exit( 1 );
    }, SHUTDOWN_TIMEOUT_MS ).unref();
  };

  process.on( 'SIGINT', () => shutdown( 'SIGINT' ) );
  process.on( 'SIGTERM', () => shutdown( 'SIGTERM' ) );

  for ( let slot = 0; slot < count; slot++ ) spawn( slot );
}

async function main ()
{
  const count = resolveWorkerCount();

  if ( count === 1 )
  {
    // dev / watch mode / tiny containers: no cluster, no overhead
    const { bootstrap } = await import( './server.js' );
    return bootstrap();
  }

  if ( cluster.isPrimary ) return runPrimary( count );

  const { bootstrap } = await import( './server.js' );
  return bootstrap( { clustered: true } );
}

main().catch( ( err ) =>
{
  console.error( 'Fatal startup error', err );
  process.exit( 1 );
} );