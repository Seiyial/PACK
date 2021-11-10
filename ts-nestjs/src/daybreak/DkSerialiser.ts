import { Logger } from '@nestjs/common'
import { dkCreateCustomError } from 'daybreak/DkError'

const Debug = {
	fmtError: (error: any, label?: string): string => {
		return `${label ? `<<${label}>>` : 'JS Error?'}\nError: ${error.name}\nMessage: ${error.message}\nStack: ${error.stack}`
	}
}

const UnImplementedError = dkCreateCustomError('UnImplementedError')

/** Factory Serialiser Module. see MailboxSerialiser for usage. Utility methods like `select` are for making the constructor serialiser methods. */
export class DkSerialiser<T, A = {}, Ex extends [] = [], Ex2 extends [] = []> {

	logger: Logger

	constructor (
		readonly serialiserModuleName: string,
		readonly serialiser: (input: T, ...otherInputs: Ex) => A,
		readonly deserialiser?: (input: A, ...otherInputs: Ex2) => T | never
	) {
		this.logger = new Logger(serialiserModuleName)

		this.serialise = serialiser
		this.serialiseArray = (input, ...rest) => input.map((i) => this.serialise(i, ...rest))

		// this.serialiseArray
		this.deserialise = deserialiser ??
			((_: A, ..._b) => { throw UnImplementedError('deserialiser not implemented.') })
		this.deserialiseArray = deserialiser
			? (inputs: A[], ...rest: Ex2) => {
				try {
					return inputs.map((i) => this.deserialise(i, ...rest))
				} catch (e) {
					this.logger.error(Debug.fmtError(e, 'DkSerialiser group deserialisation error'))
					throw e
				}
			}
			: (_, ..._2) => { throw UnImplementedError('deserialiser not implemented') }
	}

	serialise: (input: T, ...otherInputs: Ex) => A
	deserialise: (input: A, ...otherInputs: Ex2) => T

	serialiseArray: (input: T[], ...otherInputs: Ex) => A[]
	deserialiseArray: (input: A[], ...otherInputs: Ex2) => T[]

	/**
	 * Usage:
	 *
	 * ```ts
	 * const foo = { field1: ..., field2: ..., dataThatMustntGoToFrontend: '###############' }
	 * const sanitisedFoo = DkSerialiser.select(a, 'field1', 'field2')
	 * ```
	 */
	static select <I extends {}> (input: I, ...select: (keyof I)[]): Pick<I, (keyof I)> {
		return Object.fromEntries(
			(Object.entries(input) as ([keyof I, I[keyof I]])[]
		).filter(
			([k, _v]) => select.includes(k)) as Iterable<[keyof I, I[keyof I]]>
		) as Pick<I, (keyof I)>
	}

	/**
	 * Usage:
	 *
	 * ```ts
	 * const foo = { field1: ..., field2: ..., dataThatMustntGoToFrontend: '###############' }
	 * const sanitisedFoo = this.select(a, 'field1', 'field2')
	 * ```
	 */
	select <I extends {}> (input: I, ...select: (keyof I)[]): Pick<I, (keyof I)> {
		return DkSerialiser.select(input, ...select)
	}
}
