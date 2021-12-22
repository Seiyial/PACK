import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import linariaRollupPlugin from '@linaria/rollup'

// https://vitejs.dev/config/
export default defineConfig({
	esbuild: {
		
	},
	plugins: [
		react(),
		linariaRollupPlugin()
	]
})
