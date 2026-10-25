import { useEffect, type ReactNode } from "react"
import { XIcon } from "lucide-react"

type Props = {
    open: boolean
    onClose: () => void
    title: string
    description?: string
    children: ReactNode
}

const Modal = ( { open, onClose, title, description, children }: Props ) =>
{
    useEffect( () =>
    {
        if ( !open ) return
        const onKey = ( e: KeyboardEvent ) => e.key === "Escape" && onClose()
        document.addEventListener( "keydown", onKey )
        document.body.style.overflow = "hidden"
        return () =>
        {
            document.removeEventListener( "keydown", onKey )
            document.body.style.overflow = ""
        }
    }, [ open, onClose ] )

    if ( !open ) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[modal-backdrop-in_.2s_ease-out]"
            onClick={ onClose }
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={ title }
                onClick={ ( e ) => e.stopPropagation() }
                className="relative w-full max-w-md bg-app-cream rounded-2xl p-8 shadow-xl animate-[modal-panel-in_.2s_ease-out]"
            >
                <button
                    type="button"
                    onClick={ onClose }
                    aria-label="Close"
                    className="absolute right-4 top-4 text-app-text-light hover:text-app-green transition-colors"
                >
                    <XIcon className="size-5" />
                </button>

                <h2 className="text-xl font-semibold text-app-green mb-1">{ title }</h2>
                { description && <p className="text-sm text-app-text-light mb-6">{ description }</p> }
                { children }
            </div>
        </div>
    )
}

export default Modal