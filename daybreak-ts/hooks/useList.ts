import produce, { Draft, freeze } from 'immer'
import { useCallback, useState } from 'react'

const useList = <T> (initialValue: T[]) => {
	const [val, set] = useState(freeze(initialValue, true))

	const updater = useCallback((updater: (orig: Draft<T[]>) => any) => set(produce<T[]>((v) => { updater(v) })), [])

	const removeFirstWhere = useCallback((condition: (item: Draft<T>) => boolean) => {
		updater((list) => {
			const idx = list.findIndex(condition)
			if (idx !== -1)
				list.splice(idx, 1)
		})
	}, [])
	const add = useCallback((...newItems: Draft<T>[]) => {
		updater((list) => {
			list.push(...newItems)
		})
	}, [])

	return {
		// better than use-immer, because it allows returning anything whereas use-immer requires Not returning anything for mutable update
		// (thus this skips the need for { } function braces).
		update: updater,
		set,
		val,
		removeFirstWhere,
		add
	}
}

export default useList
