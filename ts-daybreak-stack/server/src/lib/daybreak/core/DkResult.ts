import { _appErrors } from './appErrors'

// if your `if (!result.ok) return result` is not casted as DkFailureResult, use `alwaysStrict: true, strictNullChecks: true` in tsconfig.
type DkSuccessResult<DataType = undefined> = { data: DataType, ok: true, issue?: undefined, errCode?: undefined, errProps?: undefined, err?: undefined }

type DkFailureResult = {
	ok: false,
	err: DkError,
	issue: string,
	errCode?: DkErrorCode,
	errProps: any,
	data?: undefined
}

export type DkResult<DataType = undefined> = DkSuccessResult<DataType> | DkFailureResult

export type DkError = {
	code: DkErrorCode,
	msg: string,
	_isDkError: true,
	props?: object
}

export const DkErrors = Object.fromEntries(
	Object
		.entries(_appErrors)
		.map(([k, v]) => ([k as DkErrorCode, { code: k, msg: v, _isDkError: true } as DkError]))
) as { [k in DkErrorCode]: DkError }

export type DkErrorCode = keyof typeof _appErrors

export const r = {
	pass: <T = undefined> (data?: T): DkSuccessResult<T> => {
		return <DkSuccessResult<T>>({ ok: true, data })
	},
	fail: (errCode: DkErrorCode, props?: any): DkFailureResult => {
		const err = DkErrors[errCode]
		return {
			ok: false,
			issue: err.msg,
			err,
			errCode,
			errProps: props,
		}
	},
	customFail: (msg: string, props?: any, errCode?: DkErrorCode): DkFailureResult => {
		const code = errCode ?? 'OTHER'
		const errorObj: DkError = {
			_isDkError: true,
			code,
			msg,
			props
		}
		return <DkFailureResult>({ ok: false, issue: msg, errProps: props, err: errorObj, errCode: code })
	},
	removeData: (result: DkResult<any>): DkResult<undefined> => {
		return result.ok
			? { ok: true, data: undefined }
			: { ok: false, issue: (result as DkFailureResult).issue, errProps: null, err: (result as DkFailureResult).err, errCode: (result as DkFailureResult).errCode }
	}
}
