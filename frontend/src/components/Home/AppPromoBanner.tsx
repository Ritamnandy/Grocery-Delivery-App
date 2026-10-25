import { appPromoBannerData, assets } from "../../assets/assets"




function AppPromoBanner ()
{
    return (
        <section className="max-w-7xl px-4 mx-auto sm:px-6 lg:px-8 py-20 my-14 bg-green-950 rounded-2xl">

            
            <div className="flex flex-col gap-8 md:flex-row items-center justify-between xl:px-10">
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

                <img src={ assets.delivery_truck } alt="delivery_truck" className="max-w-60 sm:max-w-120 xl:pr-10" />


            </div>


        </section>
    )
}

export default AppPromoBanner