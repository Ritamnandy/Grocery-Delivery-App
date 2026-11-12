import { useEffect, useState } from "react"
import { PlusIcon, XIcon, TruckIcon, PhoneIcon, MailIcon } from "lucide-react"
import toast from "react-hot-toast"
import type { DeliveryPartner } from "../../types"
import Loading from "../../components/Loading"
import { api } from "../../config/api.config"

export default function AdminDeliveryPartners ()
{
    const [partners, setPartners] = useState<DeliveryPartner[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", vehicleType: "bike" })

    const fetchPartners = async () =>
    {
        setLoading(true)
        try
        {
            const res = await api<{ data: DeliveryPartner[] }>( "/delivery/partners", { silent: true } )
            setPartners( res.data ?? [] )
        } catch
        {
            setPartners( [] )
        }
        setLoading(false)
    }

    useEffect(() =>
    {
        fetchPartners()
    }, [])

    const handleSubmit = async (e: React.SubmitEvent) =>
    {
        e.preventDefault()
        setSaving(true)
        try
        {
            await api( "/delivery/partners", {
                method: "POST",
                body: {
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    phone: form.phone,
                    vehicleType: form.vehicleType,
                },
                successMessage: "Delivery partner created",
            } )
            setShowForm(false)
            setForm({ name: "", email: "", password: "", phone: "", vehicleType: "bike" })
            fetchPartners()
        } catch
        {
            // api() already showed the error toast
        } finally
        {
            setSaving(false)
        }
    }

    const toggleActive = async (id: string, isActive: boolean) =>
    {
        try
        {
            await api( `/delivery/partners/${ id }/toggle`, {
                method: "PATCH",
                body: { isActive: String(isActive) },
                silent: true,
            } )
            fetchPartners()
        } catch
        {
            // api() already showed the error toast
        }
    }

    if (loading) return <Loading fullScreen/>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-zinc-900">Delivery Partners</h1>
                <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-app-green text-white text-sm font-semibold rounded-xl hover:bg-app-green-light transition-colors flex items-center gap-2">
                    <PlusIcon className="size-4" /> Add Partner
                </button>
            </div>

            {/* Partners Grid */}
            {partners.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-app-border">
                    <TruckIcon className="size-12 text-app-border mx-auto mb-3" />
                    <p className="text-lg font-semibold text-zinc-900 mb-1">No delivery partners</p>
                    <p className="text-sm text-zinc-500">Onboard your first partner to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {partners.map((p) => (
                        <div key={p.id} className="bg-white rounded-2xl border border-app-border p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-app-green flex-center">
                                        <span className="text-white font-semibold text-sm">{p.name.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-zinc-900 text-sm">{p.name}</p>
                                        <p className="text-xs text-zinc-500 capitalize">{p.vehicleType}</p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full ${p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`} onClick={() => toggleActive(p.id, !p.isActive)} role="switch" aria-checked={p.isActive} style={{ cursor: "pointer" }}>
                                    {p.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-zinc-600">
                                <p><MailIcon className="size-3.5 shrink-0 mr-2" /> {p.email}</p>
                                <p><PhoneIcon className="size-3.5 shrink-0 mr-2" /> {p.phone}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 z-50 flex-center p-4">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
                    <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-app-green">Onboard Delivery Partner</h2>
                            <button type="button" onClick={() => setShowForm(false)} className="p-2 hover:bg-app-cream rounded-lg"><XIcon className="size-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-app-green mb-1.5">Full Name</label>
                                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-app-green mb-1.5">Email</label>
                                    <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-app-green mb-1.5">Password</label>
                                    <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-app-green mb-1.5">Phone</label>
                                    <input type="text" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-app-green mb-1.5">Vehicle Type</label>
                                    <select value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })} className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none bg-white">
                                        <option value="bike">Bike</option>
                                        <option value="scooter">Scooter</option>
                                        <option value="car">Car</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" disabled={saving} className="mt-6 w-full py-3 bg-app-green text-white font-semibold rounded-xl hover:bg-app-green-light transition-colors disabled:opacity-60">
                                {saving ? "Creating..." : "Create Partner"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
