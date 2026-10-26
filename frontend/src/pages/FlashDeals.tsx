import { useEffect, useState } from "react"
import { ZapIcon, PackageSearchIcon } from "lucide-react"
import { Link } from "react-router-dom"
import type { Product } from "../types"
import { dummyProducts } from "../assets/assets"
import ProductsCard from "../components/ProductsCard"
import ProductsGridSkeleton from "../components/ProductsGridSkeleton"

const FlashDeals = () =>
{
    const [ products, setProducts ] = useState<Product[]>( [] )
    const [ loading, setLoading ] = useState<boolean>( true )

    const fetchProducts = () =>
    {
        setProducts( dummyProducts.filter( ( product ) => product.stock > 0 ) )
    }

    useEffect( () =>
    {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchProducts()
        const t = setTimeout( () => setLoading( false ), 1000 )
        return () => clearTimeout( t ) // avoids a state update after unmount
    }, [] )

    return (
        <div className="min-h-screen bg-app-cream">
            {/* Banner */ }
            <div className="bg-linear-to-r from-app-orange to-app-orange-dark text-white py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="flex items-center justify-center gap-2 text-2xl sm:text-3xl font-semibold">
                        <ZapIcon className="size-6 fill-current" />
                        Flash Deals
                        <ZapIcon className="size-6 fill-current" />
                    </h1>
                    <p className="mt-2 text-sm text-white/80 max-w-md mx-auto leading-relaxed">
                        Limited-time offers on your favorite organic products. Grab them before they're gone!
                    </p>
                </div>
            </div>

            {/* Products */ }
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                { loading ? (
                    <ProductsGridSkeleton count={ 10 } />
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center text-center py-20">
                        <PackageSearchIcon className="size-14 text-app-text-light mb-4" />
                        <h2 className="text-lg font-semibold text-app-green mb-1">No deals right now</h2>
                        <p className="text-sm text-app-text-light mb-6">Check back soon for new offers.</p>
                        <Link
                            to="/products"
                            className="px-5 py-2.5 text-sm font-medium text-white bg-app-green rounded-lg hover:opacity-90 transition"
                        >
                            Browse all products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        { products.map( ( product ) => (
                            <ProductsCard key={ product._id } product={ product } />
                        ) ) }
                    </div>
                ) }
            </div>
        </div>
    )
}

export default FlashDeals