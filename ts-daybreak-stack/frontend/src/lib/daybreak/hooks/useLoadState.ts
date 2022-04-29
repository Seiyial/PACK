import { useState } from 'react'
import { toDkLoadState, WithDkLoadState } from '../ajax/DkLoadState'
import { DkError, DkResult } from '../core/DkResult'
import { Draft, produce } from 'immer'


const useLoadState = <T> () => {
	const [ls, setLS] = useState<WithDkLoadState<T>>({ loaded: null })

	return {
		takeResults: (result: DkResult<T>) => setLS(toDkLoadState(result)),
		set: setLS,
		setData: (data: T) => setLS({ loaded: true, data }),
		patchData: (updater: (state: Draft<T>) => void) => {
			setLS((state) => {
				if (state.loaded) {
					return { loaded: true, data: produce((s) => { updater(s) }, state.data)() }
				} else {
					return state
				}
			})
		},
		data: ls.loaded ? (ls as { loaded: true, data: T }).data : null,
		loaded: ls.loaded,
		err: ls.loaded === false ? (ls as { loaded: false,	error: DkError }).error : null,
		loadState: ls
	}
}

export default useLoadState
