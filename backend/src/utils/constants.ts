
import crypto from 'node:crypto'
import bcrypt from 'bcrypt'


const DB_NAME = 'Movie_Ticket_Booking'
const QUEUE_NAME = 'EmailQueue'
const SECOND_QUEUE_NAME = 'NotificationQueue'
const WellComeMail = 'WellComeMail'
const VerifyEmailMail = 'VerifyEmailMail'
const ResetPasswordMail = 'ResetPasswordMail'
const PasswordChangedMail = 'PasswordChangedMail'

const hashPassword = async ( password: string ) =>
{
    return await bcrypt.hash( password, 10 )
}

const comparePassword = async ( password: string, hashedPassword: string ) =>
{
    return await bcrypt.compare( password, hashedPassword )
}

const generateOtp = (): string =>
{
    return crypto.randomInt( 100_000, 1_000_000 ).toString();
};


const safeEqual = ( aOtp: string, bOtp: string ) =>
    aOtp.length === bOtp.length && crypto.timingSafeEqual( Buffer.from( aOtp ), Buffer.from( bOtp ) )



const createHashData = ( value: string ) =>
{
    return crypto.createHash( 'sha256' ).update( value ).digest( 'hex' )
}

const createRowToken = () =>
{
    return crypto.randomBytes( 64 ).toString( "hex" )
}
const ResetPasswordLink = ( token: string ) =>
{
    return `${ process.env.FORGET_PASSWORD_URL as string }?token=${ token }`;
}


export {
    DB_NAME,
    QUEUE_NAME,
    SECOND_QUEUE_NAME,
    WellComeMail,
    VerifyEmailMail,
    ResetPasswordMail,
    PasswordChangedMail,
    generateOtp,
    safeEqual,
    createHashData,
    createRowToken,
    ResetPasswordLink,
    hashPassword,
    comparePassword
}
