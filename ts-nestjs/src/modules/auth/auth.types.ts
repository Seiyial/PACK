import { Session } from 'express-session'

export type AppSession = {
	userID?: string
} & Session