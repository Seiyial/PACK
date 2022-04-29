import { useEffect, useMemo } from 'react'
import { RecoilState } from 'recoil'
import { WithDkLoadState } from '../ajax/DkLoadState'
import { DkResult } from '../core/DkResult'
import { useImmerRecoil } from '../hooks/useImmerRecoil'
import { DkFPSPaginatedResult } from './DkFPSPaginatedResult'

// DkPaginatedList with Fixed Page Size

export type DkFPSPaginatedList<T> = {
	pages: WithDkLoadState<T[]>[],
	pgIndex: number,
	maxItemsPerPage: number,
	numPages: number | null,
	numTotalItems: number | null
}
export const createEmptyDkFPSPaginatedList = <T>(maxItemsPerPage: number): DkFPSPaginatedList<T> => {
	return {
		pages: [{ loaded: null }],
		pgIndex: 0,
		maxItemsPerPage,
		numPages: null,
		numTotalItems: null
	}
}

export const useDkFPSPaginatedList = <T, P extends any[]>(
	atom: RecoilState<DkFPSPaginatedList<T>>,
	fetcher: (pgIndex: number, ...params: P) => Promise<DkFPSPaginatedResult<T>>,
	opts: { initPageNum?: number, itemsPerPage?: number },
	...params: P
) => {
	const state = useImmerRecoil<DkFPSPaginatedList<T>>(atom)

	const perfFetchPage = async (pgIndex: number, unloadRest: boolean = false) => {
		return fetcher(pgIndex, ...params)
			.then((result) => {
				if (result.ok) {
					console.log({ result })
					if (result.data.ipp === state.state.maxItemsPerPage) {
						if (unloadRest) {
							state.update((s) => {
								s.pages = []
								s.pages[result.data.pgIndex] = { loaded: true, data: result.data.pgItems }
							})
						} else {
							state.update((s) => {
								s.pages[result.data.pgIndex] = { loaded: true, data: result.data.pgItems }
							})
						}
					} else {
						console.log('IPP mismatch', result.data.ipp, state.state.maxItemsPerPage)
					}
				}
			})
	}

	const currentPage = useMemo(() => {
		return state.state.pages[state.state.pgIndex] ?? { loaded: null }
	}, [state.state.pgIndex, state.state.pages, state.state.maxItemsPerPage, state.state])

	/** sets the next page to unloaded if not present, and queues a fetch of that page. */
	const perfShiftPage = (delta: number, unloadRest: boolean = true) => {
		const newPageIndex = state.state.pgIndex + delta
		perfSetPageIndex(newPageIndex, unloadRest)
	}

	/** sets the next page to unloaded if not present, and queues a fetch of that page. */
	const perfSetPageIndex = (newPgIndex: number, unloadRest: boolean = true): boolean => {
		const canSet = typeof state.state.numPages === 'number' && newPgIndex >= 0 && newPgIndex < (state.state.numPages - 1)
		if (!canSet) return false
		state.update((s) => {
			s.pages[newPgIndex] ??= { loaded: null }
			s.pgIndex = newPgIndex
		})
		perfFetchPage(newPgIndex, unloadRest)
		return true
	}
	const canGoNext = typeof state.state.numPages === 'number' && state.state.pgIndex < (state.state.numPages - 1)
	const canGoPrev = state.state.pgIndex > 0

	useEffect(() => {
		perfFetchPage(state.state.pgIndex)
	}, [atom])

	return {
		currentPage,
		...state,
		perfFetchPage,
		perfShiftPage,
		perfSetPageIndex,
		canGoNext,
		canGoPrev
	}
}
