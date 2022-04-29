import { q } from 'lib/daybreak/ajax/ajax'
import { r } from 'lib/daybreak/core/DkResult'
import { APIUserSessionData } from '@wbw/common/dto/APIUserSessionData'
import encryptPassword from 'lib/util/encryptPassword'

const querySession = {
	getState: () => q.GET<{ user: APIUserSessionData | null }>('/auth/session'),
	loginWithEmailPassword: async (email: string, password: string) => {
		const encryptedPassword = encryptPassword(password)
		if (encryptedPassword === false) return r.fail('INVALID_REQUEST')
		return q.POST<{user: APIUserSessionData}>('/auth/login', { email, encPw: encryptedPassword })
	},
	logout: () => q.GET('/auth/logout'),
	signup: async (fullname: string, email: string, pw: string, code: string | null, shortname: string) => {
		const encryptedPassword = encryptPassword(pw)
		if (!encryptedPassword) return r.fail('FE_INVALID_INPUT')
		return q.POST<{}>('/auth/signup', { email: email, encPw: encryptedPassword, registrationCode: code, fullname: fullname, shortname: shortname })
	},
	requestForgotPassword: (email: string) => q.POST('/auth/forgot-password', { email }),
	setForgottenPassword: async (code: string, newPwRaw: string) => {
		const newPwEnc = encryptPassword(newPwRaw)
		if (!newPwEnc) return r.fail('FE_INVALID_INPUT')
		return q.POST('/auth/set-forgotten-password', { code, newPwEnc: encryptPassword(newPwRaw) })
	}
}

export default querySession
