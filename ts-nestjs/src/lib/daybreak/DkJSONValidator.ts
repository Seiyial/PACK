import { Logger } from '@nestjs/common'
import { DkError, DkErrors, DkResult, DkResults } from './DkResult'

class DkJSONValidator<R extends object> {

	private json: object
	private debug: boolean
	private valid: boolean
	private debugErrors: { [k: string]: string[] } & { '_ROOT_': string[] }

	constructor (data: unknown, rootType: 'array' | 'object' = 'object', cast?: (string | number)[], debug?: false) {
		this.debug = debug !== false
		this.debugErrors = { _ROOT_: [] }
		this.valid = true
		if (rootType === 'array') {
			if (!Array.isArray(data)) {
				this.valid = false
				this.addDebugError('_ROOT_', 'Expected Array. Not array.')
			}
		} else {
			if (typeof data !== 'object') {
				this.valid = false
				this.addDebugError('_ROOT_', 'Expected Object. Not object.' + JSON.stringify(data))
			}
		}
		this.json = data as object
		if (cast) {
			for (const k of Object.keys(this.json)) {
				if (!cast.includes(k)) delete this.json[k]
			}
		}
	}

	private addDebugError (field: string | '_ROOT_', error: string) {
		if (this.debug) {
			this.debugErrors[field] ??= []
			this.debugErrors[field].push(error)
		}
	}

	public async asyncValidate (property: string | number | (string | number)[], validator: (val: unknown) => Promise<boolean>) {
		if (this.valid || this.debug) {
			if (Array.isArray(property)) {
				let access: any
				for (const [index, prop] of property.entries()) {
					if (index === 0) {
						access = this.json[prop]
					} else {
						access = access[prop]
					}
					if (!access && index !== property.length - 1) {
						this.valid = false
						this.addDebugError(property.toString(), 'Could not access.')
						return this
					}
				}
				const valid = await validator(access)
				if (!valid) {
					this.valid = false
					this.addDebugError(property.toString(), `failed validation${validator.name ? ` "${validator.name}"` : '(anonymous)'}.`)
				}
			} else {
				const valid = await validator(this.json[property])
				if (!valid) {
					this.valid = false
					this.addDebugError(property.toString(), `failed validation${validator.name ? ` "${validator.name}"` : '(anonymous)'}.`)
				}
			}
		}
		return this
	}

	public validate (property: string | number | (string | number)[], validator: (val: unknown) => boolean) {
		if (this.valid || this.debug) {
			if (Array.isArray(property)) {
				let access: any
				for (const [index, prop] of property.entries()) {
					if (index === 0) {
						access = this.json[prop]
					} else {
						access = access[prop]
					}
					if (!access && index !== property.length - 1) {
						this.valid = false
						this.addDebugError(property.toString(), 'Could not access.')
						return this
					}
				}
				const valid = validator(access)
				if (!valid) {
					this.valid = false
					this.addDebugError(property.toString(), `failed validation${validator.name ? ` "${validator.name}"` : '(anonymous)'}.`)
				}
			} else {
				const valid = validator(this.json[property])
				if (!valid) {
					this.valid = false
					this.addDebugError(property.toString(), `failed validation${validator.name ? ` "${validator.name}"` : '(anonymous)'}.`)
				}
			}
		}
		return this
	}

