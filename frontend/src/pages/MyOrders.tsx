import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { CalendarIcon, ChevronRightIcon, PackageSearchIcon } from "lucide-react"
import type { Order } from "../types"
import { useCart } from "../context/cartContext"
import { dummyDashboardOrdersData, statusStyles } from "../assets/assets"

const tabs = [ "all", "Placed", "Out for Delivery", "Delivered", "Cancelled" ]



const MAX_THUMBS = 4

// Adjust the field names here if your Order type is different
const getOrderView = ( order: Order ) =>
{
    const o = order as any
    const items: { name: string; image: string; quantity: number }[] = ( o.items ?? [] ).map( ( it: any ) => ( {
        name: it.product?.name ?? it.name ?? "",
        image: it.product?.image ?? it.image ?? "",
        quantity: it.quantity ?? 1,
    } ) )

    return {
        id: String( o._id ),
        shortId: String( o._id ).slice( -8 ).toUpperCase(),
        date: o.createdAt,
        status: String( o.status ?? "Placed" ),
        total: Number( o.totalAmount ?? o.total ?? o.amount ?? 0 ),
        items,
    }
}

const formatDate = ( value: string ) =>
    new Date( value ).toLocaleDateString( "en-US", { month: "short", day: "numeric", year: "numeric" } )

export default function MyOrders ()
{
    const currency = import.meta.env.VITE_CURRENCY
    const navigate = useNavigate()

    const [ orders, setOrders ] = useState<Order[]>( [] )
    const [ loading, setLoading ] = useState<boolean>( true )
    const [ activeTab, setActiveTab ] = useState<string>( "all" )

    const [ searchParams, setSearchParams ] = useSearchParams()
    const { clearCart } = useCart()

    const fetchOrders = () =>
    {
        const all = dummyDashboardOrdersData as unknown as Order[]
        setOrders(
            activeTab === "all"
                ? all
                : all.filter( ( o ) => String( ( o as any ).status ).toLowerCase() === activeTab.toLowerCase() )
        )
    }

    useEffect( () =>
    {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading( true )
        const timers: ReturnType<typeof setTimeout>[] = []

        if ( searchParams.get( "clearCart" ) )
        {
            // coming back from checkout: empty the cart, then give the new order a moment to appear
            clearCart()
            setSearchParams( {} )
            timers.push( setTimeout( fetchOrders, 2000 ) )
            timers.push( setTimeout( () => setLoading( false ), 2000 ) )
        } else
        {
            fetchOrders()
            timers.push( setTimeout( () => setLoading( false ), 600 ) )
        }

        return () => timers.forEach( clearTimeout )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ activeTab ] )

    return (
        <div className="min-h-screen bg-app-cream mb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-xl font-semibold text-app-green mb-5">My Orders</h1>

                {/* Tabs */ }
                <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1" role="tablist">
                    { tabs.map( ( tab ) => (
                        <button
                            key={ tab }
                            role="tab"
                            aria-selected={ activeTab === tab }
                            onClick={ () => setActiveTab( tab ) }
                            className={ `px-4 py-2 text-xs font-medium rounded-full whitespace-nowrap transition-colors cursor-pointer
                                ${ activeTab === tab
                                    ? "bg-app-green text-white"
                                    : "bg-white text-zinc-600 hover:bg-orange-50 hover:text-orange-600" }` }
                        >
                            { tab === "all" ? "All Orders" : tab }
                        </button>
                    ) ) }
                </div>

                <div className="max-w-2xl">
                    { loading ? (
                        <div className="space-y-4" role="status" aria-label="Loading orders">
                            { Array.from( { length: 3 } ).map( ( _, i ) => (
                                <div key={ i } className="bg-white rounded-2xl p-5 space-y-4" aria-hidden="true">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            <div className="skeleton h-3.5 w-36 rounded-full" />
                                            <div className="skeleton h-3 w-24 rounded-full" />
                                        </div>
                                        <div className="skeleton h-5 w-20 rounded-full" />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="skeleton size-12 rounded-lg" />
                                        <div className="skeleton size-12 rounded-lg" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="skeleton h-3 w-14 rounded-full" />
                                        <div className="skeleton h-4 w-16 rounded-full" />
                                    </div>
                                </div>
                            ) ) }
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center text-center py-20">
                            <PackageSearchIcon className="size-14 text-app-text-light mb-4" />
                            <h2 className="text-lg font-semibold text-app-green mb-1">No orders found</h2>
                            <p className="text-sm text-app-text-light mb-6">
                                { activeTab === "all" ? "You haven't placed any orders yet." : `You have no ${ activeTab.toLowerCase() } orders.` }
                            </p>
                            <Link to="/products" className="px-5 py-2.5 text-sm font-medium text-white bg-app-green rounded-lg hover:opacity-90 transition">
                                Start shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            { orders.map( ( order ) =>
                            {
                                const v = getOrderView( order )
                                const extra = v.items.length - MAX_THUMBS

                                return (
                                    <div
                                        key={ v.id }
                                        role="link"
                                        tabIndex={ 0 }
                                        onClick={ () => navigate( `/myorders/${ v.id }` ) }
                                        onKeyDown={ ( e ) => e.key === "Enter" && navigate( `/myorders/${ v.id }` ) }
                                        className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                                    >
                                        {/* Header */ }
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-sm font-semibold text-zinc-800">Order #{ v.shortId }</h3>
                                                <p className="flex items-center gap-1.5 text-xs text-app-text-light mt-1">
                                                    <CalendarIcon className="size-3" />
                                                    { v.date ? formatDate( v.date ) : "" }
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className={ `px-2.5 py-1 text-[11px] font-medium rounded-full ${ statusStyles[ v.status.toLowerCase() ] ?? "bg-gray-100 text-zinc-600" }` }>
                                                    { v.status }
                                                </span>
                                                <ChevronRightIcon className="size-4 text-app-text-light" />
                                            </div>
                                        </div>

                                        {/* Thumbnails */ }
                                        <div className="flex items-center gap-2 mt-4">
                                            { v.items.slice( 0, MAX_THUMBS ).map( ( item, i ) => (
                                                <div key={ i } className="size-12 shrink-0 rounded-lg border border-app-border bg-white p-1">
                                                    <img src={ item.image } alt={ item.name } className="size-full object-contain" />
                                                </div>
                                            ) ) }
                                            { extra > 0 && (
                                                <div className="size-12 shrink-0 rounded-lg border border-app-border bg-gray-50 text-xs font-medium text-zinc-600 flex-center">
                                                    +{ extra }
                                                </div>
                                            ) }
                                        </div>

                                        {/* Footer */ }
                                        <div className="flex items-center justify-between mt-4">
                                            <span className="text-xs text-app-text-light">
                                                { v.items.length } { v.items.length === 1 ? "item" : "items" }
                                            </span>
                                            <span className="text-sm font-semibold text-zinc-800">
                                                { currency }{ v.total.toFixed( 2 ) }
                                            </span>
                                        </div>
                                    </div>
                                )
                            } ) }
                        </div>
                    ) }
                </div>
            </div>
        </div>
    )
}