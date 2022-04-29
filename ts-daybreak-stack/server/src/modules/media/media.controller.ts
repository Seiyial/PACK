import { Body, Controller, Logger, Post, Res, Session, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import { DkResult, r } from 'lib/daybreak'
import DkJSONValidator from 'lib/daybreak/obj-lib/DkJSONValidator'
import { AppSession } from 'modules/auth/auth.types'
import { MediaService } from './media.service'
import { StorageService } from './storage/storage.service'

@Controller('media')
export class MediaController {
	constructor (
		private readonly mediaSvc: MediaService,
		private readonly storSvc: StorageService
	) {}

	logger = new Logger('media.controller.ts')

	@Post('upload')
	@UseInterceptors(FileInterceptor('image'))
	public async uploadFile (
		@UploadedFile() file: Express.Multer.File,
		@Body() body: unknown,
		@Session() session: AppSession
	): Promise<DkResult<{staticURL: string, uplID: string}>> {
		const payload = new DkJSONValidator<{filename: string, issueID: string | null, projectID: string | undefined}>(body, 'object', ['filename', 'issueID', 'projectID'], 'dump_error_props')
			.validate('filename', DkJSONValidator.isNonEmptyString)
			.validate('issueID', (v) => DkJSONValidator.isNonEmptyString(v) || v === undefined)
			.validate('projectID', DkJSONValidator.isStringOrUndefined)
			.acceptIfValid()
		if (!payload.ok) return payload

		this.logger.log(`fs: ${file.size}, fn: ${payload.data.filename}, is: ${payload.data.issueID}, prj: ${payload.data.projectID}`)
		if (file.size > 1000000) {
			return r.fail('WBW_COMMENT_IMAGE_ATTACHMENT_TOO_LARGE')
		}

		const auth = await this.mediaSvc.getProjectIDFromIssueIDAndEnsureAccess(payload.data.issueID, session.userID, payload.data.projectID ?? null)
		if (!auth.ok) return auth

		// is it okay to upload
		const result = await this.storSvc.uploadObject(file.buffer, payload.data.filename, file.size, session.userID!, auth.data.projectID, payload.data.issueID)
		if (!result.ok) return result

		const staticURL = await this.storSvc.getStaticDownloadLink(result.data)
		if (!staticURL.ok) return staticURL
		// const url = this

		return r.pass({
			staticURL: staticURL.data.url,
			uplID: result.data.id
		})
	}
}
