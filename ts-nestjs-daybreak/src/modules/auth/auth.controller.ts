import { Body, Controller, Get, Logger, Post, Session } from '@nestjs/common'
import { DkFailureResult, DkJSONValidator, DkResult, r } from 'lib/daybreak'
import { APIUser } from 'lib/model/APIUser'
import { APIUserSessionResult } from 'lib/model/APIUserSessionResult'
import { UserService } from 'modules/user/user.service'
import { AuthService } from './auth.service'
import { TiteSession } from './auth.types'

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
		@Session() session: TiteSession
	): Promise<DkResult<APIUser>> {
		if (session.userID) return r.fail('ALREADY_LOGGED_IN')
		const payload = new DkJSONValidator<{email: string, encPw: string, name: string}>(body, 'object', ['email', 'encPw', 'name'])
			.validate('email', DkJSONValidator.isProbablyOkayEmailAddress)
			.validate('encPw', DkJSONValidator.isNonEmptyString)
			.validate('name', DkJSONValidator.isNonEmptyString)
			.acceptIfValid()

		if (!payload.ok) return r.fail('INVALID_REQUEST')

		const email = payload.data.email.toLowerCase()
		const pw = this.authSvc.decryptFrontendPassword(payload.data.encPw)
		if (!pw.ok) return pw as DkFailureResult
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
		@Session() session: TiteSession
	): Promise<DkResult<{ user: APIUser }>> {
		if (session.userID) return r.fail('ALREADY_LOGGED_IN')

		const payload = new DkJSONValidator<{encPw: string, email: string}>(body, 'object', ['encPw', 'email'])
			.validate('email', DkJSONValidator.isProbablyOkayEmailAddress)
			.validate('encPw', DkJSONValidator.isNonEmptyString)
			.acceptIfValid()
		if (!payload.ok) return payload as DkFailureResult

		const user = await this.authSvc.validateUser(payload.data.email, payload.data.encPw)
		if (!user.ok) return user as DkFailureResult

		session.userID = user.data.id
		this.logger.log(session.userID)
		session.save()
		const userData = await this.userSvc.getUserFrontendSessionData(user.data.id)
		if (!userData) return r.fail('USER_NOT_FOUND')
		return r.pass({user: userData})
	}

	@Get('/session')
	async getSessionIfAny (
		@Session() session: TiteSession
	): Promise<DkResult<APIUserSessionResult>> {
		if (!session.userID) return r.pass({ user: null })
		const user = await this.userSvc.getUserFrontendSessionData(session.userID)
		if (!user) {
			session.userID = undefined
			return r.pass({ user: null })
		}
		return r.pass({ user })
	}

	@Get('/logout')
	async logout (
		@Session() session: TiteSession
	): Promise<DkResult> {
		session.userID = undefined
		return r.pass()
	}
}
