import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartItem, Product } from "../types";

interface CartContextType  {
    items: CartItem[]
    addToCart: (item: Product, quantity?: number) => void
    removeFromCart: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void
    cartCount: number
    cartTotal: number
    isCartOpen: boolean
    setIsCartOpen: (open: boolean) => void
};




const cartContext = createContext<CartContextType | undefined>( undefined )


export function CartProvider ( { children }: { children: ReactNode } )
{

    const [ items, setItems ] = useState<CartItem[]>( () =>
    {
        const saved=localStorage.getItem("app_cart")
        return saved ? JSON.parse(saved) : []
    } )
    
    const [ isCartOpen, setIsCartOpen ] = useState( false )
    
    useEffect( () =>
    {
        localStorage.setItem( "app_cart", JSON.stringify( items ) )
    }, [ items ] )
    

    const addToCart = ( product: Product, quantity: number = 1 ) =>
    {
        setItems( ( prev ) =>
        {
            const existingItem = prev.find( ( i ) => i.product._id === product._id )
            if ( existingItem )
            {
                return prev.map( ( item ) =>
                    item.product._id === product._id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            }
            return [ ...prev, { product, quantity } ]
        } )
        setIsCartOpen( true )
    }

    const removeFromCart = ( productId: string ) =>
    {
        setItems( ( prev ) => prev.filter( ( item ) => item.product._id !== productId ) )
    }

    const updateQuantity = ( productId: string, quantity: number ) =>
    {
        if ( quantity <= 0 )
        {
            removeFromCart( productId )
            return
        }
        setItems( ( prev ) =>
            prev.map( ( item ) =>
                item.product._id === productId
                    ? { ...item, quantity }
                    : item
            )
        )
    }

    const clearCart = () =>
    {
        setItems( [] )
        setIsCartOpen( false )
    }

    const cartCount = items.reduce( ( total, item ) => total + item.quantity, 0 )

    const cartTotal = items.reduce( ( total, item ) => total + ( item.product.price * item.quantity ), 0 )
    
    return (
        <cartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal,
            isCartOpen,
            setIsCartOpen
        }}>
            {children}
        </cartContext.Provider>
    )
    
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
    const context = useContext(cartContext)
    if (!context) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}