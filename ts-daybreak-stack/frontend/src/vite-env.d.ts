/// <reference types="vite/client" />

interface ImportMetaEnv extends Readonly<Record<string, string | number | boolean | undefined>> {
	readonly VITE_APP_TITLE: string
	readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}

declare module '*.pem' {
	const data: string
	export = data
}
