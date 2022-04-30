import { APIUserSessionData } from 'common/dto/APIUserSessionData'
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
		ifNotLoggedIn?: string | false
		/** "else" defaults to redirecting to 404. */
	} = {}) => {

	const nav = useNavigate()
	const sessionStore = useImmerRecoil(sessionAtom)

	const fetchSession = async () => {
		_isFetchingSession.current = true
		return querySession.getState()
			.then((result) => {
				if (result.ok) {
					if (result.data.user) {
						sessionStore.setState({ currentUser: result.data.user, initialised: true })
					} else {
						sessionStore.setState({ currentUser: null, initialised: true })
					}
				} else {
				}
				return result
			})
			.finally(() => { _isFetchingSession.current = false })
	}

	useEffect(() => {
		if (sessionStore.state.initialised) {
			if (sessionStore.state.currentUser) {
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

	return { ...sessionStore, nav, refetch: fetchSession }
}
export default useSession
