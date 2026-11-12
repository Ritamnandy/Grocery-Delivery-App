import { useEffect, useState } from "react"
import { PackageIcon, NavigationIcon } from "lucide-react"
import toast from "react-hot-toast"
import OtpModal from "../../components/Delivery/OtpModal"
import CancelModal from "../../components/Delivery/CancelModal"
import DeliveryOrderCard from "../../components/Delivery/DeliveryOrderCard"
import Loading from "../../components/Loading"
import type { Order } from "../../types"
import { api } from "../../config/api.config"

export default function DeliveryDashboard ()
{

    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<"active" | "completed">("active")
    const [tracking, setTracking] = useState(false)

    // OTP modal
    const [otpModal, setOtpModal] = useState<string | null>(null)
    const [otp, setOtp] = useState("")
    const [submitting, setSubmitting] = useState(false)

    // Cancel modal
    const [cancelModal, setCancelModal] = useState<string | null>(null)
    const [cancelReason, setCancelReason] = useState("")

    const fetchOrders = async () =>
    {
        setLoading(true)
        try
        {
            const res = await api<Order[]>( "/delivery/orders", { silent: true } )
            setOrders( res.data ?? [] )
        } catch
        {
            setOrders( [] )
        }
        setLoading(false)
    }

    useEffect( () =>
    {
        fetchOrders()
    }, [tab])

    const handleUpdateStatus = async (orderId: string, status: string) =>
    {
        try
        {
            await api( `/orders/${ orderId }/status`, {
                method: "PATCH",
                body: { status },
                successMessage: `Order marked as ${ status }`,
            } )
            fetchOrders()
        } catch
        {
            // api() already showed the error toast
        }
    }

    const handleComplete = async () =>
    {
        if ( !otpModal || !otp ) return
        setSubmitting( true )
        try
        {
            await api( `/orders/${ otpModal }/verify-otp`, {
                method: "PATCH",
                body: { otp },
                silent: true,
            } )
            await api( `/orders/${ otpModal }/status`, {
                method: "PATCH",
                body: { status: "Delivered" },
                silent: true,
            } )
            toast.success( "Delivered! Order marked as delivered." )
        } catch
        {
            // api() already showed the error toast
        }
        setSubmitting( false )
        setOtpModal( null )
        setOtp( "" )
        fetchOrders()
    }

    const handleCancel = async () =>
    {
        if ( !cancelModal ) return
        setSubmitting( true )
        try
        {
            await api( `/orders/${ cancelModal }/status`, {
                method: "PATCH",
                body: { status: "Cancelled" },
                silent: true,
            } )
            toast.success( "Delivery cancelled" )
            fetchOrders()
        } catch
        {
            // api() already showed the error toast
        }
        setSubmitting( false )
        setCancelModal( null )
        setCancelReason( "" )
    }

    // share live location for the active out-for-delivery order while tracking is on
    useEffect( () =>
    {
        if ( !tracking ) return
        const order = orders.find( ( o ) => o.status === "Out for Delivery" )
        if ( !order ) return

        const watchId = navigator.geolocation.watchPosition(
            ( pos ) =>
            {
                api( `/orders/${ order.id }/live-location`, {
                    method: "PATCH",
                    body: { lat: pos.coords.latitude, lng: pos.coords.longitude },
                    silent: true,
                } )
            },
            () => { },
            { enableHighAccuracy: true }
        )
        return () => navigator.geolocation.clearWatch( watchId )
    }, [ tracking, orders ])

    return (
        <div className="space-y-6">
            {/* Tabs + Tracking toggle */}
            <div className="flex items-center gap-2 flex-wrap">
                {([ "active", "completed" ] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${tab === t ? "bg-app-green text-white" : "bg-white text-zinc-600 hover:bg-app-cream border border-app-border"}`}>
                        {t === "active" ? "Active" : "Completed"}
                    </button>
                ))}
                <div className="ml-auto">
                    <button onClick={() => setTracking((prev) => !prev)} className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5 ${tracking ? "bg-green-600 text-white" : "bg-white text-zinc-600 border border-app-border hover:bg-app-cream"}`}>
                        <NavigationIcon className={`w-3.5 h-3.5 ${tracking ? "animate-pulse" : ""}`} />
                        {tracking ? "Sharing Location" : "Share Location"}
                    </button>
                </div>
            </div>

            {/* Orders */}
            {loading ? (
                <Loading />
            ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-app-border">
                    <PackageIcon className="size-12 text-app-border mx-auto mb-3" />
                    <p className="text-lg font-semibold text-zinc-900 mb-1">No {tab} deliveries</p>
                    <p className="text-sm text-zinc-500">{tab === "active" ? "You'll see new assignments here" : "Completed deliveries will appear here"}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.filter(o => tab === "active" ? o.status !== "Delivered" && o.status !== "Cancelled" : o.status === "Delivered").map((order) => <DeliveryOrderCard key={order.id} order={order} tab={tab} handleUpdateStatus={handleUpdateStatus} setOtpModal={setOtpModal} setCancelModal={setCancelModal} />)}
                </div>
            )}

            {/* OTP Modal */}
            {otpModal && <OtpModal setOtpModal={setOtpModal} otp={otp} setOtp={setOtp} handleComplete={handleComplete} submitting={submitting} />}
            {/* Cancel Modal */}
            {cancelModal && <CancelModal setCancelModal={setCancelModal} cancelReason={cancelReason} setCancelReason={setCancelReason} handleCancel={handleCancel} submitting={submitting} />}
        </div>
    );
}
