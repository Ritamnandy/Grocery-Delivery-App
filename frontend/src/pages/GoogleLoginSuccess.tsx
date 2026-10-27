
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRightIcon, BikeIcon } from "lucide-react"

const REDIRECT_SECONDS = 4

export default function GoogleLoginSuccess ()
{
    const navigate = useNavigate()
    const [ seconds, setSeconds ] = useState( REDIRECT_SECONDS )

    // TODO: refresh your auth state here so the navbar shows the logged-in user,
    // e.g. call your /auth/me endpoint and store the result in your auth context.

    useEffect( () =>
    {
        const tick = setInterval( () => setSeconds( ( s ) => Math.max( 0, s - 1 ) ), 1000 )
        const redirect = setTimeout( () => navigate( "/", { replace: true } ), REDIRECT_SECONDS * 1000 )
        return () =>
        {
            clearInterval( tick )
            clearTimeout( redirect )
        }
    }, [ navigate ] )

    return (
        <div className="min-h-screen bg-app-cream flex-center px-4 py-12">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl px-8 py-12 text-center">

                <div className="flex-center gap-2 mb-8 text-app-green">
                    <BikeIcon className="size-6" />
                    <span className="text-xl font-semibold">InstantMart</span>
                </div>

                {/* Animated check badge */ }
                <div className="relative size-24 mx-auto mb-7">
                    <span className="gl-ring absolute inset-0 rounded-full bg-app-green/25" />
                    <div className="gl-pop relative size-full rounded-full bg-app-green flex-center shadow-lg shadow-app-green/30">
                        <svg viewBox="0 0 52 52" className="size-12" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle className="gl-circle" cx="26" cy="26" r="26" strokeOpacity="0.35" />
                            <path className="gl-check" d="M14 27l7 7 16-16" />
                        </svg>
                    </div>
                </div>

                <h1 className="gl-fade-up text-2xl font-semibold text-app-green" style={ { animationDelay: "1s" } }>
                    You’re signed in!
                </h1>
                <p className="gl-fade-up mt-2 text-sm text-app-text-light leading-relaxed" style={ { animationDelay: "1.15s" } }>
                    Google login was successful. Taking you to the home page
                    <span aria-live="polite"> in <span className="font-semibold text-app-green">{ seconds }</span>s...</span>
                </p>

                {/* Countdown progress bar */ }
                <div className="gl-fade-up mt-6 h-1.5 w-full rounded-full bg-app-green/10 overflow-hidden" style={ { animationDelay: "1.3s" } }>
                    <div
                        className="gl-progress h-full rounded-full bg-app-orange"
                        style={ { animationDuration: `${ REDIRECT_SECONDS }s` } }
                    />
                </div>

                <Link
                    to="/"
                    replace
                    className="gl-fade-up mt-6 inline-flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-white bg-app-orange rounded-xl hover:bg-app-orange-dark active:scale-[0.98] transition-all"
                    style={ { animationDelay: "1.45s" } }
                >
                    Go to Home now <ArrowRightIcon className="size-4" />
                </Link>
            </div>
        </div>
    )
}