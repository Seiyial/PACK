import { SchoolMember, User } from '.prisma/client'
import { Session } from 'express-session'

export type TiteSession = {
	userID?: string
} & Session