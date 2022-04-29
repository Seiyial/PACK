import { Module } from '@nestjs/common'
import { S3StorageProviderModule } from './provider/s3/s3-storage-provider.module'
import { StorageService } from './storage.service'

@Module({
	controllers: [],
	providers: [StorageService],
	exports: [StorageService],
	imports: [
		S3StorageProviderModule
	]
})
export class StorageModule {}
