import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

type RevealProps = {
    children: ReactNode
    className?: string
    delay?: number
    y?: number
}

/** A small, reusable entrance treatment for page sections. */
export function Reveal ( { children, className, delay = 0, y = 20 }: RevealProps )
{
    const reduceMotion = useReducedMotion()

    return (
        <motion.div
            className={ className }
            initial={ reduceMotion ? false : { opacity: 0, y } }
            whileInView={ reduceMotion ? undefined : { opacity: 1, y: 0 } }
            viewport={ { once: true, amount: 0.18 } }
            transition={ { duration: 0.55, delay, ease: [ 0.22, 1, 0.36, 1 ] } }
        >
            { children }
        </motion.div>
    )
}

type StaggerItemProps = {
    children: ReactNode
    className?: string
    index: number
}

export function StaggerItem ( { children, className, index }: StaggerItemProps )
{
    const reduceMotion = useReducedMotion()

    return (
        <motion.div
            className={ className }
            initial={ reduceMotion ? false : { opacity: 0, y: 18 } }
            whileInView={ reduceMotion ? undefined : { opacity: 1, y: 0 } }
            viewport={ { once: true, amount: 0.1 } }
            transition={ { duration: 0.45, delay: Math.min( index * 0.055, 0.38 ), ease: [ 0.22, 1, 0.36, 1 ] } }
        >
            { children }
        </motion.div>
    )
}
