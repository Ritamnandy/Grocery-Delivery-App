import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { BuildingIcon, HashIcon, MapIcon, MapPinIcon, TagIcon } from "lucide-react"
import type { formInput } from "../types"
import Modal from "./Modal"
import FloatingInput from "./FloatingInput"

interface AddressFormProps
{
    onClose: () => void
    onSubmit: ( data: formInput ) => Promise<void> | void
    defaultValues: formInput
    editingId: string | null
}

const LABEL_SUGGESTIONS = [ "Home", "Work", "Other" ]

function AddressForm ( { onClose, onSubmit, defaultValues, editingId }: AddressFormProps )
{
    const {
        register,
        handleSubmit,
        setValue,
        setFocus,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<formInput>( { mode: "onTouched", defaultValues } )

    // eslint-disable-next-line react-hooks/incompatible-library
    const label = watch( "label" )

    // focus the first field once the modal has opened
    useEffect( () =>
    {
        const t = setTimeout( () => setFocus( "label" ), 100 )
        return () => clearTimeout( t )
    }, [ setFocus ] )

    return (
        <Modal
            open
            onClose={ onClose }
            title={ editingId ? "Edit Address" : "Add New Address" }
            description="Where should we deliver your orders?"
        >
            <form onSubmit={ handleSubmit( onSubmit ) } noValidate className="space-y-5">

                {/* Label + quick picks */ }
                <div className="space-y-2.5">
                    <div className="flex gap-2">
                        { LABEL_SUGGESTIONS.map( ( s ) => (
                            <button
                                key={ s }
                                type="button"
                                onClick={ () => setValue( "label", s, { shouldValidate: true, shouldDirty: true } ) }
                                className={ `px-3.5 py-1.5 text-xs font-medium rounded-full border transition-colors cursor-pointer
                                    ${ label === s
                                        ? "bg-app-green text-white border-app-green"
                                        : "bg-white text-zinc-600 border-app-border hover:border-app-green/50 hover:text-app-green" }` }
                            >
                                { s }
                            </button>
                        ) ) }
                    </div>

                    <FloatingInput
                        label="Label"
                        icon={ <TagIcon /> }
                        error={ errors.label?.message }
                        { ...register( "label", {
                            required: "Give this address a name",
                            maxLength: { value: 30, message: "Keep it under 30 characters" },
                        } ) }
                    />
                </div>

                <FloatingInput
                    label="Street address"
                    icon={ <MapPinIcon /> }
                    autoComplete="street-address"
                    error={ errors.address?.message }
                    { ...register( "address", {
                        required: "Street address is required",
                        minLength: { value: 5, message: "Enter the full street address" },
                    } ) }
                />

                <div className="grid grid-cols-2 gap-4">
                    <FloatingInput
                        label="City"
                        icon={ <BuildingIcon /> }
                        autoComplete="address-level2"
                        error={ errors.city?.message }
                        { ...register( "city", { required: "City is required" } ) }
                    />
                    <FloatingInput
                        label="State"
                        icon={ <MapIcon /> }
                        autoComplete="address-level1"
                        error={ errors.state?.message }
                        { ...register( "state", { required: "State is required" } ) }
                    />
                </div>

                <FloatingInput
                    label="ZIP / Postal code"
                    icon={ <HashIcon /> }
                    autoComplete="postal-code"
                    inputMode="numeric"
                    error={ errors.zip?.message }
                    { ...register( "zip", {
                        required: "ZIP code is required",
                        pattern: {
                            value: /^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/,
                            message: "Enter a valid ZIP / postal code",
                        },
                    } ) }
                />

                {/* Default toggle */ }
                <label className="flex items-center justify-between gap-4 p-3.5 bg-white rounded-xl border border-app-border cursor-pointer">
                    <span>
                        <span className="block text-sm font-medium text-zinc-800">Set as default address</span>
                        <span className="block text-xs text-app-text-light mt-0.5">Used automatically at checkout</span>
                    </span>

                    <input type="checkbox" className="peer sr-only" { ...register( "isDefault" ) } />
                    <span
                        className="relative w-10 h-6 shrink-0 rounded-full bg-gray-200 transition-colors
                            peer-checked:bg-app-green peer-focus-visible:ring-2 peer-focus-visible:ring-app-green/30
                            after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full
                            after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4"
                    />
                </label>

                {/* Actions */ }
                <div className="flex gap-3 pt-1">
                    <button
                        type="button"
                        onClick={ onClose }
                        className="flex-1 py-3 text-sm font-medium text-zinc-600 bg-white border border-app-border rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={ isSubmitting }
                        className="flex-1 py-3 text-sm font-semibold text-white bg-app-green rounded-xl hover:opacity-90 active:scale-[0.98] transition disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
                    >
                        { isSubmitting ? "Saving..." : editingId ? "Update address" : "Save address" }
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default AddressForm