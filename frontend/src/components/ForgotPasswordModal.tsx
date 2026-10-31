
import { useState } from "react"
import { useForm } from "react-hook-form"
import { MailIcon, CheckCircle2Icon } from "lucide-react"
import Modal from "./Modal"
import FloatingInput from "./FloatingInput"
import { maskEmail } from "../utils/maskEmail"
import { useAuth } from "../context/authContext"

type Props = { open: boolean; onClose: () => void; defaultEmail?: string }
type FormValues = { email: string }

const ForgotPasswordModal = ( { open, onClose, defaultEmail = "" }: Props ) =>
{
    const [ sent, setSent ] = useState( false )
    const [ serverError, setServerError ] = useState( "" )
    const { forgotPassword } = useAuth()

    const {
        register,
        handleSubmit,
        reset,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>( { mode: "onTouched", defaultValues: { email: defaultEmail } } )

    const handleClose = () =>
    {
        onClose()
        setTimeout( () => { setSent( false ); setServerError( "" ); reset() }, 200 )
    }

    const onSubmit = async ( { email }: FormValues ) =>
    {
        setServerError( "" )
        try
        {
            const res = await forgotPassword(email)
            if (res) {
                setSent( true )
            } else {
                setServerError( "Something went wrong. Please try again." )
            }
        } catch ( err )
        {
            console.log(err);
            
            setServerError( "Something went wrong. Please try again." )
        }
    }

    return (
        <Modal
            open={ open }
            onClose={ handleClose }
            title="Forgot password?"
            description={ sent ? undefined : "Enter your email and we'll send you a link to reset your password." }
        >
            { sent ? (
                <div className="text-center py-4">
                    <CheckCircle2Icon className="size-12 text-app-green mx-auto mb-3" />
                    <p className="text-sm text-app-text-light mb-6">
                        If an account exists for <span className="font-semibold text-app-green">{ maskEmail( getValues( "email" )) }</span>,
                        you'll get a reset link shortly. Check your spam folder too.
                    </p>
                    <button onClick={ handleClose } className="w-full py-3 text-sm font-medium text-white bg-app-green rounded-lg hover:opacity-90 transition">
                        Back to sign in
                    </button>
                </div>
            ) : (
                <form onSubmit={ handleSubmit( onSubmit ) } noValidate className="space-y-5">
                    <FloatingInput
                        type="email"
                        label="Email Address"
                        icon={ <MailIcon /> }
                        autoComplete="email"
                        error={ errors.email?.message }
                        { ...register( "email", {
                            required: "Email is required",
                            pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address" },
                        } ) }
                    />

                    { serverError && <p className="text-xs text-red-500">{ serverError }</p> }

                    <button
                        type="submit"
                        disabled={ isSubmitting }
                        className="w-full py-3 text-sm font-medium text-white bg-app-green rounded-lg hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        { isSubmitting ? "Sending..." : "Send reset link" }
                    </button>
                </form>
            ) }
        </Modal>
    )
}

export default ForgotPasswordModal