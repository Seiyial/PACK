import { User } from '@prisma/client'
import { Injectable } from '@nestjs/common'
import argon2 from 'argon2'
import { DkResult, r } from 'lib/daybreak'
import { PrismaService } from 'setup/db/prisma.service'

@Injectable()
export class UserService {

	constructor(
		private readonly prisma: PrismaService,
	) { }

	async findByEmail (usernameOrEmail: string) {
		return this.prisma.wrapResult(this.prisma.user.findUnique({
			where: { email: usernameOrEmail.toLowerCase() },
		}))
	}

	async checkEmailUnused (email: string): Promise<DkResult> {
		return this.prisma.user.findUnique({ where: { email: email.toLowerCase() } })
			.then((u) => {
				return u ? r.fail('USER_ALREADY_EXISTS') : r.pass()
			})
			.catch((e) => r.fail('UNKNOWN'))
	}

	async createUser (email: string, fullname: string, plainPassword: Buffer) {
		return this.prisma.wrapResult(this.prisma.user.create({
			data: {
				email: email.toLowerCase(),
				name: fullname,
				passwordHash: (await argon2.hash(plainPassword)),
			}
		})).then((result) => {
			if (!result.ok) return result

			return r.pass({
				id: result.data.id,
				name: result.data.name,
				email: result.data.email,
				// don't include passwordHash
			})
		})
	}

	/** assume user already exists. */
	async getUserFrontendSessionData (userID: string): Promise<DkResult<{email: string, name: string, id: string} | null>> {
		const usr = await this.prisma.wrapResult(this.prisma.user.findUnique({
			where: { id: userID }, select: {
				email: true,
				name: true,
				id: true,
			}
		}))
		if (!usr.ok) return usr
		return usr
	}
}
