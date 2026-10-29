import cluster from 'node:cluster';


export function runPrimary ( workerCount: number )
{
    const SHUTDOWN_TIMEOUT_MS = 30_000;
    const MAX_CRASHES = 10;
    const CRASH_WINDOW_MS = 60_000;

    const slots = new Map<number, number>(); // cluster worker id -> slot index (0..n-1)
    const crashes: number[] = [];
    let shuttingDown = false;

    const spawn = ( slot: number ) =>
    {
        // NODE_APP_INSTANCE gives each worker its own log file (app-0, app-1, ...)
        const worker = cluster.fork( { NODE_APP_INSTANCE: String( slot ) } );
        slots.set( worker.id, slot );
    };

    console.log( `Primary ${ process.pid } starting ${ workerCount } workers` );
    for ( let i = 0; i < workerCount; i++ ) spawn( i );

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
            `Worker ${ worker.process.pid } exited (code=${ code }, signal=${ signal }), respawning`,
        );

        // Crash-loop guard: if workers keep dying (bad env, DB down), stop and let
        // Docker / systemd / PM2 decide what to do instead of spinning forever.
        const now = Date.now();
        crashes.push( now );
        while ( crashes.length && now - crashes[ 0 ] > CRASH_WINDOW_MS ) crashes.shift();
        if ( crashes.length > MAX_CRASHES )
        {
            console.error( 'Workers are crash-looping, shutting down' );
            process.exit( 1 );
        }

        setTimeout( () =>
        {
            if ( !shuttingDown ) spawn( slot );
        }, 1000 );
    } );

    const shutdown = ( signal: string ) =>
    {
        if ( shuttingDown ) return;
        shuttingDown = true;
        console.log( `${ signal } received, stopping workers` );

        if ( slots.size === 0 ) process.exit( 0 );
        // SIGTERM triggers Nest's shutdown hooks in each worker (finish requests, close DB/Redis)
        for ( const worker of Object.values( cluster.workers ?? {} ) )
        {
            worker?.process.kill( 'SIGTERM' );
        }
        setTimeout( () =>
        {
            console.error( 'Shutdown timed out, forcing exit' );
            process.exit( 1 );
        }, SHUTDOWN_TIMEOUT_MS ).unref();
    };

    process.on( 'SIGTERM', () => shutdown( 'SIGTERM' ) );
    process.on( 'SIGINT', () => shutdown( 'SIGINT' ) );
}

