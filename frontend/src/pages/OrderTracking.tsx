import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import
    {
        ArrowLeftIcon, BikeIcon, CheckCheckIcon, CheckIcon, ClockIcon, KeyRoundIcon,
        MapPinIcon, PackageIcon, PackageSearchIcon, PhoneIcon, TruckIcon,
    } from "lucide-react"
import type { Order } from "../types"
import { dummyDashboardOrdersData, statusStyles } from "../assets/assets"

const STEPS = [
    { status: "Placed", icon: ClockIcon },
    { status: "Confirmed", icon: CheckIcon },
    { status: "Assigned", icon: TruckIcon },
    { status: "Packed", icon: PackageIcon },
    { status: "Out for Delivery", icon: BikeIcon },
    { status: "Delivered", icon: CheckCheckIcon },
]



const formatLongDate = ( v: string ) =>
    new Date( v ).toLocaleDateString( "en-US", { month: "long", day: "numeric", year: "numeric" } )

const formatStepTime = ( v: string ) =>
{
    const d = new Date( v )
    const date = d.toLocaleDateString( "en-US", { month: "short", day: "numeric" } )
    const time = d.toLocaleTimeString( "en-US", { hour: "2-digit", minute: "2-digit" } )
    return `${ date }, ${ time }`
}

// Adjust the field names here if your OrderItem type is different
const getItems = ( order: Order ) =>
    ( order.items as any[] ).map( ( it ) => ( {
        name: it.product?.name ?? it.name ?? "",
        image: it.product?.image ?? it.image ?? "",
        quantity: Number( it.quantity ?? 1 ),
        price: Number( it.price ?? it.product?.price ?? 0 ),
    } ) )

// ---------- Map ----------
const destinationIcon = L.divIcon( {
    className: "",
    iconSize: [ 28, 36 ],
    iconAnchor: [ 14, 36 ],
    html: `<svg width="28" height="36" viewBox="0 0 24 24" fill="#e11d48" stroke="white" stroke-width="1.5">
        <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5" fill="white" stroke="none"/></svg>`,
} )

const partnerIcon = L.divIcon( {
    className: "",
    iconSize: [ 20, 20 ],
    iconAnchor: [ 10, 10 ],
    html: `<span class="relative flex size-5">
        <span class="absolute inline-flex size-full animate-ping rounded-full bg-orange-400 opacity-60"></span>
        <span class="relative inline-flex size-5 rounded-full bg-app-orange border-2 border-white shadow"></span></span>`,
} )

// keeps both markers in view when the partner moves
function FitBounds ( { points }: { points: [ number, number ][] } )
{
    const map = useMap()
    useEffect( () =>
    {
        if ( points.length > 1 ) map.fitBounds( points, { padding: [ 40, 40 ], maxZoom: 15 } )
        else if ( points.length === 1 ) map.setView( points[ 0 ], 14 )
    }, [ map, points ] )
    return null
}

