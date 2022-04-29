import { Module } from '@nestjs/common'
import { S3StorageProviderService } from './s3-storage-provider.service'

@Module({
	controllers: [],
	providers: [S3StorageProviderService],
	exports: [S3StorageProviderService]
})
export class S3StorageProviderModule {}
