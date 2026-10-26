import { useEffect, useRef, useState } from "react"
import { ArrowUpDownIcon, CheckIcon, ChevronDownIcon } from "lucide-react"

type Option = { value: string; label: string }

type Props = {
    value: string
    options: Option[]
    onChange: ( value: string ) => void
    ariaLabel?: string
}

const SortSelect = ( { value, options, onChange, ariaLabel = "Sort" }: Props ) =>
{
    const [ open, setOpen ] = useState( false )
    const [ activeIndex, setActiveIndex ] = useState( 0 )
    const ref = useRef<HTMLDivElement>( null )

    const selectedIndex = Math.max( 0, options.findIndex( ( o ) => o.value === value ) )
    const selected = options[ selectedIndex ]

    // close on outside click
    useEffect( () =>
    {
        if ( !open ) return
        const onDown = ( e: MouseEvent ) =>
        {
            if ( !ref.current?.contains( e.target as Node ) ) setOpen( false )
        }
        document.addEventListener( "mousedown", onDown )
        return () => document.removeEventListener( "mousedown", onDown )
    }, [ open ] )

    const toggle = () =>
    {
        setActiveIndex( selectedIndex )
        setOpen( ( o ) => !o )
    }

    const choose = ( v: string ) =>
    {
        onChange( v )
        setOpen( false )
    }

    const onKeyDown = ( e: React.KeyboardEvent ) =>
    {
        if ( e.key === "Escape" ) return setOpen( false )

        if ( e.key === "ArrowDown" || e.key === "ArrowUp" )
        {
            e.preventDefault()
            if ( !open )
            {
                setActiveIndex( selectedIndex )
                return setOpen( true )
            }
            const step = e.key === "ArrowDown" ? 1 : -1
            setActiveIndex( ( i ) => ( i + step + options.length ) % options.length )
        }

        if ( e.key === "Enter" || e.key === " " )
        {
            e.preventDefault()
            if ( open ) choose( options[ activeIndex ].value )
            else toggle()
        }
    }

    return (
        <div ref={ ref } className="relative" onKeyDown={ onKeyDown }>
            <button
                type="button"
                onClick={ toggle }
                aria-label={ ariaLabel }
                aria-haspopup="listbox"
                aria-expanded={ open }
                className={ `flex items-center gap-2 pl-3 pr-2.5 py-2 text-xs font-medium bg-white rounded-lg border transition-all cursor-pointer
                    ${ open
                        ? "border-app-green ring-2 ring-app-green/20"
                        : "border-app-border hover:border-app-green/50" }` }
            >
                <ArrowUpDownIcon className="size-3.5 text-app-text-light" />
                <span className="text-zinc-700 whitespace-nowrap">{ selected.label }</span>
                <ChevronDownIcon
                    className={ `size-3.5 text-zinc-500 transition-transform duration-300 ${ open ? "rotate-180" : "" }` }
                />
            </button>

            {/* Always mounted so it can animate in and out */ }
            <ul
                role="listbox"
                aria-hidden={ !open }
                className={ `absolute right-0 mt-2 w-48 z-30 origin-top-right bg-white rounded-xl border border-app-border shadow-xl py-1 overflow-hidden
                    transition-all duration-200 ease-out
                    ${ open
                        ? "opacity-100 scale-100 translate-y-0 visible"
                        : "opacity-0 scale-95 -translate-y-2 invisible pointer-events-none" }` }
            >
                { options.map( ( o, i ) =>
                {
                    const isSelected = o.value === value
                    return (
                        <li
                            key={ o.value }
                            role="option"
                            aria-selected={ isSelected }
                            onClick={ () => choose( o.value ) }
                            onMouseEnter={ () => setActiveIndex( i ) }
                            className={ `flex items-center justify-between gap-2 px-3.5 py-2.5 text-xs cursor-pointer transition-colors
                                ${ isSelected ? "text-orange-600 font-semibold" : "text-zinc-600" }
                                ${ i === activeIndex ? "bg-orange-50" : "" }` }
                        >
                            { o.label }
                            { isSelected && <CheckIcon className="size-3.5" /> }
                        </li>
                    )
                } ) }
            </ul>
        </div>
    )
}

export default SortSelect