	public validateArrayItems (accessor: string | string[], validator: (data: object) => boolean, itemLengthValidation: 'req_non_empty_array' | 'req_array' | 'nullable' = 'req_array') {
		if (this.valid) {
			if (Array.isArray(accessor)) {
				let access: any
				for (const [ind, prop] of accessor.entries()) {
					access = ind === 0 ? this.json[prop] : access[prop]
					if (!access && ind < accessor.length - 1) {
						this.valid = false
						this.addDebugError(accessor.toString(), `Could not access, nulled out at access index ${ind} ${prop}: ${JSON.stringify(access)}.`)
						return this
					}
				}
				if (!Array.isArray(access)) {
					if (itemLengthValidation !== 'nullable') {
						this.valid = false
						this.addDebugError(accessor.toString(), 'Supposed to be array but was falsy.')
					}
					return this
				} else if (access.length === 0) {
					if (itemLengthValidation === 'req_non_empty_array') {
						this.valid = false
						this.addDebugError(accessor.toString(), 'Required non-empty array, but was empty.')
					}
					return this
				}
				for (const [index, item] of access.entries()) {
					const _valid = validator(item)
					if (!_valid) {
						this.valid = false
						this.addDebugError(`${accessor}[${index}]`, `failed validation${validator.name ? ` "${validator.name}"` : '(anonymous)'}.`)
					}
				}
			} else {
				if (!Array.isArray(this.json[accessor])) {
					this.valid = false
					this.addDebugError(accessor, '(validateArrayItems) Expected this prop to be an array but failed the array test.')
					return this
				}
				for (const [index, item] of this.json[accessor].entries()) {
					const _valid = validator(item)
					if (!_valid) {
						this.valid = false
						this.addDebugError(`${accessor}[${index}]`, `failed validation${validator.name ? ` "${validator.name}"` : '(anonymous)'}.`)
					}
				}
			}
		}
		return this
	}

	public customValidate (validator: (json: unknown) => boolean) {
		if (this.valid) {
			const valid = validator(this.json)
			if (!valid) {
				this.valid = false
				this.addDebugError('(custom root validator)', `failed validation${validator.name ? ` "${validator.name}"` : '(anonymous)'}.`)
			}
		}
		return this
	}

	static isString = (val: unknown): val is string => typeof val === 'string'
	static isNonEmptyStringOrNull = (val: unknown, minLen: number = 1): val is string | null => val === null || (typeof val === 'string' && val.length >= minLen)
	static isValidFilename = (val: unknown): val is string => typeof val === 'string' && /^[^<>:;,?"*|/]+$/.test(val)
	static isNonEmptyString = (val: unknown, minLen: number = 1): val is string => typeof val === 'string' && val.length >= minLen
	/** Ensures this field is a `string` and follows the format `R,G,B` (no spaces) where R, G and B are each number from 0 to 255. */
	static isValidDkColourCode = (val: unknown): val is string => {
		if (typeof val !== 'string') return false
		const colours = val.split(',')
		if (val.length !== 3) return false
		for (const str of colours) {
			const c = parseInt(str)
			if (isNaN(c) || c < 0 || c > 255) return false
		}
		return true
	}

	static isProbablyOkayEmailAddress = (val: unknown): val is string => typeof val === 'string' && /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(val)

	/** Ensures the field value is a `string` and qualifies as a HEX colour code (e.g. `#0000FF`) */
	static isValidHexColourCode = (val: unknown): val is string => typeof val === 'string' && /^#[0-9A-F]{6}$/.test(val)

	static isNumber = (val: unknown): val is number => typeof val === 'number'
	static isInteger = (val: unknown): val is number => typeof val === 'number' && Math.round(val) === val

	static isBoolean = (val: unknown): val is boolean => typeof val === 'number'
	static isObject = (val: unknown): val is { [k: string]: unknown } => Boolean(val) && typeof val === 'object' && !Array.isArray(val)

	static isArray = (val: unknown): val is unknown[] => Array.isArray(val)
	static isArrayOfStrings = (val: unknown): val is string[] => Array.isArray(val) && val.findIndex((v) => typeof v !== 'string') === -1
	static isNonEmptyArrayOfStrings = (val: unknown): val is [string, ...string[]] => DkJSONValidator.isArrayOfStrings(val) && typeof val[0] === 'string'

	acceptIfValid (failError: DkError = DkErrors.CM_INVALID_REQ, debugLogger?: Logger): DkResult<R> {

		if (this.valid) {
			return DkResults.pass(this.json as R)
		} else {
			if (debugLogger) {
				debugLogger.warn({ DK_INVALID_JSON: { json: this.json, errors: this.debugErrors } })
			}
			return DkResults.fail(failError ?? DkErrors.CM_INVALID_REQ)
		}
	}

	isValid (debugLogger?: Logger): boolean {
		if (!this.valid && debugLogger) {
			debugLogger.warn({ debug: this.debug, DK_INVALID_JSON: { json: this.json, errors: this.debugErrors } })
		}
		return this.valid
	}
}

export default DkJSONValidator
