import { useState } from "react"
import { CheckIcon, MapPinIcon, PencilIcon, Trash2Icon } from "lucide-react"
import type { Address } from "../types"

interface AddressCardProps
{
    address: Address
    onEditHandler: ( address: Address ) => void
    onDelete: ( id: string ) => void
    onSetDefault: ( id: string ) => void
}

function AddressCard ( { address, onEditHandler, onDelete, onSetDefault }: AddressCardProps )
{
    const [ confirming, setConfirming ] = useState( false )

    return (
        <div
            className={ `max-w-3xl bg-white rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-300 border
                ${ address.isDefault ? "border-app-green/30" : "border-transparent" }` }
        >
            <div className="flex items-start justify-between gap-4">

                {/* left */ }
                <div className="flex gap-5 min-w-0">
                    <div className="size-14 rounded-2xl bg-app-green/10 text-app-green flex-center shrink-0">
                        <MapPinIcon className="size-6" />
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center flex-wrap gap-2.5 mb-1.5">
                            <p className="text-xl font-semibold text-app-green">{ address.label }</p>
                            { address.isDefault && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-app-green/10 text-app-green rounded-full">
                                    <CheckIcon className="size-3.5" /> Default
                                </span>
                            ) }
                        </div>

                        <p className="text-base text-app-text-light leading-relaxed">
                            { address.address }, { address.city }<br />
                            { address.state }, { address.zip }
                        </p>

                        { !address.isDefault && (
                            <button
                                onClick={ () => onSetDefault( address.id ) }
                                className="mt-3 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors cursor-pointer"
                            >
                                Set as default
                            </button>
                        ) }
                    </div>
                </div>

                {/* right */ }
                <div className="flex items-center gap-2.5 shrink-0">
                    <button
                        aria-label="Edit address"
                        onClick={ () => onEditHandler( address ) }
                        className="size-11 flex-center rounded-xl border border-app-border text-zinc-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors cursor-pointer"
                    >
                        <PencilIcon className="size-5" />
                    </button>
                    <button
                        aria-label="Delete address"
                        onClick={ () => setConfirming( true ) }
                        className="size-11 flex-center rounded-xl border border-app-border text-zinc-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors cursor-pointer"
                    >
                        <Trash2Icon className="size-5" />
                    </button>
                </div>
            </div>

            {/* Inline delete confirmation: slides open/closed */ }
            <div
                className={ `grid transition-[grid-template-rows] duration-300 ease-out ${ confirming ? "grid-rows-[1fr]" : "grid-rows-[0fr]" }` }
            >
                <div className={ `overflow-hidden transition-[visibility] duration-300 ${ confirming ? "visible" : "invisible" }` }>
                    <div className="mt-5 pt-5 border-t border-app-border flex items-center justify-between gap-3">
                        <p className="text-base text-zinc-600">Delete this address?</p>
                        <div className="flex gap-2.5">
                            <button
                                onClick={ () => setConfirming( false ) }
                                className="px-5 py-2.5 text-sm font-medium text-zinc-600 bg-white border border-app-border rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={ () => onDelete( address.id ) }
                                className="px-5 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors cursor-pointer"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddressCard