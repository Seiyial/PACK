import { useState } from 'react'

export const useConst = <T>(
	_arrayOfPossibleValues: readonly T[],
	initialValue: T
) => {
	const [val, set] = useState<T>(initialValue)
	return {
		val,
		set
	}
}
