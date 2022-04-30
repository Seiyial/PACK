import { Module } from '@nestjs/common'
import { AuthModule } from 'modules/auth/auth.module'
import { SessionModule } from 'modules/auth/session/session.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true
		}),
		SessionModule,
		AuthModule,
	],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule { }
