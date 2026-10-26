import { useEffect, useRef, useState } from "react"
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, LeafIcon } from "lucide-react"
import { heroSectionData } from "../../assets/assets"
import { Link } from "react-router-dom"

const heroImages: string[] = [
    heroSectionData.hero_image0,
    heroSectionData.hero_image1,
    heroSectionData.hero_image2,
    heroSectionData.hero_image3,
    heroSectionData.hero_image4,
    heroSectionData.hero_image5,
    heroSectionData.hero_image6,
]

const SLIDE_INTERVAL = 5000 // ms each image stays
const SWIPE_THRESHOLD = 50 // px

function Hero ()
{
    const count = heroImages.length
    const [ index, setIndex ] = useState( 0 )
    const [ animate, setAnimate ] = useState( true )
    const [ paused, setPaused ] = useState( false )
    const touchStartX = useRef<number | null>( null )

    // first image is repeated at the end so the loop has no visible jump
    const slides = [ ...heroImages, heroImages[ 0 ] ]

    // autoplay
    useEffect( () =>
    {
        if ( paused ) return
        const t = setTimeout( () => setIndex( ( i ) => Math.min( i + 1, count ) ), SLIDE_INTERVAL )
        return () => clearTimeout( t )
    }, [ index, paused, count ] )

    // after sliding onto the cloned first image, jump back to the real first one without animation
    const handleTransitionEnd = ( e: React.TransitionEvent<HTMLDivElement> ) =>
    {
        if ( e.target !== e.currentTarget || index !== count ) return
        setAnimate( false )
        setIndex( 0 )
        requestAnimationFrame( () => requestAnimationFrame( () => setAnimate( true ) ) )
    }

    const next = () =>
    {
        setAnimate( true )
        setIndex( ( i ) => Math.min( i + 1, count ) )
    }

    const prev = () =>
    {
        if ( index === 0 )
        {
            // jump (no animation) to the clone, which looks identical to slide 1, then slide back to the last image
            setAnimate( false )
            setIndex( count )
            requestAnimationFrame( () => requestAnimationFrame( () =>
            {
                setAnimate( true )
                setIndex( count - 1 )
            } ) )
        } else
        {
            setAnimate( true )
            setIndex( index - 1 )
        }
    }

    const goTo = ( i: number ) =>
    {
        if ( i === index % count ) return // already showing (the clone counts as slide 1)
        setAnimate( true )
        setIndex( i )
    }

    // swipe on touch screens
    const onTouchStart = ( e: React.TouchEvent ) =>
    {
        touchStartX.current = e.touches[ 0 ].clientX
    }

    const onTouchEnd = ( e: React.TouchEvent ) =>
    {
        if ( touchStartX.current === null ) return
        const dx = e.changedTouches[ 0 ].clientX - touchStartX.current
        touchStartX.current = null
        if ( dx <= -SWIPE_THRESHOLD ) next()
        else if ( dx >= SWIPE_THRESHOLD ) prev()
    }

    const arrowClass =
        "hidden md:flex absolute top-1/2 -translate-y-1/2 size-10 flex-center rounded-full bg-white/10 text-white border border-white/20 backdrop-blur-sm hover:bg-white/25 transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 active:scale-95 cursor-pointer"

    return (
        <section
            className="group relative overflow-hidden min-h-135 mb-1 rounded-3xl flex items-center"
            onMouseEnter={ () => setPaused( true ) }
            onMouseLeave={ () => setPaused( false ) }
            onTouchStart={ onTouchStart }
            onTouchEnd={ onTouchEnd }
        >
            {/* Sliding background images */ }
            <div
                className={ `absolute inset-0 flex ${ animate ? "transition-transform duration-700 ease-in-out motion-reduce:transition-none" : "" }` }
                style={ { transform: `translateX(-${ index * 100 }%)` } }
                onTransitionEnd={ handleTransitionEnd }
            >
                { slides.map( ( src, i ) => (
                    <img
                        key={ i }
                        src={ src }
                        alt=""
                        loading={ i === 0 ? "eager" : "lazy" }
                        draggable={ false }
                        className="w-full h-full object-cover shrink-0 select-none"
                    />
                ) ) }
            </div>

            <div className="absolute inset-0 bg-linear-to-r from-app-green via-app-green/65 to-transparent" />

            {/* Fixed text */ }
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
                <div className="max-w-xl xl:pl-10">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-orange-300 bg-orange-300/10 rounded-full mb-5">
                        <LeafIcon className="size-3" /> Farm-Fresh & Organic
                    </span>
                    <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-5">Nourish your home
                        with <span className="text-orange-300">Earth's finest</span></h1>
                    <p className="text-base text-white/70 leading-relaxed mb-8 max-w-md">{ heroSectionData.description }</p>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/products" className="px-7 py-3 bg-orange-400 text-white font-semibold rounded-full hover:bg-orange-500 transition-all flex-center gap-2 active:scale-[0.98]">Shop Now <ArrowRightIcon className="size-4" /></Link>

                        <Link to="/products" className="px-7 py-3 bg-white/10 text-white font-semibold rounded-full hover:bg-white/20 transition-all border border-white/20">Browse Categories </Link>
                    </div>
                </div>
            </div>

            {/* Arrows (desktop, visible on hover) */ }
            <button onClick={ prev } aria-label="Previous slide" className={ `${ arrowClass } left-4` }>
                <ChevronLeftIcon className="size-5" />
            </button>
            <button onClick={ next } aria-label="Next slide" className={ `${ arrowClass } right-4` }>
                <ChevronRightIcon className="size-5" />
            </button>

            {/* Dots */ }
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
                { heroImages.map( ( _, i ) =>
                {
                    const active = i === index % count
                    return (
                        <button
                            key={ i }
                            onClick={ () => goTo( i ) }
                            aria-label={ `Go to slide ${ i + 1 }` }
                            aria-current={ active }
                            className={ `h-2 rounded-full transition-all duration-300 cursor-pointer
                                ${ active ? "w-6 bg-orange-300" : "w-2 bg-white/50 hover:bg-white/80" }` }
                        />
                    )
                } ) }
            </div>
        </section>
    )
}

export default Hero