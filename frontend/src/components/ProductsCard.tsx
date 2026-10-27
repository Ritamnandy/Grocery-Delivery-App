

import { useNavigate } from "react-router-dom"
import type { Product } from "../types"
import { PlusIcon, Star } from "lucide-react"
import { useCart } from "../context/cartContext"

type Props = {
    product: Product
}


function ProductsCard ( { product }: Props )
{
    const currency = import.meta.env.VITE_CURRENCY
    const navigate = useNavigate()

    const { addToCart } = useCart()

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/3 hover:shadow-xl hover:shadow-app-green/10 hover:-translate-y-1 transition-all duration-300 group cursor-pointer" onClick={ () =>
        {
            navigate( `/products/${ product._id }` )
            scrollTo( 0, 0 )
        } }>
            {/* Image */ }
            <div className="relative aspect-square overflow-hidden">
                <img src={ product.image } alt={ product.name } className="w-full h-full object-cover p-4 group-hover:p-2 group-hover:scale-105 transition-all duration-500" />
                {/* Badge */ }
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">

                    {
                        product.discount > 0 && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-app-orange text-white rounded-full">{ `${ product.discount }% OFF` }</span>
                        )
                    }
                </div>
            </div>

            {/* Info */ }

            <div className="p-3.5 text-zinc-700">
                <h3 className="text-sm leading-snug mb-1.5 line-clamp-2">{ product.name }</h3>

                {/* Rating */ }
                {
                    product.rating > 0 && (
                        <div className="flex items-center gap-1 mb-2">

                            <Star className="size-3 text-app-warning fill-app-warning" />
                            <span className="text-xs text-app-warning fill-app-warning">
                                {
                                    product.rating
                                }
                            </span>
                            <span className="text-xs text-app-text-light">
                                ({
                                    product.reviewCount
                                })
                            </span>
                        </div>
                    )
                }

                {/* price & Add btn */ }
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 truncate">
                        <span className="text-base font-medium ">{ currency }{ product.price.toFixed( 1 ) }</span>
                        <span className="text-xs text-app-text-light block">/ { product.unit }</span>
                        {
                            product.originalPrice > product.price && (
                                <span className="text-xs text-app-text-light line-through ml-1.5">{ currency }{ product.originalPrice.toFixed( 1 ) }</span>
                            )
                        }
                    </div>
                    <button aria-label={ `Add ${ product.name } to cart` } className="size-7 bg-app-orange text-white text-xs font-semibold shrink-0 flex-center rounded-full hover:bg-app-orange-dark hover:scale-110 transition-all active:scale-95" onClick={ ( e ) =>
                    {
                        e.stopPropagation()
                        addToCart(product)
                    } }>
                        <PlusIcon className="size-4" />
                    </button>
                </div>
            </div>


        </div>
    )
}

export default ProductsCard
