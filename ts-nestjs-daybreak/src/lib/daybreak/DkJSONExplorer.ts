class DkExplorableJSON {

	json: object

	constructor (json: any) {
		this.json = typeof json === 'object' ? json : {}
	}

	/** can be object or array. */
	public getObj (...keyNesting: (string | number)[]): DkExplorableJSON {
		let dive: any = this.json

		for (const field of keyNesting) {
			dive = this.getValue(dive, field)
			if (dive === null || dive === undefined) {
				return new DkExplorableJSON({})
			}
		}
		if (typeof dive !== 'object') {
			return new DkExplorableJSON({})
		} else {
			return new DkExplorableJSON(dive)
		}
	}

	public getStringWithFallback (opts: { fallback: string }, ...keyNesting: (string | number)[]): string {
		const result = this.getString(...keyNesting)
		if (result === undefined || result === null) {
			return opts.fallback
		} else {
			return result
		}
	}

	public getArrayOrObjectIntoArrayMember (key: string | number): DkExplorableJSON {
		const obj = this.getValue(this.json, key)
		if (Array.isArray(obj)) {
			return new DkExplorableJSON(obj)
		} else if (typeof obj === 'object' && obj) {
			return new DkExplorableJSON([obj])
		} else {
			return new DkExplorableJSON([])
		}
	}

	public getString (...keyNesting: (string | number)[]): string | null {
		let dive: any = this.json
		const maxIndex = keyNesting.length - 1

		for (const [index, field] of keyNesting.entries()) {
			dive = this.getValue(dive, field)
			if ((dive === null || dive === undefined) && index !== maxIndex) {
				return null
			}
		}
		if (typeof dive !== 'string') {
			return null
		} else {
			return dive
		}
	}

	public getStringOrNumber (...keyNesting: (string | number)[]): string | null {
		let dive: any = this.json
		const maxIndex = keyNesting.length - 1

		for (const [index, field] of keyNesting.entries()) {
			dive = this.getValue(dive, field)
			if ((dive === null || dive === undefined) && index !== maxIndex) {
				return null
			}
		}
		if (typeof dive === 'string') {
			return dive
		} else if (typeof dive === 'number') {
			return dive.toString()
		} else {
			return null
		}
	}

	public getNumber (key: string | number): number | null {
		const val = this.getValue(this.json, key)
		if (typeof val === 'number') {
			return val
		} else if (typeof val === 'string') {
			const tryNum = parseInt(val)
			if (isNaN(tryNum)) return null
			return tryNum
		} else {
			return null
		}
	}

	public getBoolean (key: string | number): boolean | null {
		const val = this.getValue(this.json, key)
		if (val === null || val === undefined) return null
		if (typeof val === 'boolean') return val
		if (typeof val === 'string') {
			const _val = (val as string).toLowerCase()
			if (_val === 'true') return true
			if (_val === 'false') return false
			return null
		}
		if (val === 0 || val === 1) return Boolean(val)
		return null
	}

	public getStrings <T extends string> (...keyList: T[]): { [k in T]: string | null } {
		if (typeof this.json === 'object' && this.json) {
			return keyList.reduce((acc, k) => {
				const r = (this.json as any)[k]
				if (typeof r === 'string') {
					acc[k] = r
				} else {
					acc[k] = null
				}
				return acc
			}, {} as { [k in T]: string | null })
		} else {
			return keyList.reduce((acc, k) => {
				acc[k] = null
				return acc
			}, {} as { [k in T]: string | null })
		}
	}

	private getValue (object: any, field: string | number): null | unknown {
		if (object && typeof object === 'object') {
			return object[field]
		} else {
			return null
		}
	}
}

export default DkExplorableJSON
