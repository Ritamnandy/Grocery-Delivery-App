type Props = {
    count?: number
    className?: string // grid column classes
}

const ProductCardSkeleton = ( { delay = 0 }: { delay?: number } ) => (
    <div
        className="bg-white rounded-2xl overflow-hidden shadow"
        aria-hidden="true"
    >
        {/* Image */ }
        <div className="aspect-square p-4">
            <div className="skeleton size-full rounded-xl" style={ { animationDelay: `${ delay }ms` } } />
        </div>

        {/* Info */ }
        <div className="p-3.5 pt-0 space-y-2.5">
            {/* Title (2 lines) */ }
            <div className="space-y-1.5">
                <div className="skeleton h-3 w-11/12 rounded-full" style={ { animationDelay: `${ delay }ms` } } />
                <div className="skeleton h-3 w-2/3 rounded-full" style={ { animationDelay: `${ delay }ms` } } />
            </div>

            {/* Rating */ }
            <div className="skeleton h-3 w-1/3 rounded-full" style={ { animationDelay: `${ delay }ms` } } />

            {/* Price + add button */ }
            <div className="flex items-center justify-between pt-1">
                <div className="skeleton h-4 w-1/2 rounded-full" style={ { animationDelay: `${ delay }ms` } } />
                <div className="skeleton size-7 rounded-full" style={ { animationDelay: `${ delay }ms` } } />
            </div>
        </div>
    </div>
)

const ProductsGridSkeleton = ( {
    count = 8,
    className = "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4",
}: Props ) => (
    <div className={ className } role="status" aria-label="Loading products">
        { Array.from( { length: count } ).map( ( _, i ) => (
            <ProductCardSkeleton key={ i } delay={ ( i % 4 ) * 120 } />
        ) ) }
    </div>
)

export default ProductsGridSkeleton