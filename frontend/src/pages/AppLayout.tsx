import { Outlet } from "react-router-dom"
import TopBanner from "../components/TopBanner"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"


const AppLayout = () =>
{
    return (
        <>
            <TopBanner/>
            <NavBar/>
            <main className="min-h-screen ">
                <Outlet />
            </main>
            <Footer />
            <p>cartSidebar</p>
        </>
    )
}

export default AppLayout