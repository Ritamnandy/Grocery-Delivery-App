

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { heroSectionData } from "../assets/assets"
import { BikeIcon, LockIcon, MailIcon, UserIcon } from "lucide-react"
import FloatingInput from "../components/FloatingInput"
import ForgotPasswordModal from "../components/ForgotPasswordModal"
import EmailVerifyModal from "../components/EmailVerifyModal"

type FormValues = {
    name?: string
    email: string
    password: string
}

const GOOGLE_URL = `${ import.meta.env.VITE_API_URL }/auth/google` // change to your backend's Google route

const Login = () =>
{
    const [ isLoginState, setIsLoginState ] = useState( true )
    const [ showForgot, setShowForgot ] = useState( false )
    const [ showVerify, setShowVerify ] = useState( false )
    const [ pendingEmail, setPendingEmail ] = useState( "" )

    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        reset,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>( { mode: "onTouched" } )

    const onSubmit = async ( data: FormValues ) =>
    {
        // TODO: call your real login / signup API here
        await new Promise( ( r ) => setTimeout( r, 1000 ) )

        if ( isLoginState )
        {
            navigate( "/" )
        } else
        {
            setPendingEmail( data.email )
            setShowVerify( true ) // backend has emailed the OTP
        }
    }

    const toggleMode = () =>
    {
        reset() // clears values and errors when switching login <-> signup
        setIsLoginState( ( s ) => !s )
    }

    return (
        <div className="min-h-screen flex ">
            {/* Left side */ }
            <div className="hidden lg:flex lg:w-1/2 bg-app-green relative items-center justify-center">
                <img src={ heroSectionData.hero_image } alt="" className="absolute inset-0 object-cover h-full bg-center opacity-10" />
                <div className="relative text-center px-12">
                    <h2 className="text-4xl font-semibold text-white mb-4">Welcome back to InstantMart</h2>
                    <p className="text-white/60 font-serif text-xl max-w-sm mx-auto">Fresh groceries and organic produce,delivered to your doorstep.</p>
                </div>
            </div>

            {/* Right side */ }
            <div className="flex-1 flex-center px-4 py-12 bg-app-cream">
                <div className="w-full max-w-md">

                    {/* Form header */ }
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 mb-6">
                            <BikeIcon className="size-8 text-app-green" />
                            <span className="text-2xl font-medium text-app-green">InstantMart</span>
                        </Link>

                        <h1 className="text-2xl font-semibold text-app-green mb-2">
                            { isLoginState ? "Sign in to your account" : "Sign up for an account" }
                        </h1>
                        <p className="text-sm text-app-text-light ">{ isLoginState ? "Don't have an account?" : "Already have an account?" }
                            <button
                                type="button"
                                onClick={ toggleMode }
                                className="text-orange-500 transition-colors ml-1 font-semibold hover:text-orange-600"
                            >
                                { isLoginState ? "Create one" : "Sign in" }
                            </button>
                        </p>
                    </div>

                    {/* Google */ }
                    <a
                        href={ GOOGLE_URL }
                        className="w-full flex items-center justify-center gap-3 py-3 text-sm font-medium bg-white border border-app-border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <svg className="size-5" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
                            <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
                            <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
                        </svg>
                        { isLoginState ? "Sign in with Google" : "Sign up with Google" }
                    </a>

                    <div className="flex items-center gap-3 my-6">
                        <div className="h-px flex-1 bg-app-border" />
                        <span className="text-xs text-app-text-light">or</span>
                        <div className="h-px flex-1 bg-app-border" />
                    </div>

                    {/* Form inputs */ }
                    <form onSubmit={ handleSubmit( onSubmit ) } noValidate className="space-y-5">
                        { !isLoginState && (
                            <FloatingInput
                                label="Name"
                                icon={ <UserIcon /> }
                                autoComplete="name"
                                error={ errors.name?.message }
                                { ...register( "name", {
                                    required: "Name is required",
                                    minLength: { value: 2, message: "Name must be at least 2 characters" },
                                    maxLength: { value: 50, message: "Name is too long" },
                                } ) }
                            />
                        ) }

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

                        <FloatingInput
                            isPassword
                            label="Password"
                            icon={ <LockIcon /> }
                            autoComplete={ isLoginState ? "current-password" : "new-password" }
                            error={ errors.password?.message }
                            { ...register( "password", {
                                required: "Password is required",
                                ...( !isLoginState && {
                                    minLength: { value: 8, message: "At least 8 characters" },
                                    pattern: {
                                        value: /^(?=.*[A-Za-z])(?=.*\d).+$/,
                                        message: "Use at least one letter and one number",
                                    },
                                } ),
                            } ) }
                        />

                        { isLoginState && (
                            <div className="text-right -mt-2">
                                <button
                                    type="button"
                                    onClick={ () => setShowForgot( true ) }
                                    className="text-sm text-orange-500 font-semibold hover:text-orange-600 transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        ) }

                        <button
                            type="submit"
                            disabled={ isSubmitting }
                            className="w-full py-3 text-sm font-medium text-white bg-app-green rounded-lg hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            { isSubmitting ? "Please wait..." : isLoginState ? "Sign in" : "Create account" }
                        </button>
                    </form>

                </div>
            </div>

            {/* Modals */ }
            <ForgotPasswordModal
                open={ showForgot }
                onClose={ () => setShowForgot( false ) }
                defaultEmail={ getValues( "email" ) }
            />

            <EmailVerifyModal
                open={ showVerify }
                onClose={ () => setShowVerify( false ) }
                email={ pendingEmail }
                onVerified={ () =>
                {
                    setShowVerify( false )
                    navigate( "/" )
                } }
            />
        </div>
    )
}

export default Login