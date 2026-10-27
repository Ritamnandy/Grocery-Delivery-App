import { useEffect, useState } from "react"
import { MapPinIcon, PlusIcon } from "lucide-react"
import type { Address, formInput } from "../types"
import { dummyAddressData } from "../assets/assets"
import AddressCard from "../components/AddressCard"
import AddressForm from "../components/AddressForm"

const emptyForm: formInput = {
    label: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    isDefault: false,
}

const Addresses = () =>
{
    const [ addresses, setAddresses ] = useState<Address[]>( [] )
    const [ loading, setLoading ] = useState<boolean>( true )
    const [ showForm, setShowForm ] = useState<boolean>( false )
    const [ editingId, setEditingId ] = useState<string | null>( null )

    const editingAddress = addresses.find( ( a ) => a._id === editingId )
    const defaultValues: formInput = editingAddress
        ? {
            label: editingAddress.label,
            address: editingAddress.address,
            city: editingAddress.city,
            state: editingAddress.state,
            zip: editingAddress.zip,
            isDefault: editingAddress.isDefault,
        }
        : { ...emptyForm, isDefault: addresses.length === 0 } // first address is default

    const closeForm = () =>
    {
        setShowForm( false )
        setEditingId( null )
    }

    const openAdd = () =>
    {
        setEditingId( null )
        setShowForm( true )
    }

    const onEditHandler = ( add: Address ) =>
    {
        setEditingId( add._id )
        setShowForm( true )
    }

    // TODO: replace the fake delay with your API calls
    const handleSave = async ( data: formInput ) =>
    {
        await new Promise( ( r ) => setTimeout( r, 600 ) )

        const savedId = editingId ?? crypto.randomUUID()

        setAddresses( ( prev ) =>
        {
            let next: Address[] = editingId
                ? prev.map( ( a ) => ( a._id === editingId ? { ...a, ...data } : a ) )
                : [ ...prev, { _id: savedId, ...data, lat: 0, lng: 0 } ] // TODO: geocode lat/lng

            // only one default; the very first address is always the default
            if ( data.isDefault || next.length === 1 )
            {
                next = next.map( ( a ) => ( { ...a, isDefault: a._id === savedId } ) )
            } else if ( !next.some( ( a ) => a.isDefault ) )
            {
                next = next.map( ( a, i ) => ( { ...a, isDefault: i === 0 } ) )
            }
            return next
        } )

        closeForm()
    }

    const handleDelete = ( id: string ) =>
    {
        // TODO: call your delete API
        setAddresses( ( prev ) =>
        {
            const next = prev.filter( ( a ) => a._id !== id )
            if ( next.length > 0 && !next.some( ( a ) => a.isDefault ) )
            {
                next[ 0 ] = { ...next[ 0 ], isDefault: true }
            }
            return next
        } )
    }

    const handleSetDefault = ( id: string ) =>
    {
        // TODO: call your API
        setAddresses( ( prev ) => prev.map( ( a ) => ( { ...a, isDefault: a._id === id } ) ) )
    }

    useEffect( () =>
    {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAddresses( dummyAddressData )
        const t = setTimeout( () => setLoading( false ), 1000 )
        return () => clearTimeout( t )
    }, [] )

    return (
        <div className="min-h-screen bg-app-cream">
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

                {/* page Header */ }
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-app-green">My Addresses</h1>
                        { !loading && addresses.length > 0 && (
                            <p className="text-xs text-app-text-light mt-1">
                                { addresses.length } saved { addresses.length === 1 ? "address" : "addresses" }
                            </p>
                        ) }
                    </div>
                    <button
                        onClick={ openAdd }
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-app-green rounded-xl hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
                    >
                        <PlusIcon className="size-4" /> Add Address
                    </button>
                </div>

                {/* Form modal (mounts fresh each time, so it always starts from the right values) */ }
                { showForm && (
                    <AddressForm
                        onClose={ closeForm }
                        onSubmit={ handleSave }
                        defaultValues={ defaultValues }
                        editingId={ editingId }
                    />
                ) }

                {/* display addresses */ }
                { loading ? (
                    <div className="space-y-4" role="status" aria-label="Loading addresses">
                        { Array.from( { length: 2 } ).map( ( _, i ) => (
                            <div key={ i } className="max-w-3xl bg-white rounded-2xl p-6 flex items-start justify-between" aria-hidden="true">
                                <div className="flex gap-4">
                                    <div className="skeleton size-11 rounded-xl" />
                                    <div className="space-y-2.5">
                                        <div className="skeleton h-4 w-24 rounded-full" />
                                        <div className="skeleton h-3 w-56 rounded-full" />
                                        <div className="skeleton h-3 w-36 rounded-full" />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="skeleton size-9 rounded-lg" />
                                    <div className="skeleton size-9 rounded-lg" />
                                </div>
                            </div>
                        ) ) }
                    </div>
                ) : addresses.length === 0 ? (
                    <div className="max-w-3xl bg-white rounded-2xl text-center py-16 px-6 shadow-sm">
                        <div className="size-16 mx-auto mb-4 rounded-full bg-app-green/10 text-app-green flex-center">
                            <MapPinIcon className="size-8" />
                        </div>
                        <h2 className="text-app-green text-lg font-semibold mb-1">No addresses saved yet</h2>
                        <p className="text-app-text-light text-sm mb-6">Add an address for faster checkout</p>
                        <button
                            onClick={ openAdd }
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-app-green rounded-xl hover:opacity-90 transition cursor-pointer"
                        >
                            <PlusIcon className="size-4" /> Add your first address
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        { addresses.map( ( address ) => (
                            <AddressCard
                                key={ address._id }
                                address={ address }
                                onEditHandler={ onEditHandler }
                                onDelete={ handleDelete }
                                onSetDefault={ handleSetDefault }
                            />
                        ) ) }
                    </div>
                ) }
            </div>
        </div>
    )
}

export default Addresses