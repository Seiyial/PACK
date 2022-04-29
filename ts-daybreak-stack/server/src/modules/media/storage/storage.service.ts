import { Injectable, Logger } from '@nestjs/common'
import { StorageObject } from '.prisma/client'
import { DkResult, r } from 'lib/daybreak'
import { PrismaService } from 'setup/db/prisma.service'
import { S3StorageProviderService } from './provider/s3/s3-storage-provider.service'

@Injectable()
export class StorageService {

	constructor (
		private readonly prisma: PrismaService,
		private readonly s3Svc: S3StorageProviderService
	) {}

	logger = new Logger('storage.service.ts')

	public async uploadObject (
		buffer: Buffer,
		fileName: string,
		size: number,
		uploaderID: string,
		projectID: string,
		issueID: string | null
	): Promise<DkResult<StorageObject>> {
		const record = await this.prisma.wrapResult(this.prisma.storageObject.create({
			data: {
				filename: fileName,
				projectID,
				uploaderID,
				issueID,
				provider: 'S3'
			}
		}))
		if (!record.ok) return record
		this.logger.log('Uploading...')
		const s3Result = await this.s3Svc.upload(buffer, record.data.id, size)
		if (!s3Result.ok) return s3Result
		return record
	}

	public async getStaticDownloadLink (
		storageObject: Pick<StorageObject, 'id' | 'providerCustomItemKey' | 'provider' | 'filename'>
	): Promise<DkResult<{contentDisposition: string, url: string}>> {
		if (storageObject.provider === 'S3') {
			const result = this.s3Svc.getObjectURL(storageObject.providerCustomItemKey ?? storageObject.id)
			if (!result.ok) return result
			return r.pass({
				contentDisposition: `attachment; filename="${storageObject.filename}"`,
				url: result.data
			})
		} else {
			return r.fail('NOT_YET_SUPPORTED')
		}
	}
}
