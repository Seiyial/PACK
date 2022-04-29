import { useRef, useState } from 'react'
import { DkError, DkErrors } from '../core/DkResult'

export type RUseError = ReturnType<typeof useError>
const useError = (initial?: DkError) => {
	const [state, setState] = useState<DkError | null>(null)
	const int = useRef<number>()

	return {
		show: (err: DkError, timeoutMS: number = 3000) => {
			if (int.current !== undefined) {
				clearTimeout(int.current)
				int.current = undefined
			}
			setState(err ?? DkErrors.UNKNOWN)
			int.current = setTimeout(() => {
				setState(null)
				int.current = undefined
			}, timeoutMS)
		},
		clear: () => {
			if (int.current !== undefined) {
				clearTimeout(int.current)
				int.current = undefined
			}
			setState(null)
		},
		_factorySetState: setState,
		current: state
	}
}

export default useError
