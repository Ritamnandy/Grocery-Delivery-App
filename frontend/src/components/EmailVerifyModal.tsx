
import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react"
import Modal from "./Modal"
import { useAuth } from "../context/authContext"

type Props = {
    open: boolean
    onClose: () => void
    email: string
    onVerified: () => void
}

const LENGTH = 6
const RESEND_SECONDS = 30

const EmailVerifyModal = ( { open, onClose, email, onVerified }: Props ) =>
{
    const [ digits, setDigits ] = useState<string[]>( Array( LENGTH ).fill( "" ) )
    const [ error, setError ] = useState( "" )
    const [ loading, setLoading ] = useState( false )
    const [ cooldown, setCooldown ] = useState( RESEND_SECONDS )
    const refs = useRef<( HTMLInputElement | null )[]>( [] )
    const { verifyEmail, resendOtpCode } = useAuth()
    // reset + focus when opened
    useEffect( () =>
    {
        if ( !open ) return
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDigits( Array( LENGTH ).fill( "" ) )
        setError( "" )
        setCooldown( RESEND_SECONDS )
        setTimeout( () => refs.current[ 0 ]?.focus(), 50 )
    }, [ open ] )

    // resend countdown
    useEffect( () =>
    {
        if ( !open || cooldown <= 0 ) return
        const t = setTimeout( () => setCooldown( ( c ) => c - 1 ), 1000 )
        return () => clearTimeout( t )
    }, [ open, cooldown ] )

    const handleChange = ( i: number, value: string ) =>
    {
        const v = value.replace( /\D/g, "" ).slice( -1 )
        const next = [ ...digits ]
        next[ i ] = v
        setDigits( next )
        setError( "" )
        if ( v && i < LENGTH - 1 ) refs.current[ i + 1 ]?.focus()
    }

    const handleKeyDown = ( i: number, e: KeyboardEvent<HTMLInputElement> ) =>
    {
        if ( e.key === "Backspace" && !digits[ i ] && i > 0 ) refs.current[ i - 1 ]?.focus()
        if ( e.key === "ArrowLeft" && i > 0 ) refs.current[ i - 1 ]?.focus()
        if ( e.key === "ArrowRight" && i < LENGTH - 1 ) refs.current[ i + 1 ]?.focus()
    }

    const handlePaste = ( e: ClipboardEvent<HTMLInputElement> ) =>
    {
        e.preventDefault()
        const text = e.clipboardData.getData( "text" ).replace( /\D/g, "" ).slice( 0, LENGTH )
        if ( !text ) return
        const next = Array( LENGTH ).fill( "" )
        text.split( "" ).forEach( ( c, i ) => ( next[ i ] = c ) )
        setDigits( next )
        refs.current[ Math.min( text.length, LENGTH - 1 ) ]?.focus()
    }

    const code = digits.join( "" )

    const handleVerify = async () =>
    {
        if ( code.length < LENGTH ) return setError( "Enter the 6-digit code" )
        setLoading( true )
        try
        {
            const res = await verifyEmail( email, code )
            if ( res )
            {
                onVerified()
            } else
            {
                setError( "Invalid or expired code. Please try again." )
            }
        } catch
        {
            setError( "Invalid or expired code. Please try again." )
        } finally
        {
            setLoading( false )
        }
    }

    const handleResend = async () =>
    {
        if ( cooldown > 0 ) return
        const res = await resendOtpCode( email )
        console.log( res );
        if ( res )
        {
            setDigits( Array( LENGTH ).fill( "" ) )
            setError( "" )
            setCooldown( RESEND_SECONDS )
            refs.current[ 0 ]?.focus()
        } else
        {
            setError( "Failed to resend code. Please try again later." )
        }
    }

    return (
        <Modal
            open={ open }
            onClose={ onClose }
            title="Verify your email"
            description={ `We sent a 6-digit code to ${ email }. Enter it below.` }
        >
            <div className="flex justify-between gap-2 mb-2">
                { digits.map( ( d, i ) => (
                    <input
                        key={ i }
                        ref={ ( el ) => { refs.current[ i ] = el } }
                        value={ d }
                        inputMode="numeric"
                        autoComplete={ i === 0 ? "one-time-code" : "off" }
                        maxLength={ 1 }
                        aria-label={ `Digit ${ i + 1 }` }
                        onChange={ ( e ) => handleChange( i, e.target.value ) }
                        onKeyDown={ ( e ) => handleKeyDown( i, e ) }
                        onPaste={ handlePaste }
                        className={ `w-full aspect-square max-w-12 text-center text-lg font-semibold bg-white rounded-lg border outline-none transition-all
                            ${ error ? "border-red-500" : "border-app-border focus:border-app-green focus:ring-2 focus:ring-app-green/20" }` }
                    />
                ) ) }
            </div>

            { error && <p className="text-xs text-red-500 mb-2">{ error }</p> }

            <button
                type="button"
                onClick={ handleVerify }
                disabled={ loading || code.length < LENGTH }
                className="w-full mt-4 py-3 text-sm font-medium text-white bg-app-green rounded-lg hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
                { loading ? "Verifying..." : "Verify email" }
            </button>

            <p className="text-center text-sm text-app-text-light mt-4">
                Didn't get it?
                <button
                    type="button"
                    onClick={ handleResend }
                    disabled={ cooldown > 0 }
                    className="ml-1 font-semibold text-orange-500 hover:text-orange-600 disabled:text-app-text-light disabled:cursor-not-allowed transition-colors"
                >
                    { cooldown > 0 ? `Resend in ${ cooldown }s` : "Resend code" }
                </button>
            </p>
        </Modal>
    )
}

export default EmailVerifyModal