import { Module } from '@nestjs/common'
import { MediaService } from './media.service'
import { MediaController } from './media.controller'
import { StorageModule } from './storage/storage.module'
import { PermissionsModule } from 'modules/permissions/permissions.module'

@Module({
	imports: [
		StorageModule,
		PermissionsModule
	],
	controllers: [MediaController],
	providers: [MediaService],
	exports: [MediaService]
})
export class MediaModule {}
