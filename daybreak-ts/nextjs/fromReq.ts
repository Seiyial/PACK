import { IncomingMessage } from 'http'

export const getLanguageFromRequest = (request?: IncomingMessage) => {
	const lang = request?.headers?.['accept-language']
	if (lang?.length) {
		return lang.split(',')[0] || 'en'
	} else {
		return 'en'
	}
}

export type DkNextPageProps<T> = {
	base: {
		lang: string,
	},
	data: T
}