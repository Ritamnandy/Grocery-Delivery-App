import { Toaster } from "react-hot-toast"
import { Route, Routes } from "react-router-dom"
import Login from "./pages/Login"
import AppLayout from "./pages/AppLayout"
import Home from "./pages/Home"
import Products from "./pages/Products"
import ProductsPage from "./pages/ProductsPage"
import SearchResults from "./pages/SearchResults"
import FlashDeals from "./pages/FlashDeals"
import CheckOut from "./pages/CheckOut"
import MyOrders from "./pages/MyOrders"
import OrderTracking from "./pages/OrderTracking"
import Addresses from "./pages/Addresses"
import ProtectedRoute from "./components/ProtectedRoute"
import ResetPasswordPage from "./components/ResetPasswordPage"
import OrderSuccess from "./pages/OrderSuccess"



function App ()
{
  return (
    <>
      <Toaster position="top-right" toastOptions={ { duration: 3000, style: { background: "#1B3022", color: "#fff", borderRadius: "12px", fontSize: "14px" } } } />
      <Routes>
        {/* Auth pages  - No NavBar/Footer */ }
        <Route path="/login" element={ <Login /> } />
        <Route path="/reset-password" element={ <ResetPasswordPage /> } />
        {/* Main pages  - With NavBar/Footer */ }
        <Route path="/" element={ <AppLayout /> }>

          <Route index element={ <Home /> } />
          <Route path="products" element={ <Products /> } />
          <Route path="products/:id" element={ <ProductsPage /> } />
          <Route path="search" element={ <SearchResults /> } />
          <Route path="deals" element={ <FlashDeals /> } />
          {/* Protected routes */ }
          <Route element={ <ProtectedRoute /> }>
            <Route path="checkout" element={ <CheckOut /> } />
            <Route path="myorders" element={ <MyOrders /> } />
            <Route path="myorders/:id" element={ <OrderTracking /> } />
            <Route path="addresses" element={ <Addresses /> } />
            <Route path="/order-success" element={ <OrderSuccess /> } />
          </Route>



        </Route>


      </Routes>


    </>
  )
}

export default App