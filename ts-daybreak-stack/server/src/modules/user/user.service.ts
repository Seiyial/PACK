import { User } from '.prisma/client'
import { Injectable } from '@nestjs/common'
import { APIProjectConcise } from '@wbw/common/dto/APIProjectConcise'
import { APIUserSessionData } from '@wbw/common/dto/APIUserSessionData'
import argon2 from 'argon2'
import { DkResult, r } from 'lib/daybreak'
import { PermissionsService } from 'modules/permissions/permissions.service'
import { PrismaService } from 'setup/db/prisma.service'

@Injectable()
export class UserService {

	constructor(
		private readonly prisma: PrismaService,
		private readonly perms: PermissionsService
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
	async getUserFrontendSessionData (userID: string): Promise<DkResult<APIUserSessionData | null>> {
		const usr = await this.prisma.wrapResult(this.prisma.user.findUnique({
			where: { id: userID }, select: {
				email: true,
				name: true,
				id: true,
				sa: true,
				canCreateProjects: true,
				accessibleProjects: {
					select: {
						permissions: true,
						project: {
							select: {
								id: true,
								title: true,
								issuePrefix: true,
							}
						}
					}
				}
			}
		}))
		if (!usr.ok) return usr
		return r.pass({
			canCreateProjects: usr.data.canCreateProjects,
			email: usr.data.email,
			id: usr.data.id,
			name: usr.data.name,
			sa: usr.data.sa,
			projects: usr.data.accessibleProjects.map((p): APIProjectConcise => ({
				id: p.project.id,
				pings: 0,
				permissions: [...this.perms.makeExpandedPermsSet(p.permissions)],
				title: p.project.title,
				prefix: p.project.issuePrefix
			}))
		})
	}
}
