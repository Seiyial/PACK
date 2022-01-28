import { DkResult, toDkError } from '../types/DkResult'
import { DkError } from '../types/DkErrors'

export type DkLoadState = {
	loaded: null
} | {
	loaded: true
} | {
	loaded: false,
	error: DkError
}

export type WithDkLoadState<T> = {
	loaded: null
} | {
	loaded: true,
	data: T,
} | {
	loaded: false,
	error: DkError
}

export const dkLoadState = {
	empty: <T = undefined> (): T extends undefined ? DkLoadState : WithDkLoadState<T> => ({ loaded: null } as T extends undefined ? DkLoadState : WithDkLoadState<T>)
}
export const toDkLoadState = <T = undefined> (result: DkResult<T>): WithDkLoadState<T> =>
	result.ok
		? ({ loaded: true, data: result.data as T })
		: ({ loaded: false, error: toDkError(result) })
