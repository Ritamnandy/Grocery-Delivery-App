import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { AlertCircleIcon, ArrowLeftIcon, BikeIcon, LockIcon, MailIcon } from "lucide-react"
import { heroSectionData } from "../../assets/assets"
import FloatingInput from "../../components/FloatingInput"

// Change to your delivery partner Google route if it's different from the customer one
const GOOGLE_URL = import.meta.env.VITE_GOOGLE_AUTH_URL

type FormValues = {
    email: string
    password: string
}

export default function DeliveryLogin ()
{
    const [ serverError, setServerError ] = useState( "" )
const navigate=useNavigate()
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>( { mode: "onTouched" } )

    const onSubmit = async ( data: FormValues ) =>
    {
        setServerError( "" )
        try
        {
            // TODO: call your delivery partner login API here, then navigate to the partner dashboard
            console.log( data )
            await new Promise( ( r ) => setTimeout( r, 1000 ) )
            navigate( '/delivery' )
            window.scrollTo( 0, 0 )
        } catch
        {
            setServerError( "Invalid email or password. Please try again." )
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side */ }
            <div className="hidden lg:flex lg:w-1/2 bg-app-green relative items-center justify-center">
                <img src={ heroSectionData.hero_image0 } alt="" className="absolute inset-0 object-cover h-full bg-center opacity-10" />
                <div className="relative text-center px-12">
                    <h2 className="text-4xl font-semibold text-white mb-4">Delivery Partner Portal</h2>
                    <p className="text-white/60 font-serif text-xl max-w-sm mx-auto">Manage your deliveries and keep customers happy.</p>
                </div>
            </div>

            {/* Right Side Form */ }
            <div className="relative flex-1 flex-center px-4 py-12 bg-app-cream">

                {/* Back to home */ }
                <Link
                    to="/"
                    className="absolute top-6 left-4 sm:left-8 flex items-center gap-1.5 text-sm font-medium text-app-text-light hover:text-app-green transition-colors group"
                >
                    <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-0.5" />
                    Back to Home
                </Link>

                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="flex-center gap-2 mb-4">
                            <BikeIcon className="size-7 text-app-green" />
                            <span className="text-2xl font-semibold text-app-green">InstantMart</span>
                        </div>
                        <h1 className="text-2xl font-semibold text-app-green mb-2">Delivery Partner Login</h1>
                        <p className="text-sm text-app-text-light">Sign in to manage your deliveries</p>
                    </div>

                    <div className="bg-white rounded-2xl p-8 space-y-5">

                        {/* Google */ }
                        <a
                            href={ GOOGLE_URL }
                            className="w-full flex items-center justify-center gap-3 py-3 text-sm font-medium bg-white border border-app-border rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <svg className="size-5" viewBox="0 0 48 48" aria-hidden="true">
                                <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
                                <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
                                <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
                                <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
                            </svg>
                            Sign in with Google
                        </a>

                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-app-border" />
                            <span className="text-xs text-app-text-light">or</span>
                            <div className="h-px flex-1 bg-app-border" />
                        </div>

                        {/* Email + password */ }
                        <form onSubmit={ handleSubmit( onSubmit ) } noValidate className="space-y-5">
                            <FloatingInput
                                type="email"
                                label="Email"
                                icon={ <MailIcon /> }
                                autoComplete="email"
                                error={ errors.email?.message }
                                { ...register( "email", {
                                    required: "Email is required",
                                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address" },
                                } ) }
                            />

                            <FloatingInput
                                isPassword
                                label="Password"
                                icon={ <LockIcon /> }
                                autoComplete="current-password"
                                error={ errors.password?.message }
                                { ...register( "password", { required: "Password is required" } ) }
                            />

                            { serverError && (
                                <p role="alert" className="flex items-center gap-2 px-3.5 py-2.5 text-xs text-red-600 bg-red-50 rounded-lg">
                                    <AlertCircleIcon className="size-4 shrink-0" /> { serverError }
                                </p>
                            ) }

                            <button
                                type="submit"
                                disabled={ isSubmitting }
                                className="w-full py-3 bg-app-green text-white font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition disabled:opacity-60 disabled:pointer-events-none"
                            >
                                { isSubmitting ? "Signing in..." : "Sign In" }
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}