
import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import
    {
        AppleIcon, ArrowLeftIcon, BikeIcon, CarrotIcon, CroissantIcon,
        HomeIcon, MilkIcon, ShoppingBasketIcon, StoreIcon,
    } from "lucide-react"

// floating grocery items around the 404
const floaters = [
    { Icon: AppleIcon, className: "top-[12%] left-[8%] text-red-400", size: "size-9 sm:size-12", rot: "-12deg", delay: "0s" },
    { Icon: CarrotIcon, className: "top-[20%] right-[9%] text-orange-400", size: "size-9 sm:size-12", rot: "14deg", delay: "0.6s" },
    { Icon: MilkIcon, className: "bottom-[34%] left-[12%] text-sky-400", size: "size-8 sm:size-11", rot: "8deg", delay: "1.2s" },
    { Icon: CroissantIcon, className: "bottom-[38%] right-[12%] text-amber-500", size: "size-9 sm:size-12", rot: "-10deg", delay: "1.8s" },
]

function NotFound ()
{
    const navigate = useNavigate()

    useEffect( () =>
    {
        const previous = document.title
        document.title = "Page not found"
        window.scrollTo( 0, 0 )
        return () => { document.title = previous }
    }, [] )

    return (
        <div className="relative min-h-screen bg-app-cream overflow-hidden flex flex-col">

            {/* Floating groceries (decorative) */ }
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                { floaters.map( ( { Icon, className, size, rot, delay }, i ) => (
                    <Icon
                        key={ i }
                        className={ `nf-float absolute opacity-60 ${ className } ${ size }` }
                        style={ { [ "--nf-rot" as string ]: rot, animationDelay: delay } }
                    />
                ) ) }
            </div>

            {/* Content */ }
            <main className="relative flex-1 flex flex-col items-center justify-center text-center px-4 pt-16 pb-40">

                {/* 4 0 4 */ }
                <div className="flex items-center justify-center gap-2 sm:gap-4 select-none" aria-hidden="true">
                    <span className="nf-drop-in text-[8rem] sm:text-[12rem] leading-none font-bold text-app-green">4</span>

                    <span className="nf-drop-in relative size-28 sm:size-44 flex-center" style={ { animationDelay: "0.15s" } }>
                        <span className="nf-ring absolute inset-0 rounded-full bg-app-orange/30" />
                        <span className="relative size-full rounded-full border-10 sm:border-14 border-app-orange bg-white flex-center shadow-lg shadow-app-orange/20">
                            <ShoppingBasketIcon className="nf-wobble size-12 sm:size-20 text-app-green" />
                        </span>
                    </span>

                    <span className="nf-drop-in text-[8rem] sm:text-[12rem] leading-none font-bold text-app-green" style={ { animationDelay: "0.3s" } }>4</span>
                </div>

                <h1 className="nf-fade-up mt-6 text-2xl sm:text-3xl font-semibold text-app-green" style={ { animationDelay: "0.8s" } }>
                    Oops! This aisle is empty
                </h1>
                <p className="nf-fade-up mt-3 max-w-md text-sm sm:text-base text-app-text-light leading-relaxed" style={ { animationDelay: "0.95s" } }>
                    The page you’re looking for doesn’t exist or may have been moved.
                    Let’s get you back to the fresh stuff.
                </p>

                <div className="nf-fade-up mt-8 flex flex-wrap items-center justify-center gap-3" style={ { animationDelay: "1.1s" } }>
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
                        to="/products"
                        className="flex-center gap-2 px-6 py-3 text-sm font-medium text-zinc-600 bg-white border border-app-border rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                        <StoreIcon className="size-4" /> Browse Products
                    </Link>
                </div>
            </main>

            {/* Road with a delivery bike driving across */ }
            <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none" aria-hidden="true">
                <div className="nf-drive absolute bottom-9 left-0">
                    <div className="nf-bob flex items-end gap-1 text-app-green">
                        <span className="mb-1 px-2 py-1 text-[10px] font-semibold bg-app-orange text-white rounded-md shadow-sm">
                            404
                        </span>
                        <BikeIcon className="size-12" strokeWidth={ 1.5 } />
                    </div>
                </div>

                <div className="absolute bottom-0 inset-x-0 h-9 bg-app-green/90">
                    <div className="nf-road absolute top-1/2 -translate-y-1/2 inset-x-0 h-0.5" />
                </div>
            </div>
        </div>
    )
}

export default NotFound