

const registerKey = ( email: string ) =>
{
    return `register-key:${ email }`
}

const otpKey = ( email: string ) =>
{
    return `otp-key:${ email }`
}
const resetTokenKey = ( email: string ) =>
{
    return `reset-token:${ email }`
}

const profileKey = ( userId: string ) =>
{
    return `profile-data:${ userId }`
}


const otpCooldownKey = ( email: string ) =>
{
    return `otp-cooldown:${ email }`
}

const FlashDealsKey = 'flash-deals-products'
const getAllProductsKey = 'all-products'

const getUserAddressesKey = ( userId: string ) =>
{
    return `user-addresses:${ userId }`
}
const userCacheKey = ( userId: string ) =>
{
    return `user:${ userId }`;
}

const OTP_RESEND_COOLDOWN = 60; // 1 minute
const OTP_EXPIRY = 5 * 60;

const REGISTER_DATA_EXPIRY = 20 * 60;

const PROFILE_DATA_EXPIRY = 5 * 60;

const RESET_TOKEN_EXPIRY = 10 * 60;

export
{
    registerKey,
    otpKey,
    resetTokenKey,
    profileKey,
    otpCooldownKey,
    OTP_RESEND_COOLDOWN,
    OTP_EXPIRY,
    REGISTER_DATA_EXPIRY,
    PROFILE_DATA_EXPIRY,
    RESET_TOKEN_EXPIRY,
    FlashDealsKey,
    getAllProductsKey,
    getUserAddressesKey,
    userCacheKey
}