import { Outlet } from "react-router-dom"
import TopBanner from "../components/TopBanner"
import NavBar from "../components/NavBar"


const AppLayout = () =>
{
    return (
        <>
            <TopBanner/>
            <NavBar/>
            <main className="min-h-screen ">
                <Outlet />
            </main>
            <p>footer</p>
            <p>cartSidebar</p>
        </>
    )
}

export default AppLayout