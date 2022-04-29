import { AnimatePresence } from 'framer-motion'
import React from 'react'
import ReactDOM from 'react-dom'

// USAGE
/**
 * ```typescriptreact
 *
 * import { AnimatePresence, motion } from 'framer-motion' // optional. This gives the modals their animate-in-and-out.
 *
 * const modaler = new DkModalProvider(AnimatePresence)
 *
 * modaler.showBlockingModal((close) => {
 * 	// this is the modal window; check CMRawModal for implementation
 * 	return <>
 * 		<motion.div
 * 			key={1}
 * 			style={{ position: 'fixed', zIndex: 3, top: 0, left: 0, height: 300, width: 300, backgroundColor: 'gainsboro' }}
 * 			onClick={() => close(undefined)}
 * 			initial={{ opacity: 0 }}
 * 			animate={{ opacity: 1 }}
 * 			exit={{ opacity: 0 }}
 * 			transition={{ duration: 2 }}
 * 		>
 * 			Helloooo
 * 		</motion.div>
 * 		<motion.div
 * 			key={2}
 * 			style={{ position: 'fixed', top: 0, left: 0, height: '100%', width: '100%', backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
 * 			onClick={() => close(undefined)}
 * 			initial={{ opacity: 0 }}
 * 			animate={{ opacity: 1 }}
 * 			exit={{ opacity: 0 }}
 * 			transition={{ duration: 1 }}
 * 		>
 * 		</motion.div>
 * 	</>
 * })
 * ```
 *
*/
export default class DkModalProvider {

	container: HTMLDivElement
	wrapperComponent?: React.FC

	constructor (
		/** Use `AnimatePresence` from `framer-motion` to enable `framer-motion` animations. */
		wrapperComponent?: React.FC
	) {
		this.wrapperComponent = wrapperComponent
		this.container = document.createElement('div')
		this.container.id = 'modalrrr'
		document.body.appendChild(this.container)
	}

	async showBlockingModal<T = undefined> (
		renderer: (
			close: (data: T) => void
		) => React.ReactNode
	): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			ReactDOM.render(
				React.createElement(AnimatePresence, null, renderer(resolve)),
				this.container
			)
		}).then((resolvedValue) => {
			ReactDOM.render(
				React.createElement(AnimatePresence, null),
				this.container
			)
			return resolvedValue
		})
	}
}
