import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { Request } from 'express'
import { TiteSession } from './auth.types'


@Injectable()
export class AuthGuard implements CanActivate {
	logger = new Logger('AuthGuard')

	canActivate (
		context: ExecutionContext
	): boolean {
		const req: Request = context.switchToHttp().getRequest()

		const userID = (req.session as TiteSession).userID
		return Boolean(userID)
	}
}