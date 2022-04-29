import { Injectable, Logger } from '@nestjs/common'
import { StorageObject } from '.prisma/client'
import { DkResult, r } from 'lib/daybreak'
import { PermissionsService } from 'modules/permissions/permissions.service'
import { PrismaService } from 'setup/db/prisma.service'

@Injectable()
export class MediaService {

	logger = new Logger('media.service.ts')

	constructor (
		private readonly prisma: PrismaService,
		private readonly perms: PermissionsService
	) {}

	/** returns UNAUTHORISED if cannot access */
	public async getProjectIDFromIssueIDAndEnsureAccess (
		issueID: string | null,
		userID: string | null | undefined,
		projectID: string | null
	): Promise<DkResult<{projectID: string, issueID: string | null}>> {
		if (issueID) {
			const iss = await this.prisma.wrapResult(this.prisma.issue.findUnique({
				where: { id: issueID }
			}))
			if (!iss.ok) return iss
			const perms = await this.perms.getUserProjExpandedPerms(iss.data.projectID, userID)
			if (!perms.ok) return perms
			if (!perms.data.permissions.has('COMMENT')) return r.fail('UNAUTHORISED')

			return r.pass({ projectID: iss.data.projectID, issueID: iss.data.id })
		} else if (projectID) {
			const perms = await this.perms.getUserProjExpandedPerms(projectID, userID)
			if (!perms.ok) return perms
			if (!perms.data.permissions.has('CREATE_ISSUES_IN_ADDABLE_LISTS')) return r.fail('UNAUTHORISED')

			return r.pass({ projectID, issueID: null })
		} else {
			return r.fail('INVALID_REQUEST')
		}
	}
}
