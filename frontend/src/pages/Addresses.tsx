import { useMemo, useState } from "react"
import { MapPinIcon, PlusIcon } from "lucide-react"
import type { Address, formInput } from "../types"
import AddressCard from "../components/AddressCard"
import AddressForm from "../components/AddressForm"
import { useAddress } from "../context/addressContext"

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
    const {
        addresses,
        isLoading,
        hasError,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        refetch,
    } = useAddress()

    const [ showForm, setShowForm ] = useState<boolean>( false )
    const [ editingId, setEditingId ] = useState<string | null>( null )

    const editingAddress = addresses.find( ( a ) => a.id === editingId )

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

    // Default address first, then the rest in their original order
    const sortedAddresses = useMemo(
        () => [ ...addresses ].sort( ( a, b ) => Number( b.isDefault ) - Number( a.isDefault ) ),
        [ addresses ]
    )

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

    const onEditHandler = ( address: Address ) =>
    {
        setEditingId( address.id )
        setShowForm( true )
    }

    const handleSave = async ( data: formInput ) =>
    {



        const ok = editingId
            ? await updateAddress( editingId, data )
            : await addAddress( data )


        if ( ok ) closeForm() // keep the form open if the request failed
    }

    const handleDelete = async ( id: string ) =>
    {
        if ( !window.confirm( "Delete this address?" ) ) return
        await deleteAddress( id )
    }

    return (
        <div className="min-h-screen bg-app-cream">
            <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

                {/* Page header */ }
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-app-green">My Addresses</h1>
                        { !isLoading && !hasError && addresses.length > 0 && (
                            <p className="text-xs text-app-text-light mt-1">
                                { addresses.length } saved { addresses.length === 1 ? "address" : "addresses" }
                            </p>
                        ) }
                    </div>
                    <button
                        type="button"
                        onClick={ openAdd }
                        disabled={ isLoading || hasError }
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-app-green rounded-xl hover:opacity-90 active:scale-[0.98] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

                {/* Addresses */ }
                { isLoading ? (
                    <div className="space-y-4" role="status" aria-label="Loading addresses">
                        { Array.from( { length: 2 } ).map( ( _, i ) => (
                            <div key={ i } className="bg-white rounded-2xl p-6 flex items-start justify-between" aria-hidden="true">
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
                ) : hasError ? (
                    <div className="bg-white rounded-2xl text-center py-16 px-6 shadow-sm" role="alert">
                        <h2 className="text-app-green text-lg font-semibold mb-1">Couldn't load your addresses</h2>
                        <p className="text-app-text-light text-sm mb-6">Check your connection and try again.</p>
                        <button
                            type="button"
                            onClick={ refetch }
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-app-green rounded-xl hover:opacity-90 transition cursor-pointer"
                        >
                            Try again
                        </button>
                    </div>
                ) : addresses.length === 0 ? (
                    <div className="bg-white rounded-2xl text-center py-16 px-6 shadow-sm">
                        <div className="size-16 mx-auto mb-4 rounded-full bg-app-green/10 text-app-green flex-center">
                            <MapPinIcon className="size-8" />
                        </div>
                        <h2 className="text-app-green text-lg font-semibold mb-1">No addresses saved yet</h2>
                        <p className="text-app-text-light text-sm mb-6">Add an address for faster checkout</p>
                        <button
                            type="button"
                            onClick={ openAdd }
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-app-green rounded-xl hover:opacity-90 transition cursor-pointer"
                        >
                            <PlusIcon className="size-4" /> Add your first address
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        { sortedAddresses.map( ( address ) => (
                            <AddressCard
                                key={ address.id }
                                address={ address }
                                onEditHandler={ onEditHandler }
                                onDelete={ handleDelete }
                                onSetDefault={ setDefaultAddress }
                            />
                        ) ) }
                    </div>
                ) }
            </div>
        </div>
    )
}

export default Addresses