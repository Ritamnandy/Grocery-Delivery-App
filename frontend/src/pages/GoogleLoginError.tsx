import { Link, useSearchParams } from "react-router-dom"
import { ArrowLeftIcon, BikeIcon, RefreshCwIcon } from "lucide-react"

const GOOGLE_URL = import.meta.env.VITE_GOOGLE_AUTH_URL

export default function GoogleLoginError ()
{
    const [ searchParams ] = useSearchParams()

    // optional: your backend can redirect to /auth/google/error?message=Something
    const message = ( searchParams.get( "message" ) || "" ).slice( 0, 120 )

    return (
        <div className="min-h-screen bg-app-cream flex-center px-4 py-12">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl px-8 py-12 text-center">

                <div className="flex-center gap-2 mb-8 text-app-green">
                    <BikeIcon className="size-6" />
                    <span className="text-xl font-semibold">InstantMart</span>
                </div>

                {/* Animated X badge */ }
                <div className="relative size-24 mx-auto mb-7">
                    <span className="gl-ring absolute inset-0 rounded-full bg-red-500/25" />
                    <div className="gl-pop gl-shake relative size-full rounded-full bg-red-500 flex-center shadow-lg shadow-red-500/30">
                        <svg viewBox="0 0 52 52" className="size-12" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" aria-hidden="true">
                            <circle className="gl-circle" cx="26" cy="26" r="26" strokeOpacity="0.35" strokeWidth="3" />
                            <path className="gl-x" d="M17 17l18 18" />
                            <path className="gl-x" d="M35 17L17 35" />
                        </svg>
                    </div>
                </div>

                <h1 className="gl-fade-up text-2xl font-semibold text-app-green" style={ { animationDelay: "1s" } }>
                    Google sign-in failed
                </h1>
                <p className="gl-fade-up mt-2 text-sm text-app-text-light leading-relaxed" style={ { animationDelay: "1.15s" } }>
                    { message || "We couldn’t sign you in with Google. Please try again, or sign in with your email and password." }
                </p>

                <div className="gl-fade-up mt-8 flex flex-col gap-3" style={ { animationDelay: "1.3s" } }>
                    <a
                        href={ GOOGLE_URL }
                        className="inline-flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-app-orange rounded-xl hover:bg-app-orange-dark active:scale-[0.98] transition-all"
                    >
                        <RefreshCwIcon className="size-4" /> Try Google again
                    </a>

                    <Link
                        to="/login"
                        className="inline-flex items-center justify-center gap-2 py-3 text-sm font-medium text-zinc-600 bg-white border border-app-border rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                        <ArrowLeftIcon className="size-4" /> Back to Login
                    </Link>

                    <Link to="/" className="text-sm text-app-text-light hover:text-app-green transition-colors">
                        Go to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}