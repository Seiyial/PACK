import { AnimatePresence } from 'framer-motion'
import { LoginPage } from 'modules/prelogin/LoginPage'
import { Page } from 'modules/shared/Page'
import { Redirect } from 'modules/shared/Redirect'
import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

export type PRouter = {
}
export const Router: React.FC<PRouter> = ({ children }) => {

	return <>
		<BrowserRouter>
			<AnimatePresence>
				<Routes>
					<Route
						path='/'
						element={<Redirect targetPath='/login' />}
					/>
					<Route path='/login' element={<LoginPage />} />
					<Route path='/main' element={<Page>hello world</Page>} />
				</Routes>
			</AnimatePresence>
		</BrowserRouter>
	</>
}
