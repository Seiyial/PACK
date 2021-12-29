import React, { useState } from 'react'

function App() {
	const [count, setCount] = useState(0)

	return <main className='h-full w-full max-h-full max-w-full min-h-0 min-w-0 bg-slate-50 flex flex-col items-center justify-center'>
		<div className="text-slate-900 text-5xl font-medium text-center">
			<div className="text-blue-600">ReactJS</div>
			<div className="text-slate-400 font-light">×</div>
			<div className="text-blue-900">TypeScript</div>
			<div className="text-slate-400 font-light">×</div>
			<div className="text-sky-400">TailwindCSS</div>
			<div className="text-slate-400 font-light">×</div>
			<div className="text-transparent bg-clip-text bg-gradient-to-br from-sky-600 to-purple-500 drop-shadow-lg">Vite</div>

			<div className="mt-10 text-sm">By SYXWORKS / Daybreak.pub</div>
		</div>
	</main>
}

export default App
