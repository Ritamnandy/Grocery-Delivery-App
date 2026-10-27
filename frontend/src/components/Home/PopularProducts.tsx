import { useEffect, useState } from "react"
import type { Product } from "../../types"
import { dummyProducts } from "../../assets/assets"
import { Link } from "react-router-dom"
import { ArrowRightIcon } from "lucide-react"
import ProductsCard from "../ProductsCard"
import { Reveal, StaggerItem } from "../MotionReveal"




function PopularProducts ()
{
    const [ products, setProducts ] = useState<Product[]>( [] )


    useEffect( () =>
    {
        // eslint-disable-next-line react-hooks/immutability
        loadProducts()
    }, [] )

    const loadProducts = async () =>
    {
        const responseData = dummyProducts
        if ( responseData.length > 10 )
        {
            setProducts( responseData.slice( 0, 10 ) )
        }
        else
        {
            setProducts( responseData )
        }

    }


    return (
        <section className="pb-16">
            <div className="max-w-7xl mx-auto">

                <Reveal className="flex items-center justify-between mb-8" y={ 14 }>

                    <div>
                        <h2 className="text-2xl font-semibold">Popular Products</h2>
                        <p className="text-app-text-light text-sm mt-1">Top-rated products this season</p>
                    </div>
                    <Link onClick={ () =>
                    {
                        window.scrollTo( 0, 0 )
                    } } to="/products" className="text-app-green font-semibold text-sm flex items-center gap-1 text-app-orange hover:text-app-orange-dark transition-colors hover:underline ">View All <ArrowRightIcon className="size-4" /></Link>
                </Reveal>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5  gap-4 xl:gap-8">
                    {
                        products.map( ( product, index ) => (
                            <StaggerItem key={ product._id } index={ index }>
                                <ProductsCard product={ product } />
                            </StaggerItem>
                        ) )
                    }
                </div>

            </div>
        </section>
    )
}

export default PopularProducts
