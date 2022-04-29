import produce, { Draft, freeze } from 'immer'
import React, { useCallback, useState } from 'react'

export type RUseList<T> = {
	list: T[],
	set: React.Dispatch<React.SetStateAction<T[]>>,
	update: (updater: (orig: Draft<T>[]) => any) => void,
	removeFirstWhere: (condition: (item: Draft<T>) => boolean) => void,
	add: (...newItems: Draft<T>[]) => void,
	removeIndex: (index: number) => void
}
const useList = <T> (
	initialValue: T[]
): RUseList<T> => {
	const [list, set] = useState(freeze(initialValue, true))

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
	const removeIndex = useCallback((index: number) => {
		updater((list) => {
			list.splice(index, 1)
		})
	}, [])

	return {
		// better than use-immer, because it allows returning anything whereas use-immer requires Not returning anything for mutable update
		// (thus this skips the need for { } function braces).
		update: updater,
		set,
		list,
		removeFirstWhere,
		add,
		removeIndex
	}
}

export default useList
