import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import
    {
        ArrowLeftIcon, ArrowRightIcon, CheckIcon, Home, MinusIcon, PackageSearchIcon,
        PlusIcon, ShoppingCartIcon, StarIcon, ThumbsUpIcon,
    } from "lucide-react"
import { useCart } from "../context/cartContext"
import type { Product } from "../types"
import { categoriesData, dummyProducts } from "../assets/assets"
import ProductsCard from "../components/ProductsCard"
import ProductsGridSkeleton from "../components/ProductsGridSkeleton"

// Dummy reviews until you have a reviews API
const REVIEWS = [
    { id: 1, name: "Sneha T.", date: "4 Apr 2026", rating: 4, helpful: 5, comment: "Quality is decent but I expected it to be a bit fresher. Still a solid buy overall." },
    { id: 2, name: "Rahul M.", date: "31 Mar 2026", rating: 5, helpful: 14, comment: "Exceeded my expectations. The taste and freshness were top-notch. Five stars!" },
    { id: 3, name: "Karan P.", date: "24 Mar 2026", rating: 4, helpful: 7, comment: "Good value for the price. Packaging was neat and delivery was on time." },
    { id: 4, name: "Sneha T.", date: "17 Mar 2026", rating: 4, helpful: 9, comment: "Good value for the price. Packaging was neat and delivery was on time." },
    { id: 5, name: "Ananya S.", date: "3 Mar 2026", rating: 5, helpful: 10, comment: "Absolutely love this product! Fresh and great quality. Will definitely order again." },
    { id: 6, name: "Sneha T.", date: "18 Feb 2026", rating: 5, helpful: 3, comment: "Exceeded my expectations. The taste and freshness were top-notch. Five stars!" },
]

const initials = ( name: string ) =>
    name.split( " " ).map( ( w ) => w[ 0 ] ).join( "" ).slice( 0, 2 ).toUpperCase()

const Stars = ( { rating, size = "size-4" }: { rating: number; size?: string } ) => (
    <div className="flex items-center gap-0.5" aria-label={ `${ rating } out of 5 stars` }>
        { Array.from( { length: 5 } ).map( ( _, i ) => (
            <StarIcon
                key={ i }
                className={ `${ size } ${ i < Math.round( rating ) ? "text-app-warning fill-app-warning" : "text-gray-300 fill-gray-200" }` }
            />
        ) ) }
    </div>
)

const ReviewItem = ( { review }: { review: typeof REVIEWS[ number ] } ) =>
{
    const [ liked, setLiked ] = useState( false )

    return (
        <div className="flex gap-3">
            <div className="size-9 shrink-0 rounded-full bg-gray-100 text-zinc-600 text-xs font-semibold flex-center">
                { initials( review.name ) }
            </div>
            <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-zinc-800">{ review.name }</span>
                    <span className="text-app-text-light">· { review.date }</span>
                </div>
                <div className="mt-1"><Stars rating={ review.rating } size="size-3" /></div>
                <p className="mt-1.5 text-sm text-zinc-600 leading-relaxed">{ review.comment }</p>
                <button
                    onClick={ () => setLiked( ( l ) => !l ) }
                    className={ `mt-2 flex items-center gap-1.5 text-xs transition-colors cursor-pointer
                        ${ liked ? "text-app-green font-medium" : "text-app-text-light hover:text-app-green" }` }
                >
                    <ThumbsUpIcon className={ `size-3.5 ${ liked ? "fill-current" : "" }` } />
                    Helpful ({ review.helpful + ( liked ? 1 : 0 ) })
                </button>
            </div>
        </div>
    )
}

