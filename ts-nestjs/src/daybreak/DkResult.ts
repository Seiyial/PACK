type DkSuccessResult<DataType = undefined> = (
	DataType extends undefined
	? { data?: undefined, ok: true, issue?: undefined, errProps?: undefined }
	: { data: DataType, ok: true, issue?: undefined, errProps?: undefined }
)

type DkFailureResult = {
	ok: false,
	issue: string,
	errCode?: DkErrorCode,
	data?: undefined
	errProps: { [k: string]: any }
}

export type DkResult<DataType = undefined> = DkSuccessResult<DataType> | DkFailureResult

const _DkErrors = {
	USER_NOT_FOUND: '',
	INVALID_SESSION: '(Invalid Session) please login again.',
	INVALID_REQUEST: 'Invalid request.',

	PRISMA_NOT_FOUND: 'Sorry, data not found.',
	PRISMA_ERROR: 'Failed to update data.',
	PRISMA_UNKNOWN: 'Sorry, database error. Please try again. If this persists, do contact us. (U)',
	PRISMA_RUST_PANIC_ERROR: 'Sorry, database error. Please try again. If this persists, do contact us. (U)',
	PRISMA_STRUCTURE_OR_VALIDATION_ERROR: 'Failed to update data. (PSOVE)',

	REDIS_ERROR: 'Failed to post data (R)',
	REDIS_STORED_BAD_FORMAT: 'Sorry, some data couldn\'t be retrieved. This is most likely a fault on our side.',

	NOT_YET_SUPPORTED: 'This feature is not yet supported.',

	UNKNOWN: 'Sorry, something went wrong.'
} as const

export type DkError = {
	errCode: DkErrorCode,
	errMsg: string,
	_isDkError: true,
	props?: object
}

export const DkErrors = Object.fromEntries(
	Object
		.entries(_DkErrors)
		.map(([k, v]) => ([k as DkErrorCode, { errCode: k, errMsg: v, _isDkError: true } as DkError]))
) as { [k in DkErrorCode]: DkError }

export type DkErrorCode = keyof typeof _DkErrors

export const DkResults = {
	fail: (issue: string | DkError, data?: { [k: string]: any }): DkFailureResult => {
		if (typeof issue === 'string') {
			return <DkFailureResult>({ ok: false, issue, errProps: data })
		} else {
			return <DkFailureResult>({ ok: false, issue: issue.errMsg, errCode: issue.errCode, errProps: data })
		}
	},
	pass: <T = undefined>(data?: T): DkSuccessResult<T> => {
		return <DkSuccessResult<T>>({ ok: true, data })
	},
	_extractErrorFromResult: (result: DkFailureResult): DkError => {
		return ({ _isDkError: true, errCode: result.errCode ?? 'UNKNOWN', errMsg: _DkErrors[result.errCode ?? 'UNKNOWN'], props: result.errProps })
	},
	withoutData: (result: DkResult<any>): DkResult<undefined> => {
		return result.ok
			? { ok: true }
			: { ok: false, issue: result.issue, errProps: {}, errCode: (result as DkFailureResult).errCode }
	}
}

export const r = {
	pass: DkResults.pass,
	fail: (errCode: DkErrorCode, props?: { [k: string]: any }): DkFailureResult => ({
		ok: false,
		issue: DkErrors[errCode].errMsg,
		errCode,
		errProps: props ?? {},
		data: undefined
	}),
	prisma: <T extends object>(result: Promise<T>): Promise<DkResult<T>> => result
		.then((val) => ({ ok: true, data: val }) as DkSuccessResult<T>)
		.catch(() => ({ ok: false, errProps: {}, issue: DkErrors.PRISMA_ERROR.errMsg, errCode: 'PRISMA_ERROR' })),
	make: (result: Promise<any>): Promise<DkResult> => result
		.then(() => ({ ok: true, data: undefined }) as DkSuccessResult<undefined>)
		.catch((e) => ({ ok: false, errProps: {}, issue: DkErrors.PRISMA_ERROR.errMsg, errCode: 'PRISMA_ERROR' })),


	catchPrisma: (error: any, logError?: (stack: string) => void, errLabel?: string): DkFailureResult => {
		logError?.(`${errLabel ? `<<${errLabel}>>` : 'JS Error?'}\nError: ${error.name}\nMessage: ${error.message}\nStack: ${error.stack}`)
		return { ok: false, errProps: {}, issue: DkErrors.PRISMA_ERROR.errMsg, errCode: 'PRISMA_ERROR' }
	}
}
