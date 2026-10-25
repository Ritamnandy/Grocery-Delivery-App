


export const maskEmail = ( email: string ): string =>
{
    const normalizedEmail = email.trim();

    const atIndex = normalizedEmail.lastIndexOf( "@" );

    // Invalid email format
    if (
        atIndex <= 0 ||
        atIndex === normalizedEmail.length - 1 ||
        normalizedEmail.indexOf( "@" ) !== atIndex
    )
    {
        return normalizedEmail;
    }

    const local = normalizedEmail.slice( 0, atIndex );
    const domain = normalizedEmail.slice( atIndex + 1 );

    // Preserve the first character and mask the remaining local part
    const maskedLocal =
        local.length === 1
            ? local
            : `${ local[ 0 ] }${ "*".repeat( Math.max( 4, local.length - 1 ) ) }`;

    return `${ maskedLocal }@${ domain }`;
};
