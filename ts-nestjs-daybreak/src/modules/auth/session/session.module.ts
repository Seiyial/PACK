import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SessionService } from './session.service'

@Module({
	providers: [SessionService],
	imports: [],
	controllers: [],
	exports: [SessionService]
})
export class SessionModule { }
