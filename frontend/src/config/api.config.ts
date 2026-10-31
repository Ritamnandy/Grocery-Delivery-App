import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import toast from "react-hot-toast"; 
import { ApiError } from "../api/ApiError";

const BASE_URL = import.meta.env.VITE_API_URL as string;

/** Matches the envelope produced by your NestJS TransformInterceptor */
export interface ApiResponse<T>
{
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
    meta?: Record<string, unknown>;
    timestamp: string;
    path: string;
    requestId?: string;
}

const client = axios.create( {
    baseURL: BASE_URL,
    withCredentials: true, // send and receive the auth cookies
    timeout: 15_000, // 15 seconds
    headers: { "Content-Type": "application/json" },
} );

// A 401 from these paths must never trigger a refresh attempt
const NO_REFRESH_PATHS = [
    "/auth/refresh-access-token",
    "/auth/login",
    "/auth/register",
    "/auth/verify",
    "/auth/logout",
];

const shouldSkipRefresh = ( url = "" ): boolean =>
{
    const path = url.split( "?" )[ 0 ];
    return NO_REFRESH_PATHS.some( ( p ) => path.endsWith( p ) );
};

// Share one refresh call if several requests hit 401 at the same time
let refreshPromise: Promise<unknown> | null = null;

client.interceptors.response.use(
    ( res ) => res,
    async ( error: AxiosError ) =>
    {
        const original = error.config as
            | ( AxiosRequestConfig & { _retry?: boolean } )
            | undefined;

        const canRefresh =
            error.response?.status === 401 &&
            original &&
            !original._retry &&
            !shouldSkipRefresh( original.url );

        if ( !canRefresh ) return Promise.reject( error );

        original._retry = true;

        try
        {
            refreshPromise ??= client
                .post( "/auth/refresh-access-token" )
                .finally( () => ( refreshPromise = null ) );
            await refreshPromise;
        } catch
        {
            // Refresh failed: tell AuthProvider to clear the user, then surface the original 401
            window.dispatchEvent( new Event( "auth:expired" ) );
            return Promise.reject( error );
        }

        // Retry once. If this fails, it rejects normally.
        return client( original );
    }
);

type ApiOptions = Omit<AxiosRequestConfig, "url" | "method" | "data"> & {
    method?: AxiosRequestConfig[ "method" ];
    body?: unknown;
    /** Show a success toast when the request succeeds */
    successMessage?: string;
    /** Skip the automatic error toast (e.g. when the form shows its own error) */
    silent?: boolean;
};

export async function api<T = unknown> (
    path: string,
    { body, method = "GET", successMessage, silent = false, ...config }: ApiOptions = {}
): Promise<ApiResponse<T>>
{
    try
    {
        const res = await client.request<ApiResponse<T>>( {
            url: path,
            method,
            data: body,
            ...config,
        } );

        if ( successMessage ) toast.success( successMessage, { id: successMessage } );

        return res.data;
    } catch ( err )
    {
        // Aborted requests (AbortController) are not errors worth showing
        if ( axios.isCancel( err ) ) throw err;

        if ( axios.isAxiosError( err ) )
        {
            const data = err.response?.data as { message?: string | string[] } | undefined;
            const details = Array.isArray( data?.message )
                ? data.message
                : data?.message
                    ? [ data.message ]
                    : [];

            const message = err.response
                ? details[ 0 ] ?? "Something went wrong. Please try again."
                : err.code === "ECONNABORTED"
                    ? "Request timed out. Please try again."
                    : "Network error. Please check your connection.";

            // `id` dedupes identical toasts fired by parallel requests
            if ( !silent ) toast.error( message, { id: message } );

            throw new ApiError( message, err.response?.status ?? 0, details );
        }

        throw err;
    }
}