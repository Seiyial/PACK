import { Injectable, Logger } from '@nestjs/common'
import { UserService } from 'modules/user/user.service'
import { privateDecrypt, createPrivateKey, KeyObject, constants } from 'crypto'
import { readFileSync } from 'fs'
import { DkResult, r } from 'lib/daybreak'
import argon2 from 'argon2'
import dkInspect from 'lib/daybreak/dkInspect'
import { User } from '.prisma/client'


@Injectable()
export class AuthService {

	logger = new Logger()
	privateKey: KeyObject

	constructor(
		private readonly userSvc: UserService,
	) {
		this.privateKey = createPrivateKey({
			key: readFileSync('./private/server_private_key.pem').toString('utf-8'),
			passphrase: process.env.FE_DECRYPT_KEY_PASSPHRASE,
		})
	}

	decryptFrontendPassword (frontendEncryptedPassword: string): DkResult<Buffer> {
		try {
			return r.pass(
				privateDecrypt(
					{
						padding: constants.RSA_PKCS1_PADDING,
						key: this.privateKey
					},
					Buffer.from(frontendEncryptedPassword, 'base64')
				)
			)
		} catch (e) {
			dkInspect(e, this.logger.error)
			return r.fail('INVALID_SESSION')
		}
	}

	async validateUser (userEmail: string, frontendEncryptedPassword: string): Promise<DkResult<User>> {
		let password: Buffer
		try {
			password = privateDecrypt(
				{
					padding: constants.RSA_PKCS1_PADDING,
					key: this.privateKey
				},
				Buffer.from(frontendEncryptedPassword, 'base64')
			)
		} catch (e) {
			this.logger.warn((e as Error).stack)
			return r.fail('INVALID_REQUEST')
		}

		const user = await this.userSvc.findByEmail(userEmail.toLowerCase())
		if (!user.ok) return r.fail('USER_NOT_FOUND')
		const isValidPassword = await argon2.verify(user.data.passwordHash, password).catch((e) => {
			this.logger.error(e)
			return false
		})
		if (!isValidPassword) return r.fail('INVALID_REQUEST', { incorrectPassword: true })

		return r.pass(user.data)
	}
}
