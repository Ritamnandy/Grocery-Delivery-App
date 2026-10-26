import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Home, SlidersHorizontalIcon, XIcon, ChevronLeftIcon, ChevronRightIcon, PackageSearchIcon } from "lucide-react"
import type { Product } from "../types"
import { categoriesData, dummyProducts } from "../assets/assets"
import ProductsCard from "../components/ProductsCard"
import SortSelect from "../components/SortSelect"
import ProductsGridSkeleton from "../components/ProductsGridSkeleton"

const PAGE_SIZE = 12

const SORT_OPTIONS = [
    { value: "", label: "Featured" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "rating", label: "Top Rated" },
    { value: "discount", label: "Biggest Discount" },
]

export default function Products ()
{
    const [ searchParams, setSearchParams ] = useSearchParams()

    const [ products, setProducts ] = useState<Product[]>( [] )
    const [ totalCount, setTotalCount ] = useState( 0 )
    const [ totalPages, setTotalPages ] = useState( 0 )
    const [ loading, setLoading ] = useState( true )
    const [ mobileFiltersOpen, setMobileFiltersOpen ] = useState( false )

    const category = searchParams.get( "category" ) || ""
    const organic = searchParams.get( "organic" ) || ""
    const sort = searchParams.get( "sort" ) || ""
    const page = Number( searchParams.get( "page" ) || 1 )
    const maxPrice = Number( searchParams.get( "maxPrice" ) || "" )
    const minPrice = Number( searchParams.get( "minPrice" ) || "" )

    const fetchProducts = async () =>
    {
        setLoading( true )

        // filter
        let result = dummyProducts.filter( ( product ) =>
            ( category === "" || product.category === category ) &&
            ( !minPrice || product.price >= minPrice ) &&
            ( !maxPrice || product.price <= maxPrice )
        )

        // sort
        switch ( sort )
        {
            case "price_asc":
                result = [ ...result ].sort( ( a, b ) => a.price - b.price )
                break
            case "price_desc":
                result = [ ...result ].sort( ( a, b ) => b.price - a.price )
                break
            case "rating":
                result = [ ...result ].sort( ( a, b ) => b.rating - a.rating )
                break
            case "discount":
                result = [ ...result ].sort( ( a, b ) => b.discount - a.discount )
                break
        }

        // paginate
        const pages = Math.ceil( result.length / PAGE_SIZE )
        setTotalCount( result.length )
        setTotalPages( pages )
        setProducts( result.slice( ( page - 1 ) * PAGE_SIZE, page * PAGE_SIZE ) )
        
    }

    const upDateFilters = ( key: string, value: string ) =>
    {
        const newParams = new URLSearchParams( searchParams.toString() )
        if ( value )
        {
            newParams.set( key, value )
        } else
        {
            newParams.delete( key )
        }
        if ( key !== "page" )
        {
            newParams.delete( "page" )
        }
        setSearchParams( newParams )
    }

    const clearFilters = () =>
    {
        setSearchParams( {} )
    }

    const goToPage = ( p: number ) =>
    {
        upDateFilters( "page", p === 1 ? "" : String( p ) )
        window.scrollTo( { top: 0, behavior: "smooth" } )
    }

    const activeCategory = categoriesData.find( ( c ) => c.slug === category )
    const hasFilters = Boolean( category || organic || sort || maxPrice || minPrice )

    useEffect( () =>
    {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchProducts()
        setTimeout(() => {
            setLoading(false)
        }, 1000)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ category, organic, sort, page, maxPrice, minPrice ] )

    // Filters panel: shared by the desktop sidebar and the mobile drawer
    const filtersPanel = (
        <div className="space-y-6">
            {/* Categories */ }
            <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-app-text-light mb-3">Categories</h3>
                <ul className="space-y-1">
                    <li>
                        <button
                            onClick={ () => { upDateFilters( "category", "" ); setMobileFiltersOpen( false ) } }
                            className={ `w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors
                                ${ category === ""
                                    ? "bg-app-green text-white"
                                    : "text-zinc-600 hover:bg-orange-50 hover:text-orange-600" }` }
                        >
                            All Categories
                        </button>
                    </li>
                    { categoriesData.map( ( c ) => (
                        <li key={ c.slug }>
                            <button
                                onClick={ () => { upDateFilters( "category", c.slug ); setMobileFiltersOpen( false ) } }
                                className={ `w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors
                                    ${ category === c.slug
                                        ? "bg-app-green text-white"
                                        : "text-zinc-600 hover:bg-orange-50 hover:text-orange-600" }` }
                            >
                                { c.name }
                            </button>
                        </li>
                    ) ) }
                </ul>
            </div>

            {/* Price range: applied on blur / Enter. `key` resets the inputs when filters are cleared */ }
            <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-app-text-light mb-3">Price Range</h3>
                <div className="flex items-center gap-2">
                    <input
                        key={ `min-${ minPrice }` }
                        type="number"
                        min={ 0 }
                        placeholder="Min"
                        defaultValue={ minPrice || "" }
                        onBlur={ ( e ) => e.target.value !== String( minPrice || "" ) && upDateFilters( "minPrice", e.target.value ) }
                        onKeyDown={ ( e ) => e.key === "Enter" && e.currentTarget.blur() }
                        className="w-full min-w-0 px-3 py-2 text-xs bg-white rounded-lg border border-app-border outline-none focus:border-app-green focus:ring-2 focus:ring-app-green/20 transition-all"
                    />
                    <span className="text-app-text-light text-xs">–</span>
                    <input
                        key={ `max-${ maxPrice }` }
                        type="number"
                        min={ 0 }
                        placeholder="Max"
                        defaultValue={ maxPrice || "" }
                        onBlur={ ( e ) => e.target.value !== String( maxPrice || "" ) && upDateFilters( "maxPrice", e.target.value ) }
                        onKeyDown={ ( e ) => e.key === "Enter" && e.currentTarget.blur() }
                        className="w-full min-w-0 px-3 py-2 text-xs bg-white rounded-lg border border-app-border outline-none focus:border-app-green focus:ring-2 focus:ring-app-green/20 transition-all"
                    />
                </div>
            </div>

            { hasFilters && (
                <button
                    onClick={ () => { clearFilters(); setMobileFiltersOpen( false ) } }
                    className="w-full py-2 text-xs font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
                >
                    Clear all filters
                </button>
            ) }
        </div>
    )

    return (
        <div className="min-h-screen bg-app-cream">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Breadcrumb */ }
                <nav className="flex items-center gap-2 text-sm text-app-text-light mb-6">
                    <Link to="/" className="hover:text-app-green transition-colors">
                        <Home className="size-4" />
                    </Link>
                    <span>/</span>
                    <span className="text-app-green font-medium">{ activeCategory ? activeCategory.name : "All Products" }</span>
                </nav>

                <div className="flex gap-8 xl:gap-10">
                    {/* Sidebar for desktop */ }
                    <aside className="hidden lg:block w-56 shrink-0">
                        <div className="sticky top-24 bg-white rounded-2xl shadow p-4">
                            { filtersPanel }
                        </div>
                    </aside>

                    {/* Main content */ }
                    <main className="flex-1 min-w-0">
                        {/* Header: title, count, sort, mobile filter button */ }
                        <div className="flex items-start sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-xl font-semibold text-app-green">
                                    { activeCategory ? activeCategory.name : "All Products" }
                                </h1>
                                <p className="text-xs text-app-text-light mt-0.5">
                                    { loading ? "Loading..." : `${ totalCount } ${ totalCount === 1 ? "product" : "products" } found` }
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={ () => setMobileFiltersOpen( true ) }
                                    className="lg:hidden flex items-center gap-2 px-3 py-2 text-xs font-medium bg-white border border-app-border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <SlidersHorizontalIcon className="size-4" /> Filters
                                    { hasFilters && <span className="size-1.5 rounded-full bg-app-orange" /> }
                                </button>

                                <SortSelect
                                    value={ sort }
                                    options={ SORT_OPTIONS }
                                    onChange={ ( v ) => upDateFilters( "sort", v ) }
                                    ariaLabel="Sort products"
                                />
                            </div>
                        </div>

                        {/* Grid */ }
                        { loading ? (
                            <ProductsGridSkeleton count={ 10 } />
                        ) : products.length === 0 ? (
                            <div className="flex flex-col items-center text-center py-20">
                                <PackageSearchIcon className="size-14 text-app-text-light mb-4" />
                                <h2 className="text-lg font-semibold text-app-green mb-1">No products found</h2>
                                <p className="text-sm text-app-text-light mb-6">Try changing or clearing your filters.</p>
                                <button
                                    onClick={ clearFilters }
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-app-green rounded-lg hover:opacity-90 transition"
                                >
                                    Clear filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                { products.map( ( product ) => (
                                    <ProductsCard key={ product._id } product={ product } />
                                ) ) }
                            </div>
                        ) }

                        {/* Pagination */ }
                        { !loading && totalPages > 1 && (
                            <div className="flex items-center justify-center gap-1.5 mt-10">
                                <button
                                    onClick={ () => goToPage( page - 1 ) }
                                    disabled={ page <= 1 }
                                    aria-label="Previous page"
                                    className="size-9 flex-center rounded-lg bg-white border border-app-border text-zinc-600 hover:bg-orange-50 hover:text-orange-600 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                                >
                                    <ChevronLeftIcon className="size-4" />
                                </button>

                                { Array.from( { length: totalPages }, ( _, i ) => i + 1 ).map( ( p ) => (
                                    <button
                                        key={ p }
                                        onClick={ () => goToPage( p ) }
                                        aria-current={ p === page ? "page" : undefined }
                                        className={ `size-9 flex-center rounded-lg text-sm font-medium transition-colors
                                            ${ p === page
                                                ? "bg-app-green text-white"
                                                : "bg-white border border-app-border text-zinc-600 hover:bg-orange-50 hover:text-orange-600" }` }
                                    >
                                        { p }
                                    </button>
                                ) ) }

                                <button
                                    onClick={ () => goToPage( page + 1 ) }
                                    disabled={ page >= totalPages }
                                    aria-label="Next page"
                                    className="size-9 flex-center rounded-lg bg-white border border-app-border text-zinc-600 hover:bg-orange-50 hover:text-orange-600 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                                >
                                    <ChevronRightIcon className="size-4" />
                                </button>
                            </div>
                        ) }
                    </main>
                </div>
            </div>

            {/* Mobile filter drawer: always mounted, slides in from the left */ }
            <div
                className={ `lg:hidden fixed inset-0 z-50 transition-[visibility] duration-300
                    ${ mobileFiltersOpen ? "visible" : "invisible" }` }
            >
                <div
                    onClick={ () => setMobileFiltersOpen( false ) }
                    className={ `absolute inset-0 bg-black/50 transition-opacity duration-300 ${ mobileFiltersOpen ? "opacity-100" : "opacity-0" }` }
                />
                <div
                    className={ `absolute left-0 top-0 h-full w-72 max-w-[85%] bg-white p-5 overflow-y-auto shadow-xl
                        transition-transform duration-300 ease-out
                        ${ mobileFiltersOpen ? "translate-x-0" : "-translate-x-full" }` }
                >
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-base font-semibold text-app-green">Filters</h2>
                        <button
                            onClick={ () => setMobileFiltersOpen( false ) }
                            aria-label="Close filters"
                            className="p-1.5 rounded-lg text-zinc-500 hover:bg-gray-100 transition-colors"
                        >
                            <XIcon className="size-5" />
                        </button>
                    </div>
                    { filtersPanel }
                </div>
            </div>
        </div>
    )
}