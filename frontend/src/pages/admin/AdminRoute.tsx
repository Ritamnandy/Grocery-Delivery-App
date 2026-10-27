import { Navigate, Outlet, useLocation } from "react-router-dom"
import Loading from "../../components/Loading"


export default function AdminRoute ()
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

    if ( loading ) return <Loading fullScreen />

    // logged out: go to login, then come back here
    if ( !user ) return <Navigate to="/login" replace state={ { from: location } } />

    // logged in but not an admin
    if ( !user.isAdmin ) return <Navigate to="/forbidden" replace />

    return <Outlet />
}