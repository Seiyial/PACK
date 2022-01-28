import { useState } from 'react'

export const useBool = (initialValue: boolean = false) => {
	const [val, set] = useState<boolean>(initialValue)
	return {
		val,
		set,
		true: () => set(true),
		false: () => set(false),
		toggle: () => set((v) => !v)
	}
}
