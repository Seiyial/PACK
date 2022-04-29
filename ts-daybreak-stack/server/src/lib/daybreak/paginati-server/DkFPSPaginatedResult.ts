import { DkResult } from '../core/DkResult'

export type DkFPSPaginatedResult<T> = DkResult<DkFPSPaginatedPatch<T>>
export type DkFPSPaginatedPatch<T> = {
	ipp: number,
	pgIndex: number,
	numTotalItems: number,
	pgItems: T[]
}
