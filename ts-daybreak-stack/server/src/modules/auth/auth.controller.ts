import { Body, Controller, Get, Logger, Post, Session } from '@nestjs/common'
import { DkResult, r } from 'lib/daybreak'
import { V } from 'lib/daybreak/obj-lib/DkJSONValidator'
import { APIUser } from 'lib/model/APIUser'
import { APIUserSessionResult } from 'lib/model/APIUserSessionResult'
import { UserService } from 'modules/user/user.service'
import { AuthService } from './auth.service'
import { AppSession } from './auth.types'
import { APIUserSessionData } from '@wbw/common/dto/APIUserSessionData'

@Controller('auth')
export class AuthController {

	logger = new Logger('AuthController')

	constructor(
		private readonly authSvc: AuthService,
		private readonly userSvc: UserService
	) { }

	@Post('/signup')
	async signupWithEmailAndPassword (
		@Body() body: unknown,
		@Session() session: AppSession
	): Promise<DkResult<APIUser>> {
		if (session.userID) return r.fail('ALREADY_LOGGED_IN')
		const payload = new V<{ email: string, encPw: string, name: string }>(body, 'object', ['email', 'encPw', 'name'])
			.validate('email', V.isProbablyOkayEmailAddress)
			.validate('encPw', V.isNonEmptyString)
			.validate('name', V.isNonEmptyString)
			.acceptIfValid()

		if (!payload.ok) return r.fail('INVALID_REQUEST')

		const email = payload.data.email.toLowerCase()
		const pw = this.authSvc.decryptFrontendPassword(payload.data.encPw)
		if (!pw.ok) return pw
		const canCreateUser = await this.userSvc.checkEmailUnused(email)
		if (!canCreateUser.ok) return canCreateUser

		return this.userSvc.createUser(
			email,
			payload.data.name,
			pw.data,
		)
	}

	@Post('/login')
	async loginWithEmailPassword (
		@Body() body: unknown,
		@Session() session: AppSession
	): Promise<DkResult<{ user: APIUserSessionData }>> {
		const payload = new V<{ encPw: string, email: string }>(body, 'object', ['encPw', 'email'])
			.validate('email', V.isProbablyOkayEmailAddress)
			.validate('encPw', V.isNonEmptyString)
			.acceptIfValid()
		if (!payload.ok) return payload
		const user = await this.authSvc.validateUser(payload.data.email, payload.data.encPw)

		if (!user.ok) return user
		session.userID = user.data.id
		this.logger.log(session.userID)
		session.save()
		const userData = await this.userSvc.getUserFrontendSessionData(user.data.id)
		if (!userData.ok) return r.fail('UNKNOWN')
		return r.pass({ user: userData.data! })
	}

	@Get('/session')
	async getSessionIfAny ( 
		@Session() session: AppSession
	): Promise<DkResult<APIUserSessionResult>> {
		if (!session.userID) return r.pass({ user: null })
		const user = await this.userSvc.getUserFrontendSessionData(session.userID)
		if (!user.ok) {
			session.userID = undefined
			return r.pass({ user: null })
		}
		return r.pass({ user: user.data })
	}

	@Get('/logout')
	async logout (
		@Session() session: AppSession
	): Promise<DkResult> {
		session.userID = undefined
		return r.pass()
	}
}
