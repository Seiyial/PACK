import { useState } from 'react'
import { toDkLoadState, WithDkLoadState } from '../ajax/DkLoadState'
import { DkResult } from '../core/DkResult'


const useLoadState = <T> () => {
	const [ls, setLS] = useState<WithDkLoadState<T>>({ loaded: null })

	return {
		takeResults: (result: DkResult<T>) => setLS(toDkLoadState(result)),
		set: setLS,
		setData: (data: T) => setLS({ loaded: true, data }),
		data: ls.loaded ? ls.data : null,
		loaded: ls.loaded,
		err: ls.loaded === false ? ls.error : null,
		loadState: ls
	}
}

export default useLoadState
