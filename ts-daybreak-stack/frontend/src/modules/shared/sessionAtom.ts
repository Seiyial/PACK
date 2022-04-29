import { atom } from 'recoil'
import { APIUserSessionData } from '@wbw/common/dto/APIUserSessionData'
import { APIProjectConcise } from '@wbw/common/dto/APIProjectConcise'

export const sessionAtom = atom({
	key: 'session',
	default: {
		initialised: false as boolean,
		currentUser: null as null | APIUserSessionData,
		project: null as null | APIProjectConcise
	}
})
