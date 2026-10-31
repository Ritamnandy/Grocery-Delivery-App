
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './context/cartContext.tsx'
import { AuthProvider } from './context/authContext.tsx'
import { AddressProvider } from './context/addressContext.tsx'

createRoot( document.getElementById( 'root' )! ).render(
  <BrowserRouter>
    <AuthProvider>
      <AddressProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AddressProvider>
    </AuthProvider>
  </BrowserRouter>,
)