const ProductsPage = () =>
{
    const currency = import.meta.env.VITE_CURRENCY

    const { id } = useParams()
    const navigate = useNavigate()
    const { addToCart } = useCart()

    const [ product, setProduct ] = useState<Product | null>( null )
    const [ relatedProducts, setRelatedProducts ] = useState<Product[]>( [] )
    const [ loading, setLoading ] = useState<boolean>( true )
    const [ localQuantity, setLocalQuantity ] = useState<number>( 1 )
    const [ added, setAdded ] = useState( false )

    const fetchProduct = () =>
    {
        setLoading( true )
        const found = dummyProducts.find( ( p ) => p._id === id ) || null
        setProduct( found )

        // same category first, then fill up with others
        const others = dummyProducts.filter( ( p ) => p._id !== id )
        const sameCategory = others.filter( ( p ) => found && p.category === found.category )
        const rest = others.filter( ( p ) => !( found && p.category === found.category ) )
        setRelatedProducts( [ ...sameCategory, ...rest ].slice( 0, 5 ) )

        setLocalQuantity( 1 )
        setAdded( false )
    }

    useEffect( () =>
    {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchProduct()
        window.scrollTo( 0, 0 )
        const t = setTimeout( () => setLoading( false ), 1000 )
        return () => clearTimeout( t )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ id ] )

    const handleAddToCart = () =>
    {
        if ( !product ) return
        // addToCart takes one product, so add it once per selected quantity
        for ( let i = 0; i < localQuantity; i++ ) addToCart( product )
        setAdded( true )
        setTimeout( () => setAdded( false ), 1500 )
    }

    // ---------- Loading ----------
    if ( loading )
    {
        return (
            <div className="min-h-screen bg-app-cream">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="skeleton h-4 w-64 rounded-full mb-6" />
                    <div className="bg-white rounded-3xl p-6 sm:p-10 grid md:grid-cols-2 gap-8">
                        <div className="skeleton aspect-square rounded-2xl" />
                        <div className="space-y-4 py-4">
                            <div className="skeleton h-3 w-20 rounded-full" />
                            <div className="skeleton h-8 w-3/4 rounded-lg" />
                            <div className="skeleton h-4 w-1/3 rounded-full" />
                            <div className="skeleton h-10 w-1/2 rounded-lg" />
                            <div className="skeleton h-3 w-2/3 rounded-full" />
                            <div className="skeleton h-12 w-full rounded-xl mt-8" />
                        </div>
                    </div>
                    <div className="mt-12">
                        <ProductsGridSkeleton count={ 5 } className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4" />
                    </div>
                </div>
            </div>
        )
    }

    // ---------- Not found ----------
    if ( !product )
    {
        return (
            <div className="min-h-screen bg-app-cream flex flex-col items-center justify-center text-center px-4">
                <PackageSearchIcon className="size-14 text-app-text-light mb-4" />
                <h1 className="text-xl font-semibold text-app-green mb-1">Product not found</h1>
                <p className="text-sm text-app-text-light mb-6">It may have been removed or the link is incorrect.</p>
                <Link to="/products" className="px-5 py-2.5 text-sm font-medium text-white bg-app-green rounded-lg hover:opacity-90 transition">
                    Browse all products
                </Link>
            </div>
        )
    }

    // ---------- Derived values ----------
    const categoryName = categoriesData.find( ( c ) => c.slug === product.category )?.name ?? product.category
    const outOfStock = product.stock <= 0
    const lowStock = !outOfStock && product.stock <= 10

    const distribution = [ 5, 4, 3, 2, 1 ].map( ( star ) => ( {
        star,
        count: REVIEWS.filter( ( r ) => r.rating === star ).length,
    } ) )

    return (
        <div className="min-h-screen bg-app-cream">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* Breadcrumb */ }
                <nav className="flex items-center flex-wrap gap-2 text-sm text-app-text-light mb-4">
                    <Link to="/" className="hover:text-app-green transition-colors"><Home className="size-4" /></Link>
                    <span>/</span>
                    <Link to="/products" className="hover:text-app-green transition-colors">Products</Link>
                    <span>/</span>
                    <Link to={ `/products?category=${ product.category }` } className="hover:text-app-green transition-colors">{ categoryName }</Link>
                    <span>/</span>
                    <span className="text-app-green font-medium">{ product.name }</span>
                </nav>

                <button
                    onClick={ () => navigate( -1 ) }
                    className="flex items-center gap-1.5 text-sm text-app-text-light hover:text-app-green transition-colors mb-5 cursor-pointer"
                >
                    <ArrowLeftIcon className="size-4" /> Back
                </button>

                {/* Product card */ }
                <section className="relative bg-white rounded-3xl p-6 sm:p-10 grid md:grid-cols-2 gap-8 lg:gap-14 items-center shadow-sm">
                    { product.discount > 0 && (
                        <span className="absolute top-5 left-5 px-2.5 py-1 text-[11px] font-semibold uppercase bg-app-orange text-white rounded-full">
                            { product.discount }% OFF
                        </span>
                    ) }

                    <div className="flex-center aspect-square md:aspect-4/3">
                        <img
                            src={ product.image }
                            alt={ product.name }
                            className="max-h-full max-w-full object-contain"
                        />
                    </div>

                    <div>
                        <p className="text-xs font-medium text-app-text-light">{ categoryName }</p>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-app-green mt-1">{ product.name }</h1>

                        <div className="flex items-center gap-2 mt-3">
                            <Stars rating={ product.rating } />
                            <span className="text-sm font-semibold text-zinc-800">{ product.rating }</span>
                            <span className="text-sm text-app-text-light">({ product.reviewCount } reviews)</span>
                        </div>

                        <div className="flex items-end gap-3 mt-5">
                            <span className="text-4xl font-semibold text-app-green">{ currency }{ product.price.toFixed( 2 ) }</span>
                            { product.originalPrice > product.price && (
                                <span className="text-base text-app-text-light line-through mb-1">
                                    { currency }{ product.originalPrice.toFixed( 2 ) }
                                </span>
                            ) }
                            <span className="text-sm text-app-text-light mb-1">/ { product.unit }</span>
                        </div>

                        <p className="text-sm text-app-text-light mt-5 leading-relaxed">{ product.description }</p>

                        <p className={ `flex items-center gap-1.5 text-sm font-medium mt-5
                            ${ outOfStock ? "text-red-500" : lowStock ? "text-orange-500" : "text-green-600" }` }>
                            { outOfStock ? "Out of stock" : (
                                <>
                                    <CheckIcon className="size-4" />
                                    { lowStock ? `Only ${ product.stock } left` : `In Stock (${ product.stock } available)` }
                                </>
                            ) }
                        </p>

                        {/* Quantity + Add to cart */ }
                        <div className="flex items-stretch gap-3 mt-6">
                            <div className="flex items-center border border-app-border rounded-xl overflow-hidden">
                                <button
                                    onClick={ () => setLocalQuantity( ( q ) => Math.max( 1, q - 1 ) ) }
                                    disabled={ outOfStock || localQuantity <= 1 }
                                    aria-label="Decrease quantity"
                                    className="px-3.5 h-full text-zinc-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                                >
                                    <MinusIcon className="size-4" />
                                </button>
                                <span className="w-10 text-center text-sm font-medium" aria-live="polite">{ localQuantity }</span>
                                <button
                                    onClick={ () => setLocalQuantity( ( q ) => Math.min( product.stock, q + 1 ) ) }
                                    disabled={ outOfStock || localQuantity >= product.stock }
                                    aria-label="Increase quantity"
                                    className="px-3.5 h-full text-zinc-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                                >
                                    <PlusIcon className="size-4" />
                                </button>
                            </div>

                            <button
                                onClick={ handleAddToCart }
                                disabled={ outOfStock }
                                className={ `flex-1 flex-center gap-2 py-3 text-sm font-semibold text-white rounded-xl transition-all active:scale-[0.98]
                                    disabled:opacity-50 disabled:pointer-events-none cursor-pointer
                                    ${ added ? "bg-app-green" : "bg-app-orange hover:bg-app-orange-dark" }` }
                            >
                                { added
                                    ? <><CheckIcon className="size-4" /> Added to Cart</>
                                    : <><ShoppingCartIcon className="size-4" /> Add to Cart</> }
                            </button>
                        </div>
                    </div>
                </section>

                {/* Customer reviews */ }
                <section className="mt-12">
                    <h2 className="text-xl font-semibold text-app-green mb-4">Customer Reviews</h2>

                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-8 pb-6 border-b border-app-border">
                            <div className="flex flex-col items-center sm:px-8">
                                <span className="text-5xl font-semibold text-app-green">{ product.rating }</span>
                                <div className="mt-2"><Stars rating={ product.rating } /></div>
                                <span className="text-xs text-app-text-light mt-1.5">{ product.reviewCount } reviews</span>
                            </div>

                            <div className="flex-1 space-y-2">
                                { distribution.map( ( { star, count } ) => (
                                    <div key={ star } className="flex items-center gap-3 text-xs text-app-text-light">
                                        <span className="w-6 shrink-0">{ star } ★</span>
                                        <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-app-warning transition-all duration-500"
                                                style={ { width: `${ ( count / REVIEWS.length ) * 100 }%` } }
                                            />
                                        </div>
                                        <span className="w-4 text-right">{ count }</span>
                                    </div>
                                ) ) }
                            </div>
                        </div>

                        <div className="pt-6 space-y-6">
                            { REVIEWS.map( ( review ) => <ReviewItem key={ review.id } review={ review } /> ) }
                        </div>
                    </div>
                </section>

                {/* Related products */ }
                { relatedProducts.length > 0 && (
                    <section className="mt-12 pb-10">
                        <div className="flex items-end justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-semibold text-app-green">Related Products</h2>
                                <p className="text-xs text-app-text-light mt-0.5">More from { categoryName.toLowerCase() }</p>
                            </div>
                            <Link
                                to={ `/products?category=${ product.category }` }
                                onClick={ () =>
                                {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
                            >
                                View All <ArrowRightIcon className="size-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                            { relatedProducts.map( ( p ) => <ProductsCard key={ p._id } product={ p } /> ) }
                        </div>
                    </section>
                ) }
            </div>
        </div>
    )
}

export default ProductsPage