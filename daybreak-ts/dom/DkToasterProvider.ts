import React from 'react'
import ReactDOM from 'react-dom'

/** See DkToasterProvider.ts for usage. */
class DkToasterProvider {

	private container: HTMLElement
	private innerWrapper: React.FC | null
	/** `[id: number, render: React.ReactNode]` */
	private toastRenders: React.ReactNode[]
	private toastIDs: number[]
	private idIncrementer: number
	private containerID = 'toastrr'

	constructor (
		/** use either `AnimatePresence` or `React.Fragment` (not tested) as input */
		innerWrapper: null | React.FC,
		position: ['top' | 'bottom', 'left' | 'right'],
		/** was mostly not used. */
		containerStyle?: React.CSSProperties
	) {
		const isMounted = document.getElementById(this.containerID)
		this.container = isMounted ?? document.createElement('div')
		this.container.id = this.containerID
		Object.assign(this.container.style, {
			// this is not react styling but DOM styling. use DOM accepted values (i.e. strings).
			// todo: different behaviour on mobile?
			position: 'fixed',
			[position[0]]: '20px',
			[position[1]]: '20px',
			display: 'flex',
			flexDirection: 'column',
			minWidth: '0px',
			width: '100%',
			maxWidth: '400px',
			maxHeight: '100vh',
			overflowY: 'visible',
			zIndex: 300,
			// for testing only
			// backgroundColor: 'rgba(0, 0, 0, 0.2)',
			...containerStyle ?? {}
		} as React.CSSProperties)
		if (!isMounted) document.body.appendChild(this.container)

		this.innerWrapper = innerWrapper
		this.toastRenders = []
		this.idIncrementer = 0
		this.toastIDs = []
	}

	renderContainer () {
		ReactDOM.render(
			React.createElement(this.innerWrapper ?? React.Fragment, {}, ...this.toastRenders),
			document.getElementById(this.containerID)
		)
	}

	toast (
		renderer: (performDismiss: () => void, toastID: string) => React.ReactNode,
		/** if none, rendered component must perform "performDismiss" in some way. */
		timeoutMS?: number
	) {
		this.idIncrementer += 1
		const id = this.idIncrementer
		this.toastIDs.push(id)
		this.toastRenders.push(
			renderer(
				() => this.dismiss(id),
				id.toString()
			)
		)
		this.renderContainer()
		if (typeof timeoutMS === 'number') {
			var that = this
			setTimeout(() => { that.dismiss(id) }, timeoutMS)
		}
	}

	dismiss (id: number) {
		const index = this.toastIDs.findIndex((i) => i === id)
		// user could've removed the toast by themselves
		if (index === -1) return
		this.toastIDs.splice(index, 1)
		this.toastRenders.splice(index, 1)
		this.renderContainer()
	}
}

export default DkToasterProvider

// USAGE
// export const toaster = new DkToasterProvider(AnimatePresence, ['top', 'right'], {})

// export const WBWToastThemes = ['default', 'danger', 'info', 'primary', 'success'] as const
// export type WBWToastTheme = typeof WBWToastThemes[number]

// const colours: { [k in WBWToastTheme]: string } = {
// 	danger: 'bg-red-100',
// 	default: 'bg-slate-100',
// 	info: 'bg-sky-100',
// 	primary: 'bg-indigo-100',
// 	success: 'bg-emerald-100'
// }


// /** This can be adapted into any project that uses a framer-motion toaster component. */

// export type PWBWToast = {
// 	theme?: WBWToastTheme
// 	style?: React.CSSProperties,
// 	performDismiss (): void,
// 	id: string,
// 	className?: string
// }
// export const WBWToast: React.FC<PWBWToast> = ({ children, style, performDismiss, id, className, theme = 'default' }) => {
// 	return <>
// 		<motion.div
// 			className={`py-3 px-4 min-h-[40px] w-full flex items-start z-[200] rounded-md shadow-md shadow-slate-500/20 transition-colors ${colours[theme]} ${className}`}
// 			layout
// 			layoutId={id}
// 			data-info='TOAST'
// 			whileDrag={{ opacity: 0.5 }}
// 			onPanEnd={(e, i) => {
// 				if (i.offset.x > 0) {
// 					performDismiss()
// 				}
// 			}}
// 			drag='x'
// 			dragSnapToOrigin
// 			dragElastic={{ left: 0, right: 0 }}
// 			dragConstraints={{ left: 0 }}
// 			initial={{ opacity: 0, y: -30 }}
// 			animate={{ opacity: 1, y: 0, x: 0 }}
// 			exit={{ opacity: 0, x: 600 }}
// 		>
// 			{ children }
// 		</motion.div>
// 	</>
// }
