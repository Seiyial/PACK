import { AnimatePresence, motion } from 'framer-motion'
import { DkError } from 'lib/daybreak/core/DkResult'
import React from 'react'

export type PErrorMessage = {
	error: DkError | null
}
export const ErrorMessage: React.FC<PErrorMessage> = ({ error: err }) => {
	return <AnimatePresence>
		{
			err
				? <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className='mt-3 font-semibold text-center text-red-500'>
					{ err.msg }
				</motion.div>
				: null
		}
	</AnimatePresence>
}
