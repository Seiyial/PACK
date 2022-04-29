import React from 'react'
import DkToasterProvider from 'lib/daybreak/dom/DkToasterProvider'
import { AnimatePresence, motion } from 'framer-motion'

const instance = new DkToasterProvider(AnimatePresence, ['top', 'right'], {})
const perfToast = (
	textOrFrag: React.ReactNode | string,
	ms: number | undefined,
	theme: WBWToastTheme
) => instance.toast((diss, toastID) =>
	<WBWToast
		id={toastID}
		performDismiss={diss}
		theme={theme}
	>
		{ textOrFrag }
	</WBWToast>,
ms
)
const toaster = {
	instance,
	info: (textOrFrag: React.ReactNode | string, ms: number | undefined = 3000) => perfToast(textOrFrag, ms, 'default'),
	primary: (textOrFrag: React.ReactNode | string, ms: number | undefined = 3000) => perfToast(textOrFrag, ms, 'primary'),
	danger: (textOrFrag: React.ReactNode | string, ms: number | undefined = 3000) => perfToast(textOrFrag, ms, 'danger'),
	success: (textOrFrag: React.ReactNode | string, ms: number | undefined = 3000) => perfToast(textOrFrag, ms, 'success'),
	warn: (textOrFrag: React.ReactNode | string, ms: number | undefined = 3000) => perfToast(textOrFrag, ms, 'warning')
}
export default toaster

export const WBWToastThemes = ['default', 'danger', 'info', 'primary', 'success', 'warning'] as const
export type WBWToastTheme = typeof WBWToastThemes[number]

const colours: { [k in WBWToastTheme]: string } = {
	danger: 'bg-red-200 text-red-800',
	default: 'bg-slate-200 text-slate-800',
	info: 'bg-sky-200 text-sky-800',
	primary: 'bg-indigo-200 text-indigo-800',
	success: 'bg-emerald-200 text-emerald-800',
	warning: 'bg-yellow-200 text-yellow-800'
}


/** This can be adapted into any project that uses a framer-motion toaster component. */

export type PWBWToast = {
	theme?: WBWToastTheme
	style?: React.CSSProperties,
	performDismiss (): void,
	id: string,
	className?: string
}
export const WBWToast: React.FC<PWBWToast> = ({ children, style, performDismiss, id, className, theme = 'default' }) => {
	return <>
		<motion.div
			className={`py-3 px-4 min-h-[40px] w-full flex items-start z-[200] rounded-md shadow-md shadow-slate-500/20 transition-colors ${colours[theme]} ${className}`}
			layout
			layoutId={id}
			data-info='TOAST'
			whileDrag={{ opacity: 0.5 }}
			onPanEnd={(e, i) => {
				if (i.offset.x > 0) {
					performDismiss()
				}
			}}
			drag='x'
			dragSnapToOrigin
			dragElastic={{ left: 0, right: 0 }}
			dragConstraints={{ left: 0 }}
			initial={{ opacity: 0, y: -30 }}
			animate={{ opacity: 1, y: 0, x: 0 }}
			exit={{ opacity: 0, x: 600 }}
			transition={{ duration: 0.4 }}
		>
			{ children }
		</motion.div>
	</>
}
