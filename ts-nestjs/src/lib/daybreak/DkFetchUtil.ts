import { DkError, DkResult, DkResults, r } from './DkResult'


const DkPageTokenFetchUtil = {
	async fetchRecursively<T extends object> (
		fetcher: (syncToken: string | null, pageToken: string | null) => Promise<DkResult<{
			items: T[],
			syncToken: string | null,
			pageToken: string | null
		}>>,
		errorOnUncaught: DkError,
		existingSyncTokenIfAny?: string,
		logError?: (value: any) => void
	): Promise<DkResult<{syncToken: string | null, items: T[] }>> {

		const syncToken: string | null = existingSyncTokenIfAny ?? null
		let newSyncToken: string | null = null
		let pageToken: string | null = null
		const resultsList: T[] = []

		while (true) {
			try {
				const result = await fetcher(syncToken, pageToken)
				if (!result.ok) return result
				resultsList.push(...result.data.items)

				if (result.data.syncToken) {
					newSyncToken = result.data.syncToken
				}
				if (result.data.pageToken) {
					pageToken = result.data.pageToken
					continue
				} else {
					return r.pass({ items: resultsList, syncToken: newSyncToken })
				}
			} catch (e) {
				logError?.(e.stack)
				return DkResults.fail(errorOnUncaught)
			}
		}
	}
}

export default DkPageTokenFetchUtil
