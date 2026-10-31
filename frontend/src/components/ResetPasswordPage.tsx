
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { BikeIcon, CheckCircle2Icon, LockIcon } from "lucide-react"
import FloatingInput from "../components/FloatingInput"
import { useAuth } from "../context/authContext"

type FormValues = { password: string; confirmPassword: string }

const ResetPasswordPage = () =>
{
    const [ params ] = useSearchParams()
    const token = params.get( "token" )
    const navigate = useNavigate()
    const [ done, setDone ] = useState( false )
    const [ serverError, setServerError ] = useState( "" )
    const { resetPassword } = useAuth()
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>( { mode: "onTouched" } )

    const onSubmit = async ( { password }: FormValues ) =>
    {
        setServerError( "" )
        console.log( password );
        try
        {
            const res = await resetPassword( token || '', password )
            if ( res )
            {
                setDone( true )
                setTimeout( () => navigate( "/login" ), 2500 )
            } else
            {
                setServerError( "This reset link is invalid or has expired." )
            }
        } catch
        {
            setServerError( "This reset link is invalid or has expired." )
        }
    }

    return (
        <div className="min-h-screen flex-center px-4 py-12 bg-app-cream">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <BikeIcon className="size-8 text-app-green" />
                        <span className="text-2xl font-medium text-app-green">InstantMart</span>
                    </Link>
                </div>

                { !token ? (
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold text-app-green mb-2">Invalid reset link</h1>
                        <p className="text-sm text-app-text-light mb-6">This link is missing its token. Please request a new one.</p>
                        <Link to="/login" className="text-orange-500 font-semibold hover:text-orange-600">Back to sign in</Link>
                    </div>
                ) : done ? (
                    <div className="text-center">
                        <CheckCircle2Icon className="size-14 text-app-green mx-auto mb-3" />
                        <h1 className="text-2xl font-semibold text-app-green mb-2">Password updated</h1>
                        <p className="text-sm text-app-text-light">Redirecting you to sign in...</p>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-semibold text-app-green mb-2">Set a new password</h1>
                            <p className="text-sm text-app-text-light">Choose a strong password you haven't used before.</p>
                        </div>

                        <form onSubmit={ handleSubmit( onSubmit ) } noValidate className="space-y-5">
                            <FloatingInput
                                isPassword
                                label="New password"
                                icon={ <LockIcon /> }
                                autoComplete="new-password"
                                error={ errors.password?.message }
                                { ...register( "password", {
                                    required: "Password is required",
                                    minLength: { value: 8, message: "At least 8 characters" },
                                    pattern: {
                                        value: /^(?=.*[A-Za-z])(?=.*\d).+$/,
                                        message: "Use at least one letter and one number",
                                    },
                                } ) }
                            />

                            <FloatingInput
                                isPassword
                                label="Confirm password"
                                icon={ <LockIcon /> }
                                autoComplete="new-password"
                                error={ errors.confirmPassword?.message }
                                { ...register( "confirmPassword", {
                                    required: "Please confirm your password",
                                    // eslint-disable-next-line react-hooks/incompatible-library
                                    validate: ( v ) => v === watch( "password" ) || "Passwords do not match",
                                } ) }
                            />

                            { serverError && <p className="text-xs text-red-500">{ serverError }</p> }

                            <button
                                type="submit"
                                disabled={ isSubmitting }
                                className="w-full py-3 text-sm font-medium text-white bg-app-green rounded-lg hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                { isSubmitting ? "Updating..." : "Update password" }
                            </button>
                        </form>
                    </>
                ) }
            </div>
        </div>
    )
}

export default ResetPasswordPage