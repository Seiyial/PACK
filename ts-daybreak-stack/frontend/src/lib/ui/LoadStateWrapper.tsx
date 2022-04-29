import { AnimatePresence, ForwardRefComponent, HTMLMotionProps, motion } from 'framer-motion'
import { WithDkLoadState } from 'lib/daybreak/ajax/DkLoadState'
import { sessionAtom } from 'modules/shared/sessionAtom'
import React from 'react'
import { useRecoilValue } from 'recoil'
import { LoadingSpinner } from './LoadingSpinner'

export type PLoadStateDisplayWrapper<T> = {
	loadState: WithDkLoadState<T>,
	pageContextInfo?: string,
	loadedDivProps?: ForwardRefComponent<HTMLDivElement, HTMLMotionProps<'div'>>,
	renderLoaded?: (data: T) => React.ReactNode,
	children?: React.ReactNode,
	hideButtons?: boolean
}
export const LoadStateDisplayWrapper = <T extends any> ({ loadState, pageContextInfo, loadedDivProps, renderLoaded, children, hideButtons }: PLoadStateDisplayWrapper<T>) => {

	const isLoading = loadState.loaded === null
	const isErrored = loadState.loaded === false
	const isLoaded = loadState.loaded === true

	const sess = useRecoilValue(sessionAtom)
	const userInfo = `id ${sess?.currentUser?.id ?? '?'} | prj ${sess.project?.id ?? '?'} | perm ${sess.project?.permissions.join('+')}`

	return <AnimatePresence>
		{
			isLoading
				? <motion.div className='flex flex-col items-center w-full p-5' animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
					<LoadingSpinner size={20} />
					<span>Loading...</span>
				</motion.div>
				: null
		}

		{
			isErrored
				? <motion.div transition={{ duration: 0.3, ease: 'anticipate' }} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className='flex flex-col items-center w-full p-5 rounded-md shadow-md bg-orange-50'>
					<div className='font-medium text-center text-orange-700'>Something went wrong</div>
					<div className='text-sm text-center text-gray-600'>If you need help, please show us this page so we can help you better.</div>

					<div className='p-1 mt-3 font-mono text-center text-orange-500 bg-orange-100 rounded-sm'>{ loadState.error.code }</div>
					<div className='mb-3 text-center text-black'>{ loadState.error.msg }</div>

					<div className='text-xs text-center text-gray-600'>at: { pageContextInfo }</div>
					<div className='mb-3 text-xs text-center text-gray-600'>{ userInfo }</div>

				</motion.div>
				: null
		}

		{
			isLoaded
				? <motion.div
					className='flex flex-col items-center w-full h-full max-w-full max-h-full min-w-0 min-h-0'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					{...loadedDivProps}
				>
					{ renderLoaded?.(loadState.data) }
					{ children }
				</motion.div>
				: null
		}
	</AnimatePresence>
}
