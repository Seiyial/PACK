import { atom } from 'recoil'
import { APIUserSessionData } from 'common/dto/APIUserSessionData'

export const sessionAtom = atom({
	key: 'session',
	default: {
		initialised: false as boolean,
		currentUser: null as null | APIUserSessionData
	}
})
