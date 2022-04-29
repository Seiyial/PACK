import { AnimatePresence } from 'framer-motion'
import { NewIssueForm } from 'modules/composer/NewIssueForm'
import { IssueListPage } from 'modules/issue_list/IssueListPage'
import { LoginPage } from 'modules/prelogin/LoginPage'
import { ProjectsPickerPage } from 'modules/project_list/ProjectsPickerPage'
import { Page } from 'modules/shared/Page'
import { Redirect } from 'modules/shared/Redirect'
import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { IssuePage } from 'modules/issue_page/IssuePage'
import { AllIssueListsPage } from 'modules/all_issue_lists_page/AllIssueListsPage'

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
					<Route path='/projects' element={<ProjectsPickerPage welcome />} />
					<Route path='/main' element={<Page><IssueListPage /></Page>} />
					<Route path='/lists/:projectID' element={<Page><AllIssueListsPage /></Page>} />
					<Route path='/list/:projectID/:batchID' element={<Page><IssueListPage /></Page>} />
					<Route path='/list/:projectID/:batchID/new' element={<Page><NewIssueForm /></Page>} />
					<Route path='/issue/:projectID/:batchID/:issueID' element={<Page><IssuePage /></Page>} />
				</Routes>
			</AnimatePresence>
		</BrowserRouter>
	</>
}
