import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Home, PackageSearchIcon, SearchIcon, XIcon } from "lucide-react"
import type { Product } from "../types"
import { categoriesData, dummyProducts } from "../assets/assets"
import ProductsCard from "../components/ProductsCard"
import ProductsGridSkeleton from "../components/ProductsGridSkeleton"
import SortSelect from "../components/SortSelect"

const SORT_OPTIONS = [
    { value: "", label: "Best match" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "rating", label: "Top Rated" },
    { value: "discount", label: "Biggest Discount" },
]

function SearchResults ()
{
    const [ products, setProducts ] = useState<Product[]>( [] )
    const [ loading, setLoading ] = useState<boolean>( true )

    const [ searchParams, setSearchParams ] = useSearchParams()

    const query = ( searchParams.get( "q" ) || "" ).trim()
    const sort = searchParams.get( "sort" ) || ""

    const fetchProducts = () =>
    {
        // TODO: replace with your search API call
        if ( !query )
        {
            setProducts( [] )
            return
        }

        // every word must match the product name or its category
        const words = query.toLowerCase().split( /\s+/ ).filter( Boolean )
        let result = dummyProducts.filter( ( p ) =>
        {
            const text = `${ p.name } ${ p.category }`.toLowerCase()
            return words.every( ( w ) => text.includes( w ) )
        } )

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

        setProducts( result )
    }

    useEffect( () =>
    {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading( true )

        fetchProducts()
        const t = setTimeout( () => setLoading( false ), 600 )
        return () => clearTimeout( t )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ query, sort ] )

    const updateParams = ( key: string, value: string ) =>
    {
        const next = new URLSearchParams( searchParams.toString() )
        if ( value ) next.set( key, value )
        else next.delete( key )
        setSearchParams( next )
    }

    const handleSearch = ( e: React.FormEvent<HTMLFormElement> ) =>
    {
        e.preventDefault()
        const value = ( new FormData( e.currentTarget ).get( "q" ) as string ).trim()
        if ( value ) updateParams( "q", value )
    }

    return (
        <div className="min-h-screen bg-app-cream">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                {/* Breadcrumb */ }
                <nav className="flex items-center gap-2 text-sm text-app-text-light mb-6">
                    <Link to="/" className="hover:text-app-green transition-colors">
                        <Home className="size-4" />
                    </Link>
                    <span>/</span>
                    <span className="text-app-green font-medium">Search Results</span>
                </nav>

                {/* Header */ }
                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-2xl font-semibold text-app-green wrap-break-word">
                            { query ? <>Results for <span className="text-orange-500">“{ query }”</span></> : "Search" }
                        </h1>
                        { query && (
                            <p className="text-xs text-app-text-light mt-1">
                                { loading ? "Searching..." : `${ products.length } ${ products.length === 1 ? "product" : "products" } found` }
                            </p>
                        ) }
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Refine search (key resets the field when the query changes) */ }
                        <form onSubmit={ handleSearch } role="search" className="relative w-full sm:w-72">
                            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-app-text-light pointer-events-none" />
                            <input
                                key={ query }
                                name="q"
                                type="search"
                                defaultValue={ query }
                                placeholder="Search for groceries..."
                                aria-label="Search products"
                                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white rounded-full border border-app-border outline-none focus:border-app-green focus:ring-2 focus:ring-app-green/20 transition-all"
                            />
                        </form>

                        { query && products.length > 1 && (
                            <SortSelect
                                value={ sort }
                                options={ SORT_OPTIONS }
                                onChange={ ( v ) => updateParams( "sort", v ) }
                                ariaLabel="Sort results"
                            />
                        ) }
                    </div>
                </div>

                {/* Content */ }
                { !query ? (
                    // nothing searched yet
                    <div className="flex flex-col items-center text-center py-20">
                        <div className="size-16 mb-4 rounded-full bg-app-green/10 text-app-green flex-center">
                            <SearchIcon className="size-8" />
                        </div>
                        <h2 className="text-lg font-semibold text-app-green mb-1">What are you looking for?</h2>
                        <p className="text-sm text-app-text-light mb-6">Type a product name above to start searching.</p>
                        <Link to="/products" className="px-5 py-2.5 text-sm font-medium text-white bg-app-green rounded-lg hover:opacity-90 transition">
                            Browse all products
                        </Link>
                    </div>
                ) : loading ? (
                    <ProductsGridSkeleton
                        count={ 10 }
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                    />
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center text-center py-16">
                        <PackageSearchIcon className="size-14 text-app-text-light mb-4" />
                        <h2 className="text-lg font-semibold text-app-green mb-1">No results for “{ query }”</h2>
                        <p className="text-sm text-app-text-light mb-6 max-w-sm">
                            Check the spelling, try a shorter or more general word, or browse a category below.
                        </p>

                        <div className="flex flex-wrap justify-center gap-2 max-w-xl mb-8">
                            { categoriesData.map( ( c ) => (
                                <Link
                                    key={ c.slug }
                                    to={ `/products?category=${ c.slug }` }
                                    className="px-4 py-2 text-xs font-medium bg-white text-zinc-600 rounded-full hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                >
                                    { c.name }
                                </Link>
                            ) ) }
                        </div>

                                <div className="flex flex-wrap items-center justify-center gap-3">
                                    <button
                                        onClick={ () => updateParams( "q", "" ) }
                                        className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-orange-600 bg-white border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer"
                                    >
                                        <XIcon className="size-4" /> Clear search
                                    </button>
                                    <Link
                                        to="/products"
                                        className="px-5 py-2.5 text-sm font-medium text-white bg-app-green rounded-lg hover:opacity-90 transition"
                                    >
                                        Browse all products
                                    </Link>
                                </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-10">
                        { products.map( ( product ) => (
                            <ProductsCard key={ product._id } product={ product } />
                        ) ) }
                    </div>
                ) }
            </div>
        </div>
    )
}

export default SearchResults