import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { categoriesData } from "../../assets/assets"

const RESUME_DELAY = 2000 // ms to wait before sliding again

function HomeCategories ()
{
    const [ paused, setPaused ] = useState( false )
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>( null )

    const clearTimer = () =>
    {
        if ( timerRef.current )
        {
            clearTimeout( timerRef.current )
            timerRef.current = null
        }
    }

    // stop sliding right away
    const pause = () =>
    {
        clearTimer()
        setPaused( true )
    }

    // start sliding again after 2 seconds
    const resumeLater = () =>
    {
        clearTimer()
        timerRef.current = setTimeout( () => setPaused( false ), RESUME_DELAY )
    }

    useEffect( () => clearTimer, [] ) // clean up on unmount

    // the list is rendered twice so the loop has no visible jump
    const loop = [ ...categoriesData, ...categoriesData ]

    return (
        <section className="py-16">
            <div className="max-w-7xl mx-auto">
                <div className="px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-semibold text-app-text-dark">Browse Categories</h2>
                    <p className="text-app-text-light mt-1 text-sm">Find exactly what you need using</p>
                </div>

                <div
                    className="mt-8 overflow-hidden motion-reduce:overflow-x-auto no-scrollbar
                        mask-[linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
                    onPointerEnter={ pause }
                    onPointerLeave={ resumeLater }
                    onPointerDown={ pause }
                    onPointerUp={ ( e ) => e.pointerType !== "mouse" && resumeLater() }
                >
                    <div
                        className="flex w-max animate-[categories-marquee_linear_infinite] motion-reduce:animate-none"
                        style={ {
                            animationName: "categories-marquee",
                            animationTimingFunction: "linear",
                            animationIterationCount: "infinite",
                            animationDuration: `${ categoriesData.length * 4 }s`,
                            animationPlayState: paused ? "paused" : "running",
                        } }
                    >
                        { loop.map( ( category, i ) =>
                        {
                            const isCopy = i >= categoriesData.length
                            return (
                                <Link
                                    to={ `/products?category=${ category.slug }` }
                                    key={ `${ category.slug }-${ i }` }
                                    aria-hidden={ isCopy }
                                    tabIndex={ isCopy ? -1 : 0 }
                                    onClick={ () =>
                                    {
                                        pause()
                                        window.scrollTo( 0, 0 )
                                    } }
                                    className="group flex flex-col items-center gap-3 p-4 shrink-0"
                                >
                                    <div className="size-18 sm:size-26 sm:p-2 rounded-2xl overflow-hidden bg-orange-100 group-hover:ring-2 ring-orange-300/75 transition-all">
                                        <img src={ category.image } alt={ category.name } className="w-full h-full object-contain rounded-full transition-all" />
                                    </div>
                                    <span className="text-center text-xs font-medium text-zinc-600 leading-tight">{ category.name }</span>
                                </Link>
                            )
                        } ) }
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HomeCategories