// ---------- Page ----------
function OrderTracking ()
{
    const currency = import.meta.env.VITE_CURRENCY

    const { id } = useParams()
    const navigate = useNavigate()
    const [ order, setOrder ] = useState<Order | null>( null )
    const [ loading, setLoading ] = useState<boolean>( true )
    const [ liveLocation, setLiveLocation ] = useState<{ lat: number; lng: number } | null>( null )

    const fetchOrder = () =>
    {
        setOrder( ( dummyDashboardOrdersData as any as Order[] ).find( ( o ) => o._id === id ) || null )
    }

    useEffect( () =>
    {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading( true )
        fetchOrder()
        window.scrollTo( 0, 0 )
        const t = setTimeout( () => setLoading( false ), 800 )
        return () => clearTimeout( t )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ id ] )

    // DEMO ONLY: moves the partner toward the destination. Replace with your real
    // live location (socket / polling) and call setLiveLocation with it.
    useEffect( () =>
    {
        if ( !order || order.status.toLowerCase() !== "out for delivery" ) return
        const dest = order.shippingAddress
        if ( typeof dest?.lat !== "number" || typeof dest?.lng !== "number" ) return

        let pos = { lat: dest.lat + 0.012, lng: dest.lng - 0.012 }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLiveLocation( pos )

        const timer = setInterval( () =>
        {
            pos = { lat: pos.lat + ( dest.lat - pos.lat ) * 0.1, lng: pos.lng + ( dest.lng - pos.lng ) * 0.1 }
            setLiveLocation( pos )
        }, 3000 )
        return () => clearInterval( timer )
    }, [ order ] )

    // ---------- Loading ----------
    if ( loading )
    {
        return (
            <div className="min-h-screen mb-20 bg-app-cream">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="status" aria-label="Loading order">
                    <div className="skeleton h-3 w-28 rounded-full mb-5" />
                    <div className="skeleton h-7 w-56 rounded-lg mb-8" />
                    <div className="grid lg:grid-cols-3 gap-5">
                        <div className="lg:col-span-2 space-y-5">
                            <div className="skeleton h-32 rounded-2xl" />
                            <div className="skeleton h-60 rounded-2xl" />
                            <div className="skeleton h-96 rounded-2xl" />
                        </div>
                        <div className="space-y-5">
                            <div className="skeleton h-36 rounded-2xl" />
                            <div className="skeleton h-64 rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ---------- Not found ----------
    if ( !order )
    {
        return (
            <div className="min-h-screen bg-app-cream flex flex-col items-center justify-center text-center px-4">
                <PackageSearchIcon className="size-14 text-app-text-light mb-4" />
                <h1 className="text-xl font-semibold text-app-green mb-1">Order not found</h1>
                <p className="text-sm text-app-text-light mb-6">It may have been removed or the link is incorrect.</p>
                <Link to="/myorders" className="px-5 py-2.5 text-sm font-medium text-white bg-app-green rounded-lg hover:opacity-90 transition">
                    Back to orders
                </Link>
            </div>
        )
    }

    // ---------- Derived values ----------
    const status = order.status
    const statusKey = status.toLowerCase()
    const isCancelled = statusKey === "cancelled"
    const isDelivered = statusKey === "delivered"
    const currentIndex = STEPS.findIndex( ( s ) => s.status.toLowerCase() === statusKey )

    const items = getItems( order )
    const addr = order.shippingAddress
    const hasMap = typeof addr?.lat === "number" && typeof addr?.lng === "number"

    const mapPoints: [ number, number ][] = []
    if ( hasMap ) mapPoints.push( [ addr.lat, addr.lng ] )
    if ( liveLocation ) mapPoints.push( [ liveLocation.lat, liveLocation.lng ] )

    const stepTime = ( s: string ) =>
        order.statusHistory?.find( ( h ) => h.status.toLowerCase() === s.toLowerCase() )?.timestamp

    return (
        <div className="min-h-screen mb-20 bg-app-cream">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */ }
                <button
                    onClick={ () => navigate( "/myorders" ) }
                    className="flex items-center gap-1.5 text-xs text-app-text-light hover:text-app-green transition-colors mb-4 cursor-pointer"
                >
                    <ArrowLeftIcon className="size-3.5" /> Back to Orders
                </button>

                <div className="flex items-start justify-between gap-3 mb-6">
                    <div>
                        <h1 className="text-xl font-semibold text-app-green">Order #{ order._id.slice( -8 ).toUpperCase() }</h1>
                        <p className="text-xs text-app-text-light mt-1">Placed on { formatLongDate( order.createdAt ) }</p>
                    </div>
                    <span className={ `px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${ statusStyles[ statusKey ] ?? "bg-gray-100 text-zinc-600" }` }>
                        { status }
                    </span>
                </div>

                <div className="grid lg:grid-cols-3 gap-5 items-start">

                    {/* ---------- Left column ---------- */ }
                    <div className="lg:col-span-2 space-y-5">

                        {/* Delivery OTP */ }
                        { order.deliveryOtp && !isDelivered && !isCancelled && (
                            <section className="rounded-2xl p-5 text-white bg-linear-to-r from-app-green-lighter to-app-green/70 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="size-9 rounded-full bg-white/15 flex-center">
                                        <KeyRoundIcon className="size-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold">Delivery OTP</h2>
                                        <p className="text-[11px] text-white/70">Share this with your delivery partner</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4" aria-label={ `Delivery OTP ${ order.deliveryOtp.split( "" ).join( " " ) }` }>
                                    { order.deliveryOtp.split( "" ).map( ( d, i ) => (
                                        <span key={ i } className="size-9 sm:size-10 rounded-lg bg-white/15 text-base font-semibold flex-center">
                                            { d }
                                        </span>
                                    ) ) }
                                </div>
                            </section>
                        ) }

                        {/* Map */ }
                        { hasMap && !isCancelled && (
                            <section className="bg-white rounded-2xl overflow-hidden shadow-sm">
                                <MapContainer
                                    center={ [ addr.lat, addr.lng ] }
                                    zoom={ 14 }
                                    scrollWheelZoom={ false }
                                    className="h-60 w-full z-0"
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={ [ addr.lat, addr.lng ] } icon={ destinationIcon } />
                                    { liveLocation && <Marker position={ [ liveLocation.lat, liveLocation.lng ] } icon={ partnerIcon } /> }
                                    <FitBounds points={ mapPoints } />
                                </MapContainer>
                            </section>
                        ) }

                        {/* Delivery progress */ }
                        <section className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="text-sm font-semibold text-app-green mb-5">Delivery Progress</h2>

                            { isCancelled ? (
                                <p className="text-sm text-red-500">This order was cancelled.</p>
                            ) : (
                                <ol>
                                    { STEPS.map( ( step, i ) =>
                                    {
                                        const done = i <= currentIndex
                                        const isLast = i === STEPS.length - 1
                                        const time = stepTime( step.status )
                                        const Icon = step.icon

                                        return (
                                            <li key={ step.status } className="relative flex gap-4 pb-7 last:pb-0">
                                                {/* connector to the next step */ }
                                                { !isLast && (
                                                    <span
                                                        className={ `absolute left-4 top-8 bottom-0 w-0.5 -ml-px transition-colors
                                                            ${ i < currentIndex ? "bg-app-green" : "bg-gray-200" }` }
                                                    />
                                                ) }

                                                <span
                                                    className={ `relative z-10 size-8 shrink-0 rounded-full flex-center transition-colors
                                                        ${ done ? "bg-app-green text-white" : "bg-gray-100 text-gray-400" }
                                                        ${ i === currentIndex && !isDelivered ? "ring-4 ring-app-green/15" : "" }` }
                                                >
                                                    <Icon className="size-4" />
                                                </span>

                                                <div className="pt-0.5">
                                                    <p className={ `text-sm font-medium ${ done ? "text-zinc-800" : "text-app-text-light" }` }>
                                                        { step.status }
                                                    </p>
                                                    { done && time && (
                                                        <p className="text-[11px] text-app-text-light mt-0.5">{ formatStepTime( time ) }</p>
                                                    ) }
                                                </div>
                                            </li>
                                        )
                                    } ) }
                                </ol>
                            ) }
                        </section>

                        {/* Delivery partner */ }
                        { order.deliveryPartner && (
                            <section className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    { order.deliveryPartner.avatar ? (
                                        <img src={ order.deliveryPartner.avatar } alt="" className="size-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="size-10 rounded-full bg-app-green text-white text-sm font-semibold flex-center">
                                            { order.deliveryPartner.name.charAt( 0 ).toUpperCase() }
                                        </div>
                                    ) }
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-zinc-800 truncate">{ order.deliveryPartner.name }</p>
                                        <p className="text-[11px] text-app-text-light capitalize">
                                            Delivery Partner · { order.deliveryPartner.vehicleType }
                                        </p>
                                    </div>
                                </div>

                                { order.deliveryPartner.phone && (
                                    <a
                                        href={ `tel:${ order.deliveryPartner.phone }` }
                                        aria-label={ `Call ${ order.deliveryPartner.name }` }
                                        className="size-9 shrink-0 rounded-full border border-app-border flex-center text-zinc-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                    >
                                        <PhoneIcon className="size-4" />
                                    </a>
                                ) }
                            </section>
                        ) }
                    </div>

                    {/* ---------- Right column ---------- */ }
                    <div className="space-y-5 lg:sticky lg:top-24">

                        {/* Address */ }
                        <section className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-800 mb-4">
                                <MapPinIcon className="size-4.5" /> Delivery Address
                            </h2>
                            <div className="text-sm text-app-text-light leading-7">
                                <p>{ addr.label }</p>
                                <p>{ addr.address }</p>
                                <p>{ addr.city }, { addr.state } { addr.zip }</p>
                            </div>
                        </section>

                        {/* Items & totals */ }
                        <section className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="text-base font-semibold text-zinc-800 mb-4">Items ({ items.length })</h2>

                            <ul className="space-y-4">
                                { items.map( ( item, i ) => (
                                    <li key={ i } className="flex items-center gap-3.5">
                                        <div className="size-12 shrink-0 rounded-lg border border-app-border p-1.5">
                                            <img src={ item.image } alt="" className="size-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-zinc-800 truncate">{ item.name }</p>
                                            <p className="text-xs text-app-text-light mt-0.5">x{ item.quantity }</p>
                                        </div>
                                        <span className="text-base font-semibold text-zinc-800">
                                            { currency }{ ( item.price * item.quantity ).toFixed( 2 ) }
                                        </span>
                                    </li>
                                ) ) }
                            </ul>

                            <dl className="mt-5 pt-5 border-t border-app-border space-y-3 text-sm">
                                <div className="flex justify-between text-app-text-light">
                                    <dt>Subtotal</dt><dd>{ currency }{ order.subtotal.toFixed( 2 ) }</dd>
                                </div>
                                <div className="flex justify-between text-app-text-light">
                                    <dt>Delivery</dt>
                                    <dd>{ order.deliveryFee > 0 ? `${ currency }${ order.deliveryFee.toFixed( 2 ) }` : "Free" }</dd>
                                </div>
                                <div className="flex justify-between text-app-text-light">
                                    <dt>Tax</dt><dd>{ currency }{ order.tax.toFixed( 2 ) }</dd>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-app-border text-lg font-semibold text-zinc-800">
                                    <dt>Total</dt><dd>{ currency }{ order.total.toFixed( 2 ) }</dd>
                                </div>
                            </dl>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderTracking