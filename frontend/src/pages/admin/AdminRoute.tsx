import { Navigate, Outlet, useLocation } from "react-router-dom"
import Loading from "../../components/Loading"
import { useAuth } from "../../context/authContext"


export default function AdminRoute ()
{
    const { user, isLoading } = useAuth()
    const location = useLocation()

    if ( isLoading ) return <Loading fullScreen />

    // logged out: go to login, then come back here
    if ( !user ) return <Navigate to="/login" replace state={ { from: location } } />

    // logged in but not an admin
    if ( user.role !== "admin" ) return <Navigate to="/forbidden" replace />

    return <Outlet />
}