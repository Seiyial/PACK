import { PrismaClient } from '.prisma/client'
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClientKnownRequestError, PrismaClientRustPanicError } from '@prisma/client/runtime'
import { DkResult, r } from 'daybreak'

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

	public handlePrismaError (e: any, verbose?: 'log' | 'verbose'): DkResult & { ok: false } {
		if (e instanceof PrismaClientKnownRequestError) {
			if (e.code === 'P2025') {
				// "An operation failed because it depends on one or more records that were required but not found. {cause}"
				if (verbose === 'log') {
					this.logger.error({ PRISMA_NOT_FOUND: e.message })
				}
				return r.fail('PRISMA_NOT_FOUND', verbose ? { message: e.message } : {})
			} else if (e.code === 'P1012' || e.code === 'P1014' || e.code === 'P1016') {
				if (verbose === 'log') {
					this.logger.error({ PRISMA_STRUCTURE_OR_VALIDATION_ERROR: e.message })
				}
				return r.fail('PRISMA_STRUCTURE_OR_VALIDATION_ERROR', verbose ? { message: e.message } : {})
			} else {
				if (verbose === 'log') this.logger.error({ PRISMA_P_ERROR_CODE: { code: e.code, mesage: e.message } })
				return r.fail('PRISMA_UNKNOWN', verbose ? { message: e.message, prismaCode: e.code } : {})
			}
		} else if (e instanceof PrismaClientRustPanicError) {
			this.logger.error({ PRISMA_RUST_PANIC_ERROR: e.message, info: 'REQUIRES RESTART' })
			process.exit(1)
		}

		return r.fail('PRISMA_UNKNOWN')
	}

}
