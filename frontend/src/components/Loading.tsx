import { BikeIcon } from "lucide-react"

type Props = {
    /** Cover the whole screen with the cream background (route-level loading) */
    fullScreen?: boolean
    /** Text under the spinner. Pass an empty string to hide it. */
    text?: string
    size?: "sm" | "md" | "lg"
    className?: string
}

const sizes = {
    sm: { box: "size-8", icon: "size-3.5", text: "text-xs", gap: "gap-2" },
    md: { box: "size-14", icon: "size-6", text: "text-sm", gap: "gap-4" },
    lg: { box: "size-20", icon: "size-9", text: "text-base", gap: "gap-5" },
}

function Loading ( { fullScreen = false, text = "Loading", size = "md", className = "" }: Props )
{
    const s = sizes[ size ]

    return (
        <div
            role="status"
            aria-live="polite"
            className={ `flex flex-col items-center justify-center ${ s.gap }
                ${ fullScreen ? "min-h-screen bg-app-cream" : "py-12" } ${ className }` }
        >
            {/* Spinner: track + spinning arc, with the logo icon in the middle */ }
            <div className={ `relative ${ s.box } flex-center` }>
                <span className="absolute inset-0 rounded-full border-[3px] border-app-green/15" />
                <span className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-app-orange border-r-app-orange/40 animate-spin motion-reduce:animate-none" />
                <BikeIcon className={ `${ s.icon } text-app-green animate-pulse motion-reduce:animate-none` } />
            </div>

            { text ? (
                <p className={ `${ s.text } font-medium text-app-text-light flex items-baseline` }>
                    { text }
                    {/* three bouncing dots */ }
                    <span className="inline-flex ml-0.5" aria-hidden="true">
                        { [ 0, 1, 2 ].map( ( i ) => (
                            <span
                                key={ i }
                                className="animate-bounce motion-reduce:animate-none"
                                style={ { animationDelay: `${ i * 150 }ms` } }
                            >
                                .
                            </span>
                        ) ) }
                    </span>
                </p>
            ) : (
                <span className="sr-only">Loading</span>
            ) }
        </div>
    )
}

export default Loading