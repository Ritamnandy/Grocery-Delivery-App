import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeftIcon, EyeOffIcon, HomeIcon, KeyRoundIcon, LogInIcon, ShieldAlertIcon, ShieldIcon } from "lucide-react"

// floating security icons (decorative)
const floaters = [
    { Icon: KeyRoundIcon, className: "top-[14%] left-[9%] text-orange-400", size: "size-9 sm:size-12", rot: "-14deg", delay: "0s" },
    { Icon: ShieldAlertIcon, className: "top-[22%] right-[9%] text-red-400", size: "size-9 sm:size-12", rot: "10deg", delay: "0.7s" },
    { Icon: EyeOffIcon, className: "bottom-[36%] left-[11%] text-zinc-400", size: "size-8 sm:size-11", rot: "8deg", delay: "1.3s" },
    { Icon: ShieldIcon, className: "bottom-[40%] right-[11%] text-app-green", size: "size-9 sm:size-12", rot: "-8deg", delay: "1.9s" },
]

function Forbidden ()
{
    const navigate = useNavigate()

    useEffect( () =>
    {
        const previous = document.title
        document.title = "Access denied"
        window.scrollTo( 0, 0 )
        return () => { document.title = previous }
    }, [] )

    return (
        <div className="relative min-h-screen bg-app-cream overflow-hidden flex flex-col">

            {/* Floating icons */ }
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                { floaters.map( ( { Icon, className, size, rot, delay }, i ) => (
                    <Icon
                        key={ i }
                        className={ `fb-float absolute opacity-50 ${ className } ${ size }` }
                        style={ { [ "--fb-rot" as string ]: rot, animationDelay: delay } }
                    />
                ) ) }
            </div>

            <main className="relative flex-1 flex flex-col items-center justify-center text-center px-4 pt-10 pb-44">

                {/* Hanging sign */ }
                <div className="fb-swing mb-6" aria-hidden="true">
                    <div className="flex justify-center gap-16">
                        <span className="w-0.5 h-8 bg-zinc-400" />
                        <span className="w-0.5 h-8 bg-zinc-400" />
                    </div>
                    <div className="px-6 py-2 text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-white bg-app-green rounded-lg shadow-md border-2 border-app-orange">
                        Restricted area
                    </div>
                </div>

                {/* 4 0 3 with a padlock as the zero */ }
                <div className="flex items-center justify-center gap-2 sm:gap-4 select-none" aria-hidden="true">
                    <span className="fb-drop-in text-[8rem] sm:text-[12rem] leading-none font-bold text-app-green">4</span>

                    <span className="fb-drop-in relative size-28 sm:size-44 flex-center" style={ { animationDelay: "0.15s" } }>
                        <span className="fb-ring absolute inset-0 rounded-full bg-app-orange/30" />
                        <span className="relative size-full rounded-full border-10 sm:border-14 border-app-orange bg-white flex-center shadow-lg shadow-app-orange/20">
                            <svg viewBox="0 0 64 64" className="fb-shake size-14 sm:size-24 text-app-green" fill="none">
                                {/* shackle */ }
                                <g className="fb-shackle">
                                    <path d="M20 29V21a12 12 0 0 1 24 0v8" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                                </g>
                                {/* body */ }
                                <rect x="12" y="28" width="40" height="28" rx="7" fill="currentColor" />
                                {/* keyhole */ }
                                <circle cx="32" cy="40" r="4" fill="white" />
                                <rect x="30" y="42" width="4" height="8" rx="2" fill="white" />
                            </svg>
                        </span>
                    </span>

                    <span className="fb-drop-in text-[8rem] sm:text-[12rem] leading-none font-bold text-app-green" style={ { animationDelay: "0.3s" } }>3</span>
                </div>

                <h1 className="fb-fade-up mt-6 text-2xl sm:text-3xl font-semibold text-app-green" style={ { animationDelay: "0.8s" } }>
                    Access denied
                </h1>
                <p className="fb-fade-up mt-3 max-w-md text-sm sm:text-base text-app-text-light leading-relaxed" style={ { animationDelay: "0.95s" } }>
                    You don’t have permission to view this page. If you think this is a mistake,
                    try signing in with a different account.
                </p>

                <div className="fb-fade-up mt-8 flex flex-wrap items-center justify-center gap-3" style={ { animationDelay: "1.1s" } }>
                    <Link
                        to="/"
                        className="flex-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-app-orange rounded-xl hover:bg-app-orange-dark active:scale-[0.98] transition-all"
                    >
                        <HomeIcon className="size-4" /> Back to Home
                    </Link>

                    <button
                        onClick={ () => navigate( -1 ) }
                        className="flex-center gap-2 px-6 py-3 text-sm font-medium text-zinc-600 bg-white border border-app-border rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer"
                    >
                        <ArrowLeftIcon className="size-4" /> Go Back
                    </button>

                    <Link
                        to="/login"
                        className="flex-center gap-2 px-6 py-3 text-sm font-medium text-zinc-600 bg-white border border-app-border rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                        <LogInIcon className="size-4" /> Sign In
                    </Link>
                </div>
            </main>

            {/* Caution tape: two strips crossing at slight angles */ }
            <div className="absolute bottom-0 inset-x-0 h-40 overflow-hidden pointer-events-none" aria-hidden="true">
                <div className="fb-tape absolute -inset-x-10 bottom-14 h-9 -rotate-2 shadow-md" />
                <div className="fb-tape absolute -inset-x-10 bottom-4 h-9 rotate-2 shadow-md" style={ { animationDirection: "reverse" } } />
            </div>
        </div>
    )
}

export default Forbidden