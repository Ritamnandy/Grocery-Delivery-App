import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loading from "./Loading";
import { useEffect } from "react";
import { useAuth } from "../context/authContext";



export default function ProtectedRoute ()
{
    const { isAuthenticated, isLoading } = useAuth()
    const location = useLocation()

    useEffect( () =>
    {
        // Simulate loading
        const timer = setTimeout( () =>
        {
            // In a real app, this would check auth status

        }, 1000 )
        return () => clearTimeout( timer )
    }, [ isLoading ] )

    // still checking the session (e.g. cookie / refresh token), so don't redirect yet
    if ( isLoading ) return <Loading fullScreen />

    // not logged in: go to login and remember where they were headed
    if ( !isAuthenticated )
    {
        return <Navigate to="/login" replace state={ { from: location } } />
    }

    return <Outlet />
}
