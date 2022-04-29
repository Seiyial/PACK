import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion' // optional. This gives the modals their animate-in-and-out.
import DkModalProvider from 'lib/daybreak/dom/DkModalProvider'
import { useString } from 'lib/daybreak/hooks/useString'
import { DkFailureResult } from 'lib/daybreak/core/DkResult'
import { getRecoil } from 'recoil-nexus'
import { Button } from './Button'
import useSession from 'modules/shared/useSession'
import { sessionAtom } from 'modules/shared/sessionAtom'

const modaler = new DkModalProvider(AnimatePresence)
export default modaler

/** usage: `modaler.showBlockingModal(simpleCMModal('alert message', 'optional title')) */
export const simpleAlertModal = (message: React.ReactNode, title?: string) => (perfClose: (data: undefined) => void) => <WBWModal
	perfClose={perfClose}
	isEscDismissible
	isOutsideClickDismissible
	hasCloseButton
	title={title}
>
	<div className='text-center'>{ message }</div>
</WBWModal>

export const simpleInputModal = (message: React.ReactNode, confirmButtonText: string, title?: string, defaultVal?: string, placeholder?: string) => (perfClose: (data: string | null) => void) => {
	return <InputModal
		confirmButtonText={confirmButtonText}
		message={message}
		perfClose={perfClose}
		overrideMaxWidth={380}
		isOutsideClickDismissible
		isEscDismissible
		hasCloseButton
		title={title}
		placeholder={placeholder}
		defaultVal={defaultVal}
	/>
}
const InputModal: React.FC<PCMModal & {defaultVal?: string, placeholder?: string, confirmButtonText: string, message: React.ReactNode}> = ({ message, confirmButtonText, perfClose, defaultVal, placeholder, ...modalProps }) => {
	const input = useString(defaultVal ?? '')

	return <WBWModal
		{...modalProps}
		perfClose={() => perfClose(null)}
	>
		<div className='pb-3'>{ message }</div>
		<input
			onChange={(e) => input.set(e.target.value)}
			value={input.val}
			autoFocus
			className='w-full px-4 py-2 font-semibold transition-colors border-2 rounded-md outline-none border-slate-300 hover:border-indigo-300 focus:border-indigo-700 placeholder:font-normal'
			placeholder=''
		/>

		<Button theme='primary_filled' onClick={() => perfClose(input.val)}>{ confirmButtonText }</Button>
	</WBWModal>
}

export type FSimpleConfirmationModal = {
	title: string,
	confirmText: string,
	cancelText: string
}

export const simpleConfirmationModal = (message: React.ReactNode, opts: Partial<FSimpleConfirmationModal> = {}) => (perfClose: (data: boolean) => void) => {
	let lis: undefined | ((ans: { key: string }) => any) = undefined
	const actualPerfClose = (ans: boolean) => {
		if (lis) document.removeEventListener('keydown', lis)
		return perfClose(ans)
	}
	lis = ({ key }: { key: string }) => key === 'Enter' ? actualPerfClose(true) : (key === 'Escape' ? actualPerfClose(false) : undefined)
	document.addEventListener('keydown', lis)
	return <WBWModal
		perfClose={() => perfClose(false)}
		isEscDismissible
		isOutsideClickDismissible
		hasCloseButton={false}
		title={opts.title}
	>
		<div className='text-center'>{ message }</div>
		<div className='flex items-center justify-center mt-3'>
			<Button theme='primary_filled' onClick={() => perfClose(true)}>
				{ opts.confirmText ?? 'Confirm' }
			</Button>
			<div className='w-3' />
			<Button theme='slate_medium_light' onClick={() => perfClose(false)}>
				{ opts.cancelText ?? 'Cancel' }
			</Button>
		</div>
	</WBWModal>
}

