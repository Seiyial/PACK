import { APIProjectConcise } from '@wbw/common/dto/APIProjectConcise'
import { APIUserSessionData } from '@wbw/common/dto/APIUserSessionData'
import { useImmerRecoil } from 'lib/daybreak/hooks/useImmerRecoil'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import paths from './paths'
import querySession from './querySession'
import { sessionAtom } from './sessionAtom'

const kLocalStorageProjectKey = 'wbw-current-project-id'

const _isFetchingSession = {
	current: false
}

const useSession = (
	redirects: {
		ifLoggedIn?: true | string | false,
		ifNotLoggedIn?: string | false,
		ifLoggedInNoProjects?: string | false,
		/** "else" defaults to redirecting to 404. */
		matchProjectID?: { id: string, else?: {redirectPath: string} | {exec: () => void} },
	} = {}) => {

	const nav = useNavigate()
	const sessionStore = useImmerRecoil(sessionAtom)

	// const redirects = Object.assign({ ifNotLoggedIn: '/login', ifLoggedInNoProjects: '/projects' }, redirectOpts)

	const findLocalStorageProj = (result: APIUserSessionData): APIProjectConcise | null => {
		const projID = localStorage.getItem(kLocalStorageProjectKey)
		return projID ? (result.projects.find((p) => p.id === projID) ?? null) : null
	}
	const setCurrentProjectLS = (proj: APIProjectConcise) => {
		localStorage.setItem(kLocalStorageProjectKey, proj.id)
	}

	const fetchSession = async () => {
		_isFetchingSession.current = true
		return querySession.getState()
			.then((result) => {
				if (result.ok) {
					if (result.data.user) {
						let project: APIProjectConcise | null = findLocalStorageProj(result.data.user)
						if (redirects.matchProjectID) {
							const replProj: APIProjectConcise | undefined = result.data.user.projects.find((p) => p.id === redirects.matchProjectID!.id)
							if (replProj) {
								project = replProj
								setCurrentProjectLS(replProj)
							}
						} else {
							const currentProjectLS = localStorage.getItem(kLocalStorageProjectKey)
							if (currentProjectLS) {
								const currentProject = result.data.user.projects.find((p) => p.id === currentProjectLS)
								if (currentProject) {
									project = currentProject
								}
							}
						}
						sessionStore.setState({ currentUser: result.data.user, project: project ?? null, initialised: true })
					} else {
						sessionStore.setState({ currentUser: null, project: null, initialised: true })
					}
				} else {
				}
				return result
			})
			.finally(() => { _isFetchingSession.current = false })
	}

	const setCurrentProject = (project: APIProjectConcise) => {
		sessionStore.update((s) => {
			s.project = project
		})
		setCurrentProjectLS(project)
	}

	useEffect(() => {
		if (sessionStore.state.initialised) {
			if (sessionStore.state.currentUser) {
				if (redirects.matchProjectID?.id) {
					if (sessionStore.state.project && sessionStore.state.project.id === redirects.matchProjectID.id) {
						// pass
					} else {
						if (redirects.matchProjectID.else) {
							console.trace('redir')
							if ('redirectPath' in redirects.matchProjectID.else) {
								nav(redirects.matchProjectID.else.redirectPath)
							} else {
								redirects.matchProjectID.else.exec()
							}
						}
					}
				} else if (redirects.ifLoggedIn) {
					if (redirects.ifLoggedInNoProjects) {
						nav(
							sessionStore.state.project
								? (redirects.ifLoggedIn === true
									? paths.allIssueListsPage(sessionStore.state.project.id)
									: redirects.ifLoggedIn
								)
								: redirects.ifLoggedInNoProjects, { replace: true }
						)
					} else {
						console.trace('redir')
						nav(
							sessionStore.state.project
								? (redirects.ifLoggedIn === true
									? paths.allIssueListsPage(sessionStore.state.project.id)
									: redirects.ifLoggedIn
								)
								: paths.projectsPickerPage()
						)
					}
				} else if (redirects.ifLoggedInNoProjects && !sessionStore.state.project) {
					nav(redirects.ifLoggedInNoProjects)
				}
			} else {
				if (redirects.ifNotLoggedIn) {
					nav(redirects.ifNotLoggedIn)
				}
			}
		}
	}, [sessionStore.state])

	useEffect(() => {
		if (!sessionStore.state.initialised && !_isFetchingSession.current) {
			fetchSession()
		}
	}, [])

	return { ...sessionStore, nav, setCurrentProject, setCurrentProjectLS, findLocalStorageProj, refetch: fetchSession }
}
export default useSession
