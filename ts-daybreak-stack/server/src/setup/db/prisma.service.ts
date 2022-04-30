import { PrismaClient } from '@prisma/client'
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClientInitializationError, PrismaClientKnownRequestError, PrismaClientRustPanicError, PrismaClientUnknownRequestError, PrismaClientValidationError } from '@prisma/client/runtime'
import { DkResult, r } from 'lib/daybreak'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

	logger = new Logger('PrismaService.ts')

	async onModuleInit () { await this.$connect() }

	async onModuleDestroy () { await this.$disconnect() }

	async wrapVerbose<T extends object> (result: Promise<T>): Promise<DkResult<T>> {
		return this.wrapResult(result, 'verbose')
	}

	async wrapVerboseAndLog<T extends object> (result: Promise<T>): Promise<DkResult<T>> {
		return this.wrapResult(result, 'log')
	}

	async wrapResult<T extends object> (result: Promise<T | null | undefined>, verbose?: 'verbose' | 'log'): Promise<DkResult<T>> {
		return result
			.then((re) => re ? r.pass<T>(re) : r.fail('PRISMA_NOT_FOUND'))
			.catch((e) => this.handlePrismaError(e, verbose))
	}

	async wrapResultReturnNothing (result: Promise<unknown>, verbose?: 'verbose' | 'log'): Promise<DkResult> {
		return result
			.then((re) => re ? r.pass() : r.fail('PRISMA_NOT_FOUND'))
			.catch((e) => this.handlePrismaError(e, verbose))
	}

	/** `null` is returned as undefined though */
	async wrapResultAllowNotFound<T extends object> (result: Promise<T | null | undefined>, verbose?: 'verbose' | 'log'): Promise<DkResult<T | undefined>> {
		return result
			.then((re) => r.pass<T>(re ?? undefined))
			.catch((e) => this.handlePrismaError(e, verbose))
	}

	private enablePublicDebug: boolean = process.env.PUBLIC_PRISMA_SERVICE_DEBUG?.toLowerCase() === 'yes'

	public handlePrismaError (e: any, verbose?: 'log' | 'verbose'): DkResult & { ok: false } {
		if (e instanceof PrismaClientKnownRequestError) {
			if (e.code === 'P2002') {
				const split = e.message.split('Unique constraint failed on the ')
				const msg = split[1] ? 'Someone has already used this value.' : `Someone has already used this ${ split[1] }.`
				const props = this.enablePublicDebug ? { prisma: e } : {}
				return r.customFail(msg, props, 'PRISMA_UNIQUE_CONSTRAINT_ERROR')
			} else if (e.code === 'P2025') {
				// "An operation failed because it depends on one or more records that were required but not found. {cause}"
				if (this.enablePublicDebug || verbose === 'log') {
					this.logger.error({ PRISMA_NOT_FOUND: e.message })
				}
				return r.fail('PRISMA_NOT_FOUND', verbose ? { message: e.message, ...this.enablePublicDebug ? { prisma: e } : {} } : {})
			} else if (e.code === 'P1012' || e.code === 'P1014' || e.code === 'P1016') {
				if (this.enablePublicDebug || verbose === 'log') {
					this.logger.error({ PRISMA_STRUCTURE_OR_VALIDATION_ERROR: e.message })
				}
				return r.fail('PRISMA_STRUCTURE_OR_VALIDATION_ERROR', verbose ? { message: e.message } : {})
			} else {
				if (this.enablePublicDebug || verbose === 'log') this.logger.error({ PRISMA_P_ERROR_CODE: { code: e.code, mesage: e.message } })
				return r.fail('PRISMA_UNKNOWN', this.enablePublicDebug ? { prisma: e } : (verbose ? { message: e.message, prismaCode: e.code } : {}))
			}
		} else if (e instanceof PrismaClientRustPanicError) {
			this.logger.error({ PRISMA_RUST_PANIC_ERROR: e.message, info: 'REQUIRES RESTART' })
			process.exit(1)
		} else if (e instanceof PrismaClientValidationError) {
			this.logger.error('Prisma Client Validation Error')
			this.logger.error(e.message)
		} else if (e instanceof PrismaClientInitializationError) {
			this.logger.error('PrismaClientInitializationError')
			this.logger.error(e.errorCode)
			this.logger.error(e.message)
			this.logger.error(e.stack)
		} else if (e instanceof PrismaClientUnknownRequestError) {
			this.logger.error('PrismaClientUnknownRequestError')
		}

		const errProps = this.enablePublicDebug ? { unknownPrismaErrorObject: e, msg: e?.message, name: e?.name, stack: e?.stack } : {}
		if (this.enablePublicDebug) this.logger.error(errProps)
		return r.fail('PRISMA_UNKNOWN', errProps)
	}
}
