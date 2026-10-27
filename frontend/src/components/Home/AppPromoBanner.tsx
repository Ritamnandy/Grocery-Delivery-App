import { appPromoBannerData, assets } from "../../assets/assets"
import { motion, useReducedMotion } from "motion/react"
import { Reveal } from "../MotionReveal"




function AppPromoBanner ()
{
    const reduceMotion = useReducedMotion()

    return (
        <Reveal className="max-w-7xl px-4 mx-auto sm:px-6 lg:px-8 py-20 my-14 bg-green-950 rounded-2xl overflow-hidden relative">

            <div className="absolute -top-32 -right-24 size-80 rounded-full bg-app-orange/15 blur-3xl" />

            
            <div className="relative flex flex-col gap-8 md:flex-row items-center justify-between xl:px-10">
                {/* Left side - Text content */ }

                <div className="text-center md:text-left">
                    <h2 className="text-3xl sm:text-4xl font-serif text-white mb-3">{ appPromoBannerData.title }</h2>
                    <p className="mb-6 max-w-md text-white/70">{ appPromoBannerData.description }</p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        <button className="px-4 py-2 bg-white text-green-950 rounded-lg font-semibold 
                        border border-white
                        hover:bg-transparent
                        hover:text-white
                        hover:border-white transition-colors cursor-pointer">App Store</button>
                        <button className="px-4 py-2 bg-transparent text-white border border-white rounded-lg font-semibold hover:bg-white hover:text-green-950 transition-colors cursor-pointer">Google Play</button>
                    </div>

                </div>
                {/* Right side - Image */ }

                <motion.img
                    src={ assets.delivery_truck }
                    alt="Delivery truck"
                    className="max-w-60 sm:max-w-120 xl:pr-10 drop-shadow-2xl"
                    animate={ reduceMotion ? undefined : { y: [ 0, -8, 0 ] } }
                    transition={ { duration: 3.8, repeat: Infinity, ease: "easeInOut" } }
                />


            </div>


        </Reveal>
    )
}

export default AppPromoBanner
