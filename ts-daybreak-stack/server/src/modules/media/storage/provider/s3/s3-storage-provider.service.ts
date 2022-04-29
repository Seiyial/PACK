import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Injectable, Logger } from '@nestjs/common'
import { DkResult, r } from 'lib/daybreak'
import { dkFmtError } from 'lib/daybreak/util/dkFmtError'
import { Readable } from 'stream'

@Injectable()
export class S3StorageProviderService {

	private BUCKET_NAME = process.env.S3_BUCKET_NAME

	logger = new Logger('s3.service.ts')

	private client = new S3Client({
		region: process.env.S3_REGION,
		credentials: {
			accessKeyId: process.env.S3_AWS_ACCESS_KEY_ID!,
			secretAccessKey: process.env.S3_AWS_SECRET_ACCESS_KEY!
		}
	})

	public async upload (
		buffer: Buffer,
		fileKey: string,
		contentLen: number
	): Promise<DkResult> {
		const cmd = new PutObjectCommand({
			Bucket: this.BUCKET_NAME,
			Key: fileKey,
			ACL: 'public-read',
			Body: buffer,
			ContentLength: contentLen
		})

		try {
			this.logger.log('send cmd')
			const result = await this.client.send(cmd)
			this.logger.log('OK')
			return r.pass()
		} catch (e) {
			this.logger.log('ERRORED')
			this.logger.log(e)
			return r.fail('WBW_S3_UPLOAD_FAIL')
		}
	}

	public getObjectURL (
		fileKey: string
	): DkResult<string> {
		if (this.BUCKET_NAME && process.env.S3_REGION && fileKey) {
			return r.pass(`https://${this.BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${fileKey}`)
		} else {
			return r.fail('UNKNOWN')
		}
	}
}
