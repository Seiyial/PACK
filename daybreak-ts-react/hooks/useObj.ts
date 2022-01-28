import { useImmer } from 'use-immer'
import { Draft } from 'immer'
import { useCallback } from 'react'

const useObj = <T>(initialValue: T) => {
	const [val, set] = useImmer(initialValue)

	return {
		update: useCallback((updater: (orig: Draft<T>) => any) => set((val) => { updater(val) }), []),
		set,
		val
	}
}

export default useObj