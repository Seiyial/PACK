import { motion, useAnimation } from 'framer-motion'
import toaster from 'lib/ui/toaster'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import paths from './paths'
import useSession from './useSession'

export type PNavbar = {
	matchProjectID?: string
}
export const Navbar: React.FC<PNavbar> = ({ matchProjectID }) => {

	const sess = useSession({ ifNotLoggedIn: '/login' })
	const nav = useNavigate()

	const ac = useAnimation()
	useEffect(() => {
		ac.start({ y: 0, transition: { type: 'spring', bounce: 0.3, duration: 0.5 } })
	}, [])

	return <motion.div
		id='navbar'
		key='navbar'
		layout
		layoutId='navbar'
		className='flex flex-row items-center justify-center w-full min-w-0 bg-white shadow-sm rounded-b-md'
		animate={ac}
		style={{ y: -50 }}
		transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
	>
		<div className='flex flex-row items-center w-full h-[3.8rem] max-w-screen-lg'>
			<div className='flex items-center px-6 py-3'>
				<div
					className='mr-2 text-indigo-500 font-logo transform -translate-y-[1px] cursor-pointer'
				>
					APP
				</div>
			</div>

			<div className='flex-grow' />

			<div className='flex items-center h-full'>
				<div className='flex flex-col items-center justify-center h-full px-6 transition-colors cursor-pointer select-none hover:bg-slate-50 active:bg-slate-100' onClick={() => toaster.info('Coming soon!')}>
					<div className='flex flex-row items-center'>
						<div className='pr-3 font-bold text-slate-500'>{ sess.state.currentUser?.name }</div>
						<div className='w-8 h-8 rounded-full bg-slate-300 transform -translate-y-[1px]' />
					</div>
				</div>
			</div>
		</div>
	</motion.div>
}
