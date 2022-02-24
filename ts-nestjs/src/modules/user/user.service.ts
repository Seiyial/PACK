import { Injectable } from '@nestjs/common'
import { User } from '.prisma/client'
import { PrismaService } from 'setup/db/prisma.service'
import argon2 from 'argon2'
import { DkResult, r } from 'lib/daybreak'
import { APIUser } from 'lib/model/APIUser'

@Injectable()
export class UserService {

	constructor(
		private readonly prisma: PrismaService
	) { }

	public async canCreateProjects (userID: string | null | undefined): Promise<[false, null] | [boolean, User]> {
		if (!userID) return [false, null]
		return this.prisma.wrapResult(this.prisma.user.findUnique({
			where: { id: userID }
		})).then((result) => {
			if (!result.ok) return [false, null]
			return [
				result.data.canCreateProjects,
				result.data
			]
		})
	}

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
	async getUserFrontendSessionData (userID: string): Promise<APIUser | null> {
		return this.prisma.user.findUnique({
			where: { id: userID }, select: {
				email: true,
				name: true,
				id: true,
			}
		})
	}
}
