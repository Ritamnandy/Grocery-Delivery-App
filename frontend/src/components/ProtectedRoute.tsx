import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loading from "./Loading";
import { useEffect } from "react";



export default function ProtectedRoute ()
{
    const { user, loading } = {
        user: {
            name: "John Doe",
            email: "john.doe@example.com",
            isAdmin: true
        },
        loading: false,
    }
    const location = useLocation()

    useEffect( () =>
    {
        // Simulate loading
        const timer = setTimeout( () =>
        {
            // In a real app, this would check auth status

        }, 1000 )
        return () => clearTimeout( timer )
    }, [ loading ] )

    // still checking the session (e.g. cookie / refresh token), so don't redirect yet
    if ( loading ) return <Loading fullScreen />

    // not logged in: go to login and remember where they were headed
    if ( !user )
    {
        return <Navigate to="/login" replace state={ { from: location } } />
    }

    return <Outlet />
}
