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
import type { Address, formInput } from "../types"; 
import { useAuth } from "./authContext";

interface AddressContextType
{
    addresses: Address[];
    defaultAddress: Address | null;
    isLoading: boolean;
    hasError: boolean;
    addAddress: ( address: formInput ) => Promise<boolean>;
    updateAddress: ( addressId: string, address: formInput ) => Promise<boolean>;
    deleteAddress: ( addressId: string ) => Promise<boolean>;
    setDefaultAddress: ( addressId: string ) => Promise<boolean>;
    refetch: () => Promise<void>;
}

const AddressContext = createContext<AddressContextType | undefined>( undefined );

const BASE_PATH = "/address"; 

export function AddressProvider ( { children }: { children: ReactNode } )
{
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [ addresses, setAddresses ] = useState<Address[]>( [] );
    const [ isLoading, setIsLoading ] = useState( true );
    const [ hasError, setHasError ] = useState( false );

    const fetchAddresses = useCallback( async ( signal?: AbortSignal ) =>
    {
        setIsLoading( true );
        setHasError( false );
        try
        {
            const res = await api<Address[]>( BASE_PATH, { signal, silent: true } );
            setAddresses( res.data ?? [] );
        } catch ( err )
        {
            if ( axios.isCancel( err ) ) return; // unmounted, leave state alone
            setAddresses( [] );
            setHasError( true );
        }
        setIsLoading( false );
    }, [] );

    // Load once the session is known, clear on logout
    useEffect( () =>
    {
        if ( authLoading ) return;

        if ( !isAuthenticated )
        {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAddresses( [] );
            setHasError( false );
            setIsLoading( false );
            return;
        }

        const controller = new AbortController();
        fetchAddresses( controller.signal );
        return () => controller.abort();
    }, [ authLoading, isAuthenticated, fetchAddresses ] );

    const addAddress = useCallback( async ( input: formInput ) =>
    {
        try
        {
            const res = await api<Address>( BASE_PATH, {
                method: "POST",
                body: input,
                successMessage: "Address added",
            } );
            const created = res.data;
            setAddresses( ( prev ) => [
                // only one default at a time
                ...( created.isDefault ? prev.map( ( a ) => ( { ...a, isDefault: false } ) ) : prev ),
                created,
            ] );
            return true;
        } catch
        {
            return false; // api() already showed the error toast
        }
    }, [] );

    const updateAddress = useCallback(
        async ( addressId: string, input: formInput ) =>
        {
            try
            {
                const res = await api<Address>( `${ BASE_PATH }/${ addressId }`, {
                    method: "PATCH",
                    body: input,
                    successMessage: "Address updated",
                } );
                const updated = res.data;
                setAddresses( ( prev ) =>
                    prev.map( ( a ) =>
                        a.id === addressId
                            ? updated
                            : updated.isDefault
                                ? { ...a, isDefault: false }
                                : a
                    )
                );
                return true;
            } catch
            {
                return false;
            }
        },
        []
    );

    const deleteAddress = useCallback( async ( addressId: string ) =>
    {
        try
        {
            await api( `${ BASE_PATH }/${ addressId }`, {
                method: "DELETE",
                successMessage: "Address deleted",
            } );
            setAddresses( ( prev ) => prev.filter( ( a ) => a.id !== addressId ) );
            return true;
        } catch
        {
            return false;
        }
    }, [] );

    const setDefaultAddress = useCallback( async ( addressId: string ) =>
    {
        try
        {
            await api( `${ BASE_PATH }/${ addressId }/default`, {
                method: "PATCH",
                successMessage: "Default address updated",
            } );
            setAddresses( ( prev ) =>
                prev.map( ( a ) => ( { ...a, isDefault: a.id === addressId } ) )
            );
            return true;
        } catch
        {
            return false;
        }
    }, [] );

    const refetch = useCallback( () => fetchAddresses(), [ fetchAddresses ] );

    const defaultAddress = useMemo(
        () => addresses.find( ( a ) => a.isDefault ) ?? null,
        [ addresses ]
    );

    const value = useMemo<AddressContextType>(
        () => ( {
            addresses,
            defaultAddress,
            isLoading,
            hasError,
            addAddress,
            updateAddress,
            deleteAddress,
            setDefaultAddress,
            refetch,
        } ),
        [
            addresses,
            defaultAddress,
            isLoading,
            hasError,
            addAddress,
            updateAddress,
            deleteAddress,
            setDefaultAddress,
            refetch,
        ]
    );

    return <AddressContext.Provider value={ value }>{ children }</AddressContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAddress ()
{
    const context = useContext( AddressContext );
    if ( !context )
    {
        throw new Error( "useAddress must be used within an AddressProvider" );
    }
    return context;
}