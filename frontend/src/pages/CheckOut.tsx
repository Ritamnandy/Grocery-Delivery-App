import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/cartContext"
import { useAuth } from "../context/authContext"
import { useAddress } from "../context/addressContext"
import type { Address } from "../types"
import { api } from "../config/api.config"
import { ArrowLeft, CheckIcon, ChevronRight, CreditCardIcon, MapPinIcon } from "lucide-react"
import CheckoutAddress from "../components/Checkout/CheckoutAddress"
import CheckoutPayment from "../components/Checkout/CheckoutPayment"
import CheckoutReview from "../components/Checkout/CheckoutReview"

function CheckOut ()
{
    const currency = import.meta.env.VITE_CURRENCY
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()
    const { addresses, defaultAddress, isLoading: addressesLoading } = useAddress()
    const { items, cartTotal, clearCart } = useCart()

    const [ step, setStep ] = useState( "address" )
    const [ loading, setLoading ] = useState( false )
    const [ address, setAddress ] = useState<Address | null>( null )
    const [ paymentMethod, setPaymentMethod ] = useState( "card" )

    const deliveryFee = cartTotal > 20 ? 0 : 1.99
    const tax = cartTotal * 0.08
    const total = cartTotal + deliveryFee + tax

    const steps: { key: string, label: string, icon: typeof MapPinIcon }[] = [
        { key: "address", label: "Address", icon: MapPinIcon },
        { key: "payment", label: "Payment", icon: CreditCardIcon },
        { key: "review", label: "Review", icon: CheckIcon },
    ]

    // pre-select the user's default address when the address step opens
    useEffect( () =>
    {
        if ( step === "address" && defaultAddress && !address )
        {
            setAddress( {
                id: defaultAddress.id,
                label: defaultAddress.label,
                address: defaultAddress.address,
                city: defaultAddress.city,
                state: defaultAddress.state,
                zip: defaultAddress.zip,
                isDefault: defaultAddress.isDefault,
                lat: defaultAddress.lat,
                lng: defaultAddress.lng,
            } )
        }
    }, [ step, defaultAddress, address ] )

    const handlePlaceOrder = async () =>
    {
        if ( !address || !address.address )
        {
            return
        }

        setLoading( true )
        try
        {
            const res = await api( "/orders", {
                method: "POST",
                body: {
                    items: items.map( ( item ) => ( {
                        productId: String( ( item.product as any ).id ?? ( item.product as any )._id ),
                        quantity: item.quantity,
                    } ) ),
                    addressId: address.id,
                    paymentMethod,
                    subtotal: cartTotal,
                    deliveryFee,
                    tax,
                    total,
                    shippingAddress: {
                        label: address.label,
                        address: address.address,
                        city: address.city,
                        state: address.state,
                        zip: address.zip,
                        lat: address.lat,
                        lng: address.lng,
                    },
                },
                successMessage: "Order placed successfully",
            } )

            clearCart()
            navigate( "/order-success", { state: { orderId: res.data.id } } )
        } catch
        {
            // api() already showed the error toast
        } finally
        {
            setLoading( false )
        }
    }

    if ( !isAuthenticated )
    {
        return (
            <div className="flex items-center bg-app-cream min-h-screen justify-center flex-col">
                <div className="text-center max-w-md">
                    <h2 className="text-xl font-semibold text-app-green mb-2">Sign in to checkout</h2>
                    <p className="text-app-text-light mb-6">Please log in to place an order</p>
                    <button onClick={ () => navigate( '/login' ) } className="px-5 py-2.5 bg-app-green text-white text-sm font-medium rounded-xl hover:bg-app-green transition-colors">
                        Sign In
                    </button>
                </div>
            </div>
        )
    }

    if ( addressesLoading )
    {
        return (
            <div className="flex items-center bg-app-cream min-h-screen justify-center flex-col">
                <div className="text-center">
                    <p className="text-app-text-light">Loading your addresses...</p>
                </div>
            </div>
        )
    }

    if ( items.length === 0 )
    {
        return (
            <div className="flex items-center bg-app-cream min-h-screen justify-center flex-col">
                <div className="text-center max-w-md">
                    <h2 className="text-xl font-semibold text-app-green mb-2">Your cart is empty</h2>
                    <p className="text-app-text-light mb-6">Add some products to Checkout</p>
                    <button onClick={ () => navigate( '/products' ) } className="px-5 py-2.5 bg-app-green text-white text-sm font-medium rounded-xl hover:bg-app-green transition-colors">
                        Browse Products
                    </button>
                </div>
            </div>
        )
    }
    return (
        <div className="min-h-screen bg-app-cream">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <ArrowLeft
                    onClick={ () => navigate( '/products' ) }
                    className="size-5 text-app-text-light cursor-pointer mb-6 hover:text-app-green"
                />

                <h1 className="text-2xl font-semibold text-app-green mb-8">Checkout</h1>

                {/* Steps */}
                <div className="flex items-center gap-2 mb-8">
                    {
                        steps.map( ( s, index ) => (
                            <div key={ index } className="flex items-center gap-4">
                                <button
                                    onClick={ () => setStep( s.key ) }
                                    className={ `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${ step === s.key ? 'bg-app-green text-white' : 'bg-white text-app-text-light' }` }>
                                    <s.icon className="size-4" /> { s.label }
                                    { index < steps.length - 1 && <ChevronRight className="size-4 text-app-text-light" /> }
                                </button>
                            </div>
                        ) )
                    }
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Main form */}
                    <div className="md:col-span-2">
                        {
                            step === "address" && <CheckoutAddress address={ address } setAddress={ setAddress } setStep={ setStep } user={ { addresses } } />
                        }
                        {
                            step === "payment" && <CheckoutPayment setStep={ setStep } paymentMethod={ paymentMethod } setPaymentMethod={ setPaymentMethod } />
                        }
                        {
                            step === "review" && <CheckoutReview address={ address } items={ items } loading={ loading } total={ total } handlePlaceOrder={ handlePlaceOrder } />
                        }
                    </div>
                    {/* Order summary */}
                    <div className="bg-white rounded-2xl p-5 h-fit sticky top-24">
                        <h3 className="text-sm font-medium text-app-green mb-4">Order Summary</h3>
                        <div className="space-y-2 text-sm text-app-text-light">
                            <div className="flex justify-between">
                                <span className="text-app-text-light">Subtotal ({items.length}) items</span>
                                <span>{currency} { cartTotal.toFixed(2) }</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-app-text-light">Delivery</span>
                                <span>{deliveryFee === 0 ? <span className="text-app-success">Free</span> : `${currency} ${deliveryFee.toFixed(2)}`}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-app-text-light">Tax </span>
                                <span>{ currency } { tax.toFixed( 2 ) }</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-app-border text-base font-semibold">
                                <span className="text-app-text-light">Total </span>
                                <span className="text-app-green">{ currency } { (total).toFixed( 2 ) }</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CheckOut
