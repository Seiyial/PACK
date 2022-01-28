import { useState } from 'react'

export const useString = (initialValue: string = '') => {
	const [val, set] = useState<string>(initialValue)
	return {
		val,
		set,
		clear: () => set(initialValue),
		isEmpty: () => !val.length
	}
}
