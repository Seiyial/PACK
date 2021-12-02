import { DkError, DkErrorCode, DkErrors } from './DkErrors'

type DkSuccessResult<DataType = undefined> = (
	DataType extends undefined
	? { data?: undefined, ok: true, issue?: undefined, errProps?: undefined }
	: { data: DataType, ok: true, issue?: undefined, errProps?: undefined }
)

export type DkFailureResult = {
	ok: false,
	issue: string,
	errCode?: DkErrorCode,
	data?: undefined
	errProps: { [k: string]: any }
}

export type DkResult<DataType = undefined> = DkSuccessResult<DataType> | DkFailureResult

export const DkResults = {
	fail: (issue: string | DkError, data?: { [k: string]: any }, customErrCode?: string): DkFailureResult => {
		if (typeof issue === 'string') {
			return <DkFailureResult>({ ok: false, issue, errProps: data, errCode: customErrCode })
		} else {
			return <DkFailureResult>({ ok: false, issue: issue.errMsg, errCode: issue.errCode, errProps: data })
		}
	},
	pass: <T = undefined>(data?: T): DkSuccessResult<T> => {
		return <DkSuccessResult<T>>({ ok: true, data })
	},
	_extractErrorFromResult: (result: DkFailureResult): DkError => {
		return ({ _isDkError: true, errCode: result.errCode ?? 'UNKNOWN', errMsg: DkErrors[result.errCode ?? 'UNKNOWN']?.errMsg ?? 'unknown--', props: result.errProps })
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