export const simpleErrorModal = (dkResult: DkFailureResult, debugActionInfo: string) => (perfClose: (data: undefined) => void) => {
	// const sess = useSession()
	const sess = getRecoil(sessionAtom)
	const userInfo = `id ${sess?.currentUser?.id ?? '?'} | prj ${sess.project?.id ?? '?'}`
	return <WBWModal
		perfClose={perfClose}
		isEscDismissible
		isOutsideClickDismissible
		hasCloseButton
	>
		<div className='font-bold text-center text-red-700'>Error :(</div>
		<div className='text-sm text-center text-slate-600'>To report an issue, take a screenshot of the current view and send it to us.</div>

		<div className='p-1 mt-5 font-mono text-center text-blue-400 rounded-sm bg-slate-50'>{ dkResult.errCode }</div>
		<div className='mb-5 text-center text-black'>{ dkResult.issue }</div>

		<div className='text-xs text-center text-slate-400'>at: { debugActionInfo }</div>
		<div className='mb-5 text-xs text-center text-slate-300'>{ userInfo }</div>

		<div className='flex items-center justify-center w-full'>
			<Button theme='teal_filled' className='px-5' onClick={() => perfClose(undefined)}>Close</Button>
		</div>
	</WBWModal>
}

export const CMModalPadding: React.FC = ({ children }) => <div className='p-5'>{ children }</div>

export type PCMModal = {
	/** If absent, will not render child. */
	title?: string | React.ReactNode,
	/** you can apply CMModalPadding yourself. */
	dontPadBody?: boolean,
	overrideMaxWidth?: React.CSSProperties['maxWidth'],
	hasCloseButton?: boolean
} & PWBWRawModal
export const WBWModal: React.FC<PCMModal> = ({ children, title, dontPadBody, overrideMaxWidth, hasCloseButton, ...rawModalProps }) => {
	return <>
		<WBWRawModal {...rawModalProps} overrideMaxWidth={overrideMaxWidth}>
			<div className='relative rounded-md shadow-md bg-slate-50' style={{ maxWidth: overrideMaxWidth ?? 300, maxHeight: '90vh', overflow: 'auto' }}>
				{
					title
						? <CMModalPadding><b>{ title }</b></CMModalPadding>
						: null
				}
				{
					dontPadBody
						? children
						: <CMModalPadding>{ children }</CMModalPadding>
				}
				{
					hasCloseButton && <div className='absolute grid w-8 h-8 transition-colors bg-gray-100 rounded-full cursor-pointer top-2 right-2 place-items-center hover:bg-gray-300' onClick={() => rawModalProps.perfClose()}>✕</div>
				}
			</div>

		</WBWRawModal>
	</>
}


type PWBWRawModal = {
	perfClose (data?: any): void,
	isEscDismissible?: boolean,
	isOutsideClickDismissible?: boolean,
	overrideMaxWidth?: React.CSSProperties['maxWidth']
}
const WBWRawModal: React.FC<PWBWRawModal> = ({
	children,
	isEscDismissible,
	isOutsideClickDismissible = true,
	perfClose,
	overrideMaxWidth
}) => {

	useEffect(() => {
		if (isEscDismissible) {
			const lis = (event: KeyboardEvent) => {
				if (event.key === 'Esc') perfClose()
			}
			document.addEventListener('keydown', lis)
			return () => { document.removeEventListener('keydown', lis) }
		}
	}, [isEscDismissible, perfClose])

	return <>
		<motion.div
			className='fixed top-0 left-0 z-30 w-full h-full'
			style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
			key='bg'
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.2, ease: 'easeOut' }}
			{...isOutsideClickDismissible ? { onClick: () => perfClose() } : {}}
		/>

		<motion.div
			transition={{ duration: 0.2, ease: 'easeOut' }}
			key='body'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 20 }}
			className='z-40'
			style={{ pointerEvents: 'none', height: '100%', width: '100%', position: 'fixed', top: 0, left: 0, display: 'grid', placeItems: 'center' }}
		>
			<div style={{ pointerEvents: 'auto', ...overrideMaxWidth ? { width: '100%', maxWidth: overrideMaxWidth } : {} }} onClick={(e) => { e.preventDefault(); e.stopPropagation() }}>
				{ children }
			</div>
		</motion.div>
	</>
}
