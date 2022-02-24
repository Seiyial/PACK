import { Module } from '@nestjs/common'
import { SessionModule } from 'modules/auth/session/session.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ProjectsModule } from './modules/projects/projects.module'

@Module({
  imports: [
    SessionModule,
    ProjectsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
