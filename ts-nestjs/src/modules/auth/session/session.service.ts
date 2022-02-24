import { PrismaClient } from '.prisma/client'
import { Injectable, Logger } from '@nestjs/common'
import { PrismaSessionStore } from '@quixo3/prisma-session-store'
import session from 'express-session'
import expressSessionCookieSigner from 'cookie-signature'

@Injectable()
export class SessionService {

	constructor(
	) { }

	logger = new Logger('SessionService.ts')
	store = new PrismaSessionStore(new PrismaClient() as any, {
		checkPeriod: 2 * 60 * 1000,
		dbRecordIdIsSessionId: true,
		dbRecordIdFunction: undefined
	})

	SESSION_COOKIE_NAME = '__app_sid'

	cookieOptions: session.CookieOptions = {
		maxAge: 1000 * 60 * 60 * 24, // 24h for dev
		sameSite: 'none',
		secure: true // required for sameSite=None on Chrome
		// however, to enable secure: true you Must be on HTTPS, else the cookie will not be sent.
	}

	sessionController = session({
		resave: false,
		saveUninitialized: false,
		cookie: this.cookieOptions,
		proxy: true,
		name: this.SESSION_COOKIE_NAME,
		secret: process.env.SESSION_SECRET as string,
		store: this.store
	})

	async getSession (sid: string): Promise<void | session.SessionData> {
		return this.store.get(sid)
	}

	/** DO NOT USE!!! For console access only. */
	async setSession (data: any): Promise<string> {
		const sid = `C_${ this.epochMSToYYYYMMDDAndHHMMSSUTC(new Date()) }`
		// this.store.set(_id, { user:  })
		const cookieConfig = new session.Cookie(this.cookieOptions)
		// needs additional code if secure: 'auto'
		// this is to replicate express-session/index.js behaviour. Update this if express-session changed.
		const cookieStr = cookieConfig.serialize(
			this.SESSION_COOKIE_NAME, 's:' + expressSessionCookieSigner.sign(sid, process.env.SESSION_SECRET)
		)
		await this.store.set(sid, { cookie: cookieConfig, ...data })
		return cookieStr
	}

	/** for admin usage. Hidden from console as well. */
	private _decryptSID (val: string): string | false {
		return expressSessionCookieSigner.unsign(val, process.env.SESSION_SECRET)
	}

	/** YYYYMMDD-HHMMSS-U */
	private epochMSToYYYYMMDDAndHHMMSSUTC (epochTS: number | Date): string {
		const dt = epochTS instanceof Date ? epochTS : new Date(epochTS)
		return `${ dt.getFullYear().toString().padStart(4, '0') }${ dt.getMonth().toString().padStart(2, '0') }${ dt.getDate().toString().padStart(2, '0') }-${ dt.getHours().toString().padStart(2, '0') }${ dt.getMinutes().toString().padStart(2, '0') }${ dt.getSeconds().toString().padStart(2, '0') }`
	}
}
