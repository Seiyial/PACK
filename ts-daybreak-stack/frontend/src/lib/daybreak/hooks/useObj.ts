import produce, { Draft, freeze } from 'immer'
import { useCallback, useState } from 'react'

const useObj = <T>(initialValue: T) => {
	const [val, set] = useState(freeze(initialValue, true))

	return {
		// better than use-immer, because it allows returning anything whereas use-immer requires Not returning anything for mutable update
		// (thus this skips the need for { } function braces).
		update: useCallback((updater: (orig: Draft<T>) => any) => set(produce<T>((v) => { updater(v) })), []),
		set,
		val
	}
}

export default useObj