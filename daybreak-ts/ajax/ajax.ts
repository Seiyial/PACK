import axios, { AxiosResponse } from 'axios'
import { DkResult, DkSuccessResult, DkFailureResult } from '../core/DkResult'

const kBaseURL = import.meta.env.API_BASE_URL // if not using vite (or if there are diff. setups), modify accordingly

type HTTPMethod = 'POST' | 'GET' | 'DELETE'

type FExecuteQuery = {
	method: HTTPMethod
	baseURL?: string,
	usesCookies: boolean,
	headers: { [k: string]: string },
	/** POST request only */
	body: any
}
const executeQuery = async <ReturnType = undefined> (route: string, options: FExecuteQuery): Promise<DkResult<ReturnType>> => {
	return axios.request<object | ReturnType>({
		url: route,
		withCredentials: options.usesCookies,
		baseURL: options.baseURL ?? kBaseURL,
		headers: options.headers,
		method: options.method,
		data: options.body
	}).then((resp) => {
		console.info(`${options.method} ${route} =>`, resp.status, resp.data ?? '(no response)')
		if (resp.status.toString().startsWith('2')) {
			if (typeof resp.data === 'object' && resp.data) {
				if ('ok' in resp.data && typeof (resp.data as { ok: unknown }).ok === 'boolean') {
					if ((resp.data as { ok: boolean }).ok) {
						const { ok, data } = resp.data as any
						return ({
							ok: true as true,
							data: data as ReturnType
						}) as DkSuccessResult<ReturnType>
					} else {
						return ({
							ok: false as false,
							issue: (resp.data as any).issue ?? (resp.data as any).error ?? (resp.data as any).errorMsg ?? (resp.data as any).error,
							data: undefined,
							errCode: (resp.data as any).errCode ?? undefined,
							errProps: (resp.data as any).errProps
						}) as DkFailureResult
					}
				} else {
					console.error('[AutoFail] Bad response struct, please standardise :/')
					return ({
						ok: false as false,
						issue: (resp.data as any).issue ?? (resp.data as any).error ?? (resp.data as any).errorMsg ?? (resp.data as any).error ?? 'Unknown error (2)',
						data: undefined
					}) as DkFailureResult
				}
			} else {
				console.error('[AutoFail] Bad response struct, please standardise :/')
				return ({
					ok: false as false,
					issue: (resp.data as any).issue ?? (resp.data as any).error ?? (resp.data as any).errorMsg ?? (resp.data as any).error ?? 'Incompatible response struct',
					data: undefined,
					errCode: (resp.data as any).errCode ?? undefined,
					errProps: (resp.data as any).errProps
				}) as DkFailureResult
			}
		} else {
			return ({
				ok: false as false,
				issue: (resp.data as any).issue ?? (resp.data as any).error ?? (resp.data as any).errorMsg ?? (resp.data as any).error ?? 'Unknown error (3)',
				errCode: (resp.data as any).errCode ?? undefined,
				errProps: (resp.data as any).errProps,
				data: undefined
			}) as DkFailureResult
		}
	}).catch((error) => {
		if (error.response) {
			const resp: AxiosResponse<ExpectedErrorResponse> = error.response
			console.error(`${options.method} ${route} =>`, resp.status, resp.data)
			return ({
				ok: false,
				issue: (resp.data as any).issue ?? (resp.data as any).error ?? (resp.data as any).errorMsg ?? (resp.data as any).error ?? 'Incompatible response struct'
			}) as DkFailureResult
		} else {
			return ({
				ok: false,
				issue: 'Unknown_error'
			}) as DkFailureResult
		}
	})
}

type ExpectedErrorResponse = {
	ok: false,
	issue: string
} | {
	ok: false,
	error: string
}

export type DkHTTPOpts = {
	// method: HTTPMethod
	customBaseURL?: string,
	/** Default: `true` */
	useCookies?: boolean,
	headers?: { [k: string]: string },
}
const _applyOpts = (method: HTTPMethod, opts: DkHTTPOpts, reqBodyIfAny?: any): FExecuteQuery => ({
	body: reqBodyIfAny,
	headers: opts.headers ?? {},
	method,
	usesCookies: opts.useCookies ?? true,
	baseURL: opts.customBaseURL ?? import.meta.env.VITE_API_URL as string
})
const DkHTTP = {
	POST: <R = undefined> (route: string, body: object, opts: DkHTTPOpts = {}) => executeQuery<R>(route, _applyOpts('POST', opts, body)),
	GET: <R = undefined> (route: string, opts: DkHTTPOpts = {}) => executeQuery<R>(route, _applyOpts('GET', opts)),
	DELETE: <R = undefined> (route: string, opts: DkHTTPOpts = {}) => executeQuery<R>(route, _applyOpts('DELETE', opts))
}
export default DkHTTP
export const q = DkHTTP
