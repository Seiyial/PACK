import { HTMLMotionProps, motion } from 'framer-motion'
import React from 'react'

const elevations = [
	'',
	'shadow-md shadow-slate-600/5',
	'shadow-lg',
	'shadow-2xl'
] as const

export type PCard = {
	elevation: 0 | 1 | 2 | 3,
} & HTMLMotionProps<'div'>
export const Card: React.FC<PCard> = ({ children, elevation, ...props }) => {
	return <motion.div className={`${elevations[elevation]} px-4 py-2 bg-white rounded-lg transition-all`} {...props}>
		{ children }
	</motion.div>
}
