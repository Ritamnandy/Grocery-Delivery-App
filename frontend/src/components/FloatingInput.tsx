
import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    icon: ReactNode;
    error?: string;
    isPassword?: boolean;
};

const FloatingInput = forwardRef<HTMLInputElement, Props>(
    ( { label, icon, error, isPassword, type = "text", ...rest }, ref ) =>
    {
        const [ show, setShow ] = useState( false );

        return (
            <div>
                <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-app-text-light pointer-events-none">
                        { icon }
                    </span>

                    {/* placeholder=" " is required for peer-placeholder-shown to work */ }
                    <input
                        ref={ ref }
                        type={ isPassword ? ( show ? "text" : "password" ) : type }
                        placeholder=" "
                        aria-invalid={ !!error }
                        className={ `peer w-full pl-11 ${ isPassword ? "pr-11" : "pr-4" } py-3 text-sm bg-white rounded-lg border border-app-green-lighter outline-none transition-all
                            ${ error
                                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                                : "border-app-green-lighter focus:border-primary focus:ring-2 focus:ring-primary/20" }` }
                        { ...rest }
                    />

                    {/* Label must come AFTER the input so peer-* works */ }
                    <label
                        className={ `absolute left-11 top-1/2 -translate-y-1/2 text-sm text-app-text-light pointer-events-none
                            bg-white px-1 transition-all duration-200
                            peer-focus:top-0 peer-focus:left-3 peer-focus:text-xs
                            peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:text-xs
                            ${ error ? "text-red-500 peer-focus:text-red-500" : "peer-focus:text-primary" }` }
                    >
                        { label }
                    </label>

                    { isPassword && (
                        <button
                            type="button"
                            onClick={ () => setShow( ( s ) => !s ) }
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-app-text-light cursor-pointer"
                            aria-label={ show ? "Hide password" : "Show password" }
                        >
                            { show ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" /> }
                        </button>
                    ) }
                </div>

                { error && <p className="mt-1 text-xs text-red-500">{ error }</p> }
            </div>
        );
    }
);

FloatingInput.displayName = "FloatingInput";
export default FloatingInput;