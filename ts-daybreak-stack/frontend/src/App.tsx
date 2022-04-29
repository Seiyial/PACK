import React from 'react'
import { RecoilRoot } from 'recoil'
import RecoilNexus from 'recoil-nexus'
import { Router } from './Router'

function App () {
	return <RecoilRoot>
		<Router />
		<RecoilNexus />
	</RecoilRoot>
}

export default App
