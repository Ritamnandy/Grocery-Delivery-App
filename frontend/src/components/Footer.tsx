import { BikeIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { footerData } from "../assets/assets";




function Footer ()
{
    return (
        <footer className='text-white pt-8 px-6 md:px-16 lg:px-24 xl:px-32 bg-green-950 mt-25'>
            <div className='flex flex-wrap justify-between gap-12 md:gap-6'>
                {/* first column - brand */ }
                <div className='max-w-80 text-white'>
                    {/* brand section */ }
                    <div >
                        <Link to="/" className="flex items-center gap-2 text-[22px] font-semibold text-white shrink-0">
                            <BikeIcon className="size-6 text-white" />
                            <span className="text-white">{ footerData.brand.name }</span>
                        </Link>
                    </div>
                    <p className='text-sm'>
                        { footerData.brand.description }
                    </p>
                    {/* social icons */ }
                    <div className='flex items-center gap-3 mt-4'>
                        {
                            footerData.brand.socials.map( ( social,index ) => (
                                <a href={ social.link } key={ index } className="size-9 rounded-lg bg-white/10 flex-center hover:bg-white/2">
                                    <social.icon className="size-4" />
                                </a>
                            ) )
                        }
                    </div>
                </div>

                { /* second column - Quick Links */ }
                <div>
                    <p className='text-lg text-white'>{ footerData.sections[ 0 ].title }</p>
                    <ul className='mt-3 flex flex-col gap-2 text-sm'>
                        {
                            footerData.sections[ 0 ].links.map( ( link ) => (
                                <li key={ link.label }>
                                    <Link to={ link.to }>{ link.label }</Link>
                                </li>
                            ) )
                        }
                    </ul>
                </div>
                {/* third column - Customer Service */ }
                <div>
                    <p className='text-lg text-white'>{ footerData.sections[ 1 ].title }</p>
                    <ul className='mt-3 flex flex-col gap-2 text-sm'>
                        {
                            footerData.sections[ 1 ].links.map( ( link ) => (
                                <li key={ link.label }>
                                    <Link to={ link.to }>{ link.label }</Link>
                                </li>
                            ) )
                        }
                    </ul>
                </div>
                {/* fourth column - Contact Us */ }
                <div className='max-w-80'>
                    <p className='text-lg text-white'>Contact Us</p>
                    <div className='flex items-center'>
                        <ul className='mt-3 flex flex-col gap-2 text-sm'>
                            {
                                footerData.contact.map( ( contact ) => (
                                    <li key={ contact.text }>
                                        <div className='flex items-center gap-2'>
                                            <contact.icon className='w-4 h-4' />
                                            <span>{ contact.text }</span>
                                        </div>
                                    </li>
                                ) )
                            }
                        </ul>
                    </div>
                </div>
            </div>
            <hr className='border-white/20 mt-8' />
            {/* bottom bar */ }
            <div className='flex flex-col md:flex-row gap-2 items-center justify-between py-5'>
                <p>{ footerData.bottom.copyright }</p>
                <ul className='flex items-center gap-4'>
                    {
                        footerData.bottom.links.map( ( link ) => (
                            <li key={ link.label }>
                                <a href={ link.href }>{ link.label }</a>
                            </li>
                        ) )
                    }
                </ul>
            </div>
        </footer>
    );

}

export default Footer