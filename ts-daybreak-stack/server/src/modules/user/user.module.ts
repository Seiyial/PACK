import { Module } from '@nestjs/common'
import { PermissionsModule } from 'modules/permissions/permissions.module'
import { PrismaModule } from 'setup/db/prisma.module'
import { UserService } from './user.service'

@Module({
	imports: [
		PrismaModule,
		PermissionsModule
	],
	providers: [UserService],
	exports: [UserService]
})
export class UserModule { }
