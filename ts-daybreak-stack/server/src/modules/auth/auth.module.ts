import { Module } from '@nestjs/common'
import { PermissionsModule } from 'modules/permissions/permissions.module'
import { UserModule } from 'modules/user/user.module'
import { PrismaModule } from 'setup/db/prisma.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
  imports: [
    PrismaModule,
    UserModule,
    PermissionsModule
  ],
  providers: [AuthService],
  exports: [AuthService],
  controllers: [AuthController]
})
export class AuthModule { }
