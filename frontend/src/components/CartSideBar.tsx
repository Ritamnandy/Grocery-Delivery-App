import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/cartContext"
import { ArrowRightIcon, MinusIcon, PlusIcon, ShoppingBagIcon, TrashIcon, XIcon } from "lucide-react"

function CartSideBar ()
{
    const currency = import.meta.env.VITE_CURRENCY

    const { items, updateQuantity, removeFromCart, cartTotal, isCartOpen, setIsCartOpen } = useCart()

    const navigate = useNavigate()

    // Esc closes the cart, and the page behind it doesn't scroll while it's open
    useEffect( () =>
    {
        if ( !isCartOpen ) return
        const onKey = ( e: KeyboardEvent ) => e.key === "Escape" && setIsCartOpen( false )
        document.addEventListener( "keydown", onKey )
        document.body.style.overflow = "hidden"
        return () =>
        {
            document.removeEventListener( "keydown", onKey )
            document.body.style.overflow = ""
        }
    }, [ isCartOpen, setIsCartOpen ] )

    const deliveryFee = cartTotal > 20 ? 0 : 1.99
    const grandTotal = cartTotal + deliveryFee

    return (
        // Always mounted. `invisible` (after the animation ends) stops clicks and keyboard focus while closed
        <div
            className={ `fixed inset-0 z-50 transition-[visibility] duration-300 ${ isCartOpen ? "visible" : "invisible" }` }
            aria-hidden={ !isCartOpen }
        >
            {/* overlay */ }
            <div
                className={ `absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ease-out
                    ${ isCartOpen ? "opacity-100" : "opacity-0" }` }
                onClick={ () => setIsCartOpen( false ) }
            />

            {/* sidebar */ }
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Shopping cart"
                className={ `absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col
                    transition-transform duration-300 ease-out motion-reduce:transition-none
                    ${ isCartOpen ? "translate-x-0" : "translate-x-full" }` }
            >

                {/* header */ }
                <div className="flex items-center justify-between p-5 border-b border-app-border">
                    <div className="flex items-center gap-2">
                        <ShoppingBagIcon className="size-5" />
                        <h2 className="text-lg font-medium">Your Cart</h2>
                        <span className="px-2 py-0.5 text-xs font-semibold bg-app-cream rounded-full">{ items.length } items</span>
                    </div>
                    <button
                        aria-label="Close cart"
                        className="p-2 rounded-xl hover:bg-app-cream transition-colors"
                        onClick={ () => setIsCartOpen( false ) }
                    >
                        <XIcon className="size-5" />
                    </button>
                </div>

                {/* items list */ }
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {
                        items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <ShoppingBagIcon className="size-16 text-app-border  mb-4" />
                                <h4 className="text-center font-medium mb-1">Your cart is empty</h4>
                            </div>
                        ) : (
                            items.map( ( item ) => (
                                <div key={ item.product._id } className="flex gap-3 bg-app-cream/60 rounded-xl p-3">

                                    <img src={ item.product.image } alt={ item.product.name } className="size-16 rounded-lg object-cover shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold truncate">{ item.product.name }</h4>
                                        <p className="text-xs text-app-text-light">{ currency }{ item.product.price.toFixed( 2 ) }/{ item.product.unit }</p>
                                        <div className="flex items-center justify-center mt-2">
                                            <div className="flex items-center gap-1.5">
                                                <button className="size-7 rounded-lg bg-white border border-app-border flex-center" onClick={ () => updateQuantity( item.product._id, item.quantity - 1 ) }>
                                                    <MinusIcon className="size-3" />
                                                </button>
                                                <span className="text-sm font-semibold w-6 text-center">{ item.quantity }</span>
                                                <button className="size-7 rounded-lg bg-white border border-app-border flex-center mr-5" onClick={ () => updateQuantity( item.product._id, item.quantity + 1 ) }>
                                                    <PlusIcon className="size-3" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm">{ currency }{ ( item.product.price * item.quantity ).toFixed( 2 ) }</span>
                                                <button className="p-1 text-app-text-light hover:text-app-error transition-colors" onClick={ () => removeFromCart( item.product._id ) }>
                                                    <TrashIcon className="size-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) )
                        )
                    }
                </div>

                {/* footer */ }
                {
                    items.length > 0 && (
                        <div className="p-5 border-t border-app-border space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-app-text-light">Subtotal</span>
                                <span className="font-medium">{ currency }{ cartTotal.toFixed( 2 ) }</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-app-text-light">Delivery Fee</span>
                                <span className="font-medium">
                                    { deliveryFee === 0 ? <span className="text-app-success">Free</span> : `${ currency }${ deliveryFee.toFixed( 2 ) }` }
                                </span>
                            </div>

                            {
                                deliveryFee > 0 && (
                                    <p className="text-center text-sm text-app-text-light">
                                        Free delivery on orders over { currency }20
                                    </p>
                                )
                            }
                            <div className="flex justify-between text-base font-semibold border-t border-app-border pt-3">
                                <span>Total</span>
                                <span>{ currency }{ grandTotal.toFixed( 2 ) }</span>
                            </div>
                            <button
                                className="w-full py-3 bg-app-orange text-white rounded-xl font-semibold hover:bg-app-orange-dark flex-center gap-2 active:scale-[0.98] transition-colors"
                                onClick={ () =>
                                {
                                    setIsCartOpen( false )
                                    navigate( '/checkout' )
                                    window.scrollTo( { top: 0, behavior: 'smooth' } )
                                } }
                            >
                                Proceed to Checkout <ArrowRightIcon className="size-4" />
                            </button>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default CartSideBar