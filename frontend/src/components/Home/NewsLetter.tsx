import {  MailIcon } from "lucide-react"
import { Reveal } from "../MotionReveal"

function NewsLetter ()
{
    return (
        <section className="pb-8">
            <Reveal className="max-w-7xl mx-auto text-center p-3 rounded-2xl bg-white border border-app-border/70 shadow-sm" y={ 16 }>

                <div className="flex items-center justify-center p-3">
                    <MailIcon className="size-8 text-app-green " strokeWidth={1.5} />
                </div>
                <div className="flex text-center justify-center flex-col items-center">
                    <h2 className="text-app-green font-medium mt-3 text-3xl ">Subscribe to our Newsletter</h2>
                    <p className="text-sm text-slate-900/60 mt-1 max-w-md ">Get weekly updates on fresh produce, seasonal offers, and exclusive discounts right to your
                        inbox.</p>
                </div>
                <div className="flex items-center mt-5  w-full md:px-16 px-6 xl:px-10 justify-center mb-10 ">
                    <input type="email" placeholder="Enter Your Email" className="text-sm border-r-0 outline-none border border-gray-500/50 pl-3  h-10 rounded-l-md" />
                    <button type="button" className="font-medium text-sm text-white bg-app-green w-30 h-10 rounded-r-md p-2 hover:bg-app-green-light active:scale-[0.98] transition-all">Subscribe</button>
                </div>
            </Reveal>

        </section>
    )
}

export default NewsLetter
