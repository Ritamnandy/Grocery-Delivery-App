import
{
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import axios from "axios";
import { api } from "../config/api.config";


export interface AuthUser
{
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
}

export interface RegisterData
{
    name: string;
    email: string;
    password: string;
}

interface AuthContextType
{
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: ( email: string, password: string ) => Promise<boolean>;
    resendOtpCode: ( email: string ) => Promise<boolean>;
    register: ( data: RegisterData ) => Promise<boolean>;
    resetPassword: ( token: string, password: string ) => Promise<boolean>;
    forgotPassword: ( email: string ) => Promise<boolean>;
    verifyEmail: ( email: string, otp: string ) => Promise<AuthUser>;
    logout: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>( undefined );

export function AuthProvider ( { children }: { children: ReactNode } )
{
    const [ user, setUser ] = useState<AuthUser | null>( null );
    const [ isLoading, setIsLoading ] = useState( true );

    // Restore the session on app start (cookies are sent automatically)
    useEffect( () =>
    {
        const controller = new AbortController();

        ( async () =>
        {
            try
            {
                const cached = sessionStorage.getItem( "user_data" );
                if ( cached )
                {

                    const userData = JSON.parse( cached );
                    setUser( userData );
                    // console.log( 'Using cached user data', JSON.parse( cached ) );
                    setIsLoading( false );
                    return;
                }

                const res = await api<AuthUser>( "/user/profile", {
                    signal: controller.signal,
                    silent: true,
                } );
                setUser( res.data );
                sessionStorage.setItem( "user_data", JSON.stringify( res.data ) );
                // console.log( "User profile result: ", res.data );
            } catch ( err )
            {
                if ( axios.isCancel( err ) ) return;
                setUser( null );
                sessionStorage.removeItem( "user_data" );
            }
            setIsLoading( false );
        } )();

        return () => controller.abort();
    }, [] );

    // api.ts fires this when the refresh token is rejected
    useEffect( () =>
    {
        const onExpired = () => setUser( null );
        window.addEventListener( "auth:expired", onExpired );
        return () => window.removeEventListener( "auth:expired", onExpired );
    }, [] );

    const login = useCallback( async ( email: string, password: string ) =>
    {
        const res = await api<AuthUser>( "/auth/login", {
            method: "POST",
            body: { email, password },
        } );
        setUser( { ...res.data } );
        return res.success;
    }, [] );

    const register = useCallback( async ( data: RegisterData ) =>
    {
        // Only sends the OTP. The user is created after verifyEmail.
        const res = await api( "/auth/register", {
            method: "POST",
            body: data,
            successMessage: "OTP sent, please check your email",
        } );
        if ( res.success )
        {
            return true;
        }
        return false;
    }, [] );

    const verifyEmail = useCallback( async ( email: string, otp: string ) =>
    {
        const res = await api<AuthUser>( "/auth/verify", {
            method: "POST",
            body: { email, otp },
        } );
        setUser( res.data ); // backend sets the auth cookies and returns the user
        return res.data;
    }, [] );

    const resendOtpCode = useCallback( async ( email: string ) =>
    {
        const res = await api( "/auth/resend-otp", {
            method: "POST",
            body: { email },
        } );
        if ( res.success )
        {
            return true;
        }
        return false;
    }, [] );

    const logout = useCallback( async () =>
    {
        try
        {
            const res = await api( "/auth/logout", { method: "DELETE", silent: true } );
            if ( res.success )
            {
                setUser( null );
                sessionStorage.removeItem( "user_data" );
                return true;
            }
            return false;
        } catch ( err )
        {
            console.error( "Logout failed:", err );
            return false;
        }
    }, [] );

    const resetPassword = useCallback( async ( token: string, password: string ) =>
    {
        const res = await api( "/auth/reset-password", {
            method: "PATCH",
            body: { token, password },
        } );
        if ( res.success )
        {
            return true;
        }
        return false;
    }, [] );

    const forgotPassword = useCallback( async ( email: string ) =>
    {
        const res = await api( "/auth/forget-password", {
            method: "POST",
            body: { email },
        } );
        if ( res.success )
        {
            return true;
        }
        return false;
    }, [] );

    const value = useMemo<AuthContextType>(
        () => ( {
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            verifyEmail,
            logout,
            resetPassword,
            forgotPassword,
            resendOtpCode,
        } ),
        [ user, isLoading, login, register, verifyEmail, logout, resetPassword, forgotPassword, resendOtpCode ]
    );

    return <AuthContext.Provider value={ value }>{ children }</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth ()
{
    const context = useContext( AuthContext );
    if ( !context )
    {
        throw new Error( "useAuth must be used within an AuthProvider" );
    }
    return context;
}