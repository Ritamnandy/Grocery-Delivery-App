import { useEffect, useRef, useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import
{
    ArrowUpRightIcon, BikeIcon, ChevronDownIcon, LogOutIcon, MapPinIcon, MenuIcon,
    PackageIcon, SearchIcon, ShieldIcon, ShoppingCartIcon, UserIcon, XIcon,
} from "lucide-react"
import { getUserName } from "../utils/userName"

const MenuLink = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Products" },
    { to: "/deals", label: "Deals" },
]

// Home is the logo on mobile, so the dropdown only lists the other links
const mobileDropdownLinks = MenuLink.filter( ( l ) => l.to !== "/" )

const dropdownLink =
    "flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"

const NavBar = () =>
{
    const user = {
        name: "John Doe",
        email: "john.doe@example.com",
        isAdmin: true
    }

    const { cartCount, setIsCartOpen } = {
        cartCount: 5,
        setIsCartOpen: ( _data: boolean ) => { },
    }

    const [ searchQuery, setSearchQuery ] = useState( "" )
    const [ searchOpen, setSearchOpen ] = useState( false )
    const [ userMenuOpen, setUserMenuOpen ] = useState( false )

    const desktopInputRef = useRef<HTMLInputElement>( null )
    const mobileInputRef = useRef<HTMLInputElement>( null )
    const navigate = useNavigate()

    // focus the right search input after the open animation starts
    useEffect( () =>
    {
        if ( !searchOpen ) return
        const t = setTimeout( () =>
        {
            const isDesktop = window.matchMedia( "(min-width: 1024px)" ).matches
                ; ( isDesktop ? desktopInputRef : mobileInputRef ).current?.focus()
        }, 150 )
        return () => clearTimeout( t )
    }, [ searchOpen ] )

    // Esc closes every open panel
    useEffect( () =>
    {
        const onKey = ( e: KeyboardEvent ) =>
        {
            if ( e.key !== "Escape" ) return
            setUserMenuOpen( false )
            setSearchOpen( false )
        }
        document.addEventListener( "keydown", onKey )
        return () => document.removeEventListener( "keydown", onKey )
    }, [] )

    const closeSearch = () =>
    {
        setSearchOpen( false )
        setSearchQuery( "" )
    }

    const openSearch = () =>
    {
        setUserMenuOpen( false )
        setSearchOpen( true )
    }

    const handleSearch = ( e: React.SubmitEvent ) =>
    {
        e.preventDefault()
        if ( !searchQuery.trim() ) return
        navigate( `/search?q=${ encodeURIComponent( searchQuery.trim() ) }` )
        closeSearch()
    }

    const handleLogout = () =>
    {
        setUserMenuOpen( false )
        navigate( "/" )
        console.log( "Logout" )
    }

    const toggleUserMenu = () =>
    {
        setUserMenuOpen( ( o ) => !o )
        setSearchOpen( false )
    }

    return (
        <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-app-border ">
            {/* Mobile: flex. Desktop (md+): 3 columns, so the middle column is truly centered */ }
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr] gap-4 ">

                {/* Left: Logo */ }
                <Link to="/" className="flex items-center gap-2 text-[22px] font-semibold text-app-green shrink-0 justify-self-start">
                    <BikeIcon size={ 24 } />
                    InstantMart
                </Link>

                {/* Center: desktop navigation */ }
                <div className="hidden md:flex items-center gap-14">
                    { MenuLink.map( ( { to, label } ) => (
                        <NavLink
                            key={ to }
                            to={ to }
                            onClick={ () => window.scrollTo( { top: 0, behavior: "smooth" } ) }
                            className={ ( { isActive } ) =>
                                `relative py-1.5 text-sm font-medium tracking-wide transition-colors duration-300
                                after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-full after:rounded-full
                                after:bg-orange-500 after:origin-left after:transition-transform after:duration-300
                                ${ isActive
                                    ? "text-orange-500 after:scale-x-100"
                                    : "text-gray-600 hover:text-orange-500 after:scale-x-0 hover:after:scale-x-100" }`
                            }
                        >
                            { label }
                        </NavLink>
                    ) ) }
                </div>

                {/* Right: actions */ }
                <div className="flex items-center gap-1 sm:gap-2 justify-self-end">

                    {/* Search, desktop (lg+): icon expands inline into an input */ }
                    <form onSubmit={ handleSearch } className="hidden lg:block">
                        <div
                            className={ `flex  items-center overflow-hidden rounded-full transition-all duration-300 ease-out
                                ${ searchOpen
                                    ? "w-72 bg-orange-50 ring-1 ring-app-orange/30 focus-within:ring-app-orange/60 "
                                    : "w-9 hover:bg-gray-100" }` }
                        >
                            <button
                                type={ searchOpen ? "submit" : "button" }
                                onClick={ () => !searchOpen && openSearch() }
                                aria-label={ searchOpen ? "Submit search" : "Open search" }
                                className="p-2 shrink-0 text-zinc-600 hover:text-orange-500 transition-colors cursor-pointer active:scale-95"
                            >
                                <SearchIcon className="size-5" />
                            </button>

                            <input
                                ref={ desktopInputRef }
                                type="text"
                                value={ searchQuery }
                                tabIndex={ searchOpen ? 0 : -1 }
                                onChange={ ( e ) => setSearchQuery( e.target.value ) }
                                placeholder="Search groceries..."
                                className={ ` bg-transparent text-sm outline-none transition-opacity duration-200
                                    ${ searchOpen ? "w-full opacity-100" : "w-0 opacity-0" }` }
                            />

                            { searchOpen && (
                                <button
                                    type="button"
                                    onClick={ closeSearch }
                                    aria-label="Close search"
                                    className="p-2 shrink-0 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                                >
                                    <XIcon className="size-4" />
                                </button>
                            ) }
                        </div>
                    </form>

                    {/* Search, below lg: icon toggles a bar under the navbar */ }
                    <button
                        type="button"
                        onClick={ () => ( searchOpen ? closeSearch() : openSearch() ) }
                        aria-label="Toggle search"
                        className="lg:hidden p-2 rounded-lg text-zinc-600 hover:bg-gray-100 transition-colors"
                    >
                        { searchOpen ? <XIcon className="size-5" /> : <SearchIcon className="size-5" /> }
                    </button>

                    {/* Cart */ }
                    <button
                        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={ () => setIsCartOpen( true ) }
                        aria-label="Open cart"
                    >
                        <ShoppingCartIcon className="size-5 text-zinc-700" />
                        { cartCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-app-orange text-white text-[10px] font-medium rounded-full flex-center">
                                { cartCount }
                            </span>
                        ) }
                    </button>

                    {/* User / menu trigger + dropdown */ }
                    <div className="relative">
                        { user ? (
                            <button
                                className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                                onClick={ toggleUserMenu }
                                aria-label="Account menu"
                                aria-expanded={ userMenuOpen }
                            >
                                <div className="size-8 rounded-full bg-app-green text-white text-sm font-medium flex-center">
                                    { getUserName(user.name) }
                                </div>
                                <ChevronDownIcon
                                    className={ `size-3.5 text-zinc-500 transition-transform duration-300 ${ userMenuOpen ? "rotate-180" : "" }` }
                                />
                            </button>
                        ) : (
                            <>
                                {/* Desktop: Sign In button */ }
                                <Link
                                    to="/login"
                                    className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium bg-app-orange text-white rounded-lg hover:bg-app-orange/90 transition-colors"
                                >
                                    <UserIcon size={ 16 } /> Sign In
                                </Link>

                                {/* Mobile: hamburger / X opens the dropdown */ }
                                <button
                                    type="button"
                                    onClick={ toggleUserMenu }
                                    aria-label="Toggle menu"
                                    aria-expanded={ userMenuOpen }
                                    className="md:hidden p-2 rounded-lg text-zinc-700 hover:bg-gray-100 transition-colors"
                                >
                                    { userMenuOpen ? <XIcon className="size-5" /> : <MenuIcon className="size-5" /> }
                                </button>
                            </>
                        ) }

                        {/* Click-outside layer (only while open) */ }
                        { userMenuOpen && <div className="fixed inset-0 z-40" onClick={ () => setUserMenuOpen( false ) } /> }

                        {/* Dropdown card: always mounted, animated with transitions.
                            Logged-out users only get it on mobile (desktop has the Sign In button). */ }
                        <div
                            aria-hidden={ !userMenuOpen }
                            className={ `absolute right-0 mt-2 w-60 z-50 origin-top-right bg-white rounded-xl border border-app-border shadow-xl overflow-hidden
                                transition-all duration-200 ease-out
                                ${ user ? "" : "md:hidden" }
                                ${ userMenuOpen
                                    ? "opacity-100 scale-100 translate-y-0 visible"
                                    : "opacity-0 scale-95 -translate-y-2 invisible pointer-events-none" }` }
                        >
                            { user && (
                                <div className="px-4 py-3 border-b border-app-border bg-app-cream/60">
                                    <p className="text-sm font-semibold text-app-green truncate">{ user.name }</p>
                                    <p className="text-xs text-app-text-light truncate">{ user.email }</p>
                                </div>
                            ) }

                            <div className="py-1" onClick={ () => setUserMenuOpen( false ) }>
                                { !user && (
                                    <Link to="/login" className={ dropdownLink }>
                                        <UserIcon className="size-4" /> Sign In
                                    </Link>
                                ) }

                                { user && (
                                    <>
                                        <Link to="/myorders" className={ dropdownLink }>
                                            <PackageIcon className="size-4" /> My Orders
                                        </Link>
                                        <Link to="/addresses" className={ dropdownLink }>
                                            <MapPinIcon className="size-4" /> Addresses
                                        </Link>
                                    </>
                                ) }

                                {/* Products / Deals: mobile only (desktop has them in the centered nav) */ }
                                { mobileDropdownLinks.map( ( { to, label } ) => (
                                    <Link
                                        key={ to }
                                        to={ to }
                                        onClick={ () => window.scrollTo( { top: 0, behavior: "smooth" } ) }
                                        className={ `${ dropdownLink } md:hidden` }
                                    >
                                        <ArrowUpRightIcon className="size-4" /> { label }
                                    </Link>
                                ) ) }

                                { user?.isAdmin && (
                                    <Link to="/admin/products" className={ dropdownLink }>
                                        <ShieldIcon className="size-4" />
                                        <span className="text-app-orange-dark">Admin Panel</span>
                                    </Link>
                                ) }
                            </div>

                            { user && (
                                <div className="border-t border-app-border py-1">
                                    <button
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-app-error hover:bg-red-50 w-full transition-colors"
                                        onClick={ handleLogout }
                                    >
                                        <LogOutIcon className="size-4" /> Logout
                                    </button>
                                </div>
                            ) }
                        </div>
                    </div>
                </div>
            </div>

            {/* Search bar under navbar (below lg): height animates 0 -> auto */ }
            <div
                className={ `lg:hidden grid transition-[grid-template-rows] duration-300 ease-out
                    ${ searchOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]" }` }
            >
                <div className={ `overflow-hidden transition-[visibility] duration-300 ${ searchOpen ? "visible" : "invisible" }` }>
                    <form onSubmit={ handleSearch } className="px-4 pt-1 pb-3">
                        <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-full border border-app-orange/30 focus-within:border-app-orange/60 transition-colors">
                            <SearchIcon className="size-4 text-zinc-400 shrink-0" />
                            <input
                                ref={ mobileInputRef }
                                type="text"
                                value={ searchQuery }
                                tabIndex={ searchOpen ? 0 : -1 }
                                onChange={ ( e ) => setSearchQuery( e.target.value ) }
                                placeholder="Search for groceries..."
                                className="w-full bg-transparent text-sm outline-none"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </nav>
    )
}

export default NavBar