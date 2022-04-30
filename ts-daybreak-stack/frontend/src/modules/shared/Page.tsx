import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'
import { useParams } from 'react-router'
import { Navbar } from './Navbar'
import { kPageDOMContainerID } from './pageConstants'

export type PPage = {
	body?: React.FC<any>
}
/** automatically reads the route param `projectID` and passes it into the navbar. */
export const Page: React.FC<PPage> = ({ children, body: Body }) => {
	return <motion.div
		layout
		layoutId='page-container'
		key='page-container'
		className='relative flex flex-col items-center justify-start h-full max-h-full min-h-0 overflow-y-auto bg-slate-50 scroll special-scrollbar'
		id={kPageDOMContainerID}
	>
		<Navbar />
		<div className='flex-shrink-0 h-5' />
		<div className='flex flex-col items-center justify-start w-full'>
			{
				Body ? <Body /> : null
			}
			{ children }
		</div>
	</motion.div>
}
