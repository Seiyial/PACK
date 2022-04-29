import { Module } from '@nestjs/common'
import { AuthModule } from 'modules/auth/auth.module'
import { SessionModule } from 'modules/auth/session/session.module'
import { BatchesModule } from 'modules/batches/batches.module'
import { TicketsModule } from 'modules/tickets/tickets.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ProjectsModule } from './modules/projects/projects.module'
import { MediaModule } from './modules/media/media.module'
import { StorageModule } from './modules/media/storage/storage.module'
import { ProjectPreferencesModule } from 'modules/projects/preferences/project-preferences.module'
import { ConfigModule } from '@nestjs/config'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true
		}),
		SessionModule,
		ProjectsModule,
		BatchesModule,
		TicketsModule,
		AuthModule,
		MediaModule,
		StorageModule,
		ProjectPreferencesModule
	],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule { }
