import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import viteTSConfigPaths from 'vite-tsconfig-paths'

const stringifyPEMFilePlugin = () => {
	const pemFileName = 'frontend_public_key.pem'
	return {
		name: 'stringify-pem-file-tite-plugin',
		transform: ((content, id, ssr) => {
			if (id.endsWith(pemFileName)) {
				return `export default \`${content}\``
			}
		}) as Plugin['transform']
	}
}

// https://vitejs.dev/config/
export default defineConfig({
	server: {
		port: 3001,
		fs: {
			strict: false
		},
	},
	esbuild: {

	},
	plugins: [
		react(),
		viteTSConfigPaths(),
		stringifyPEMFilePlugin()
	]
})
