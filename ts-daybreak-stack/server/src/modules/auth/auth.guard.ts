import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { Request } from 'express'
import { AppSession } from './auth.types'


@Injectable()
export class AuthGuard implements CanActivate {
	logger = new Logger('AuthGuard')

	canActivate (
		context: ExecutionContext
	): boolean {
		const req: Request = context.switchToHttp().getRequest()

		const userID = (req.session as AppSession).userID
		return Boolean(userID)
	}
}