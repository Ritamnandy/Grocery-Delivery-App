/* eslint-disable react-hooks/purity */

import { useEffect, useMemo } from "react"
import { Link, useLocation } from "react-router-dom"
import { ArrowRightIcon, HomeIcon, PackageIcon } from "lucide-react"
import { useCart } from "../context/cartContext"

const CONFETTI_COLORS = [ "#f97316", "#fdba74", "#fbbf24", "#86efac", "#166534", "#fb7185" ]

function OrderSuccess ()
{
    const { clearCart } = useCart()
    const location = useLocation()
    const orderId: string | undefined = location.state?.orderId

    // the order is placed, so empty the cart (safe to do here, the checkout page is already gone)
    useEffect( () =>
    {
        clearCart()
        window.scrollTo( 0, 0 )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [] )

    // random confetti, generated once
    const confetti = useMemo(
        () =>
            Array.from( { length: 44 } ).map( ( _, i ) => ( {
                id: i,
                left: Math.random() * 100,
                size: 6 + Math.random() * 6,
                duration: 3.2 + Math.random() * 2.6,
                delay: Math.random() * 1.2,
                drift: ( Math.random() - 0.5 ) * 160,
                spin: 360 + Math.random() * 720,
                color: CONFETTI_COLORS[ i % CONFETTI_COLORS.length ],
                round: Math.random() > 0.6,
            } ) ),
        []
    )

    return (
        <div className="relative min-h-screen bg-app-cream flex-center px-4 py-12 overflow-hidden">

            {/* Confetti */ }
            <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                { confetti.map( ( c ) => (
                    <span
                        key={ c.id }
                        className="os-confetti-piece"
                        style={ {
                            left: `${ c.left }%`,
                            width: c.size,
                            height: c.round ? c.size : c.size * 1.6,
                            borderRadius: c.round ? "9999px" : "2px",
                            backgroundColor: c.color,
                            animationDuration: `${ c.duration }s`,
                            animationDelay: `${ c.delay }s`,
                            [ "--os-drift" as string ]: `${ c.drift }px`,
                            [ "--os-spin" as string ]: `${ c.spin }deg`,
                        } }
                    />
                ) ) }
            </div>

            {/* Card */ }
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl px-8 py-12 text-center">

                {/* Animated check badge */ }
                <div className="relative size-28 mx-auto mb-8">
                    <span className="os-ring absolute inset-0 rounded-full bg-app-green/25" />
                    <span className="os-ring absolute inset-0 rounded-full bg-app-green/20" style={ { animationDelay: "1.6s" } } />

                    <div className="os-badge relative size-full rounded-full bg-app-green flex-center shadow-lg shadow-app-green/30">
                        <svg viewBox="0 0 52 52" className="size-14" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <circle className="os-circle" cx="26" cy="26" r="26" strokeOpacity="0.35" />
                            <path className="os-check" d="M14 27l7 7 16-16" />
                        </svg>
                    </div>
                </div>

                <h1 className="os-fade-up text-2xl sm:text-3xl font-semibold text-app-green" style={ { animationDelay: "1s" } }>
                    Order placed successfully!
                </h1>

                <p className="os-fade-up mt-3 text-sm text-app-text-light leading-relaxed" style={ { animationDelay: "1.15s" } }>
                    Thank you for shopping with InstantMart. We’re getting your fresh groceries ready and
                    will have them at your door soon.
                </p>

                { orderId && (
                    <p className="os-fade-up mt-4 inline-block px-4 py-1.5 text-xs font-medium text-app-green bg-app-green/10 rounded-full" style={ { animationDelay: "1.3s" } }>
                        Order #{ orderId.slice( -8 ).toUpperCase() }
                    </p>
                ) }

                <div className="os-fade-up mt-8 flex flex-col gap-3" style={ { animationDelay: "1.45s" } }>
                    <Link
                        to="/"
                        onClick={ () => window.scrollTo( 0, 0 ) }
                        className="flex-center gap-2 py-3.5 text-sm font-semibold text-white bg-app-orange rounded-xl hover:bg-app-orange-dark active:scale-[0.98] transition-all"
                    >
                        <HomeIcon className="size-4" /> Back to Home
                    </Link>

                    <Link
                        to="/myorders"
                        className="flex-center gap-2 py-3.5 text-sm font-medium text-zinc-600 bg-white border border-app-border rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                        <PackageIcon className="size-4" /> View My Orders <ArrowRightIcon className="size-4" />
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default OrderSuccess