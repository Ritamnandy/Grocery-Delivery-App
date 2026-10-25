
export const getUserName = ( name: string ) =>
{
    const res = name.split( " " );
    console.log(res);
    const userName = res[ 0 ].charAt( 0 ).toUpperCase() + res[ 1 ].charAt( 0 ).toUpperCase();
    return userName;
}