
// https://stackoverflow.com/a/17891099
export const dkCreateCustomError = (customErrorName: string) => {
	const errorFunction = function (_errMessage: string) {
		var temp = Error.apply(this, arguments)
		temp.name = this.name = customErrorName
		this.message = temp.message
		if (Object.defineProperty) {
			// getter for more optimizy goodness
			/* this.stack = */
			Object.defineProperty(this, 'stack', {
				get: function () {
					return temp.stack
				},
				configurable: true // so you can change it if you want
			})
		} else {
			this.stack = temp.stack
		}
	}

	errorFunction.prototype = Object.create(Error.prototype, {
		constructor: {
			value: errorFunction,
			writable: true,
			configurable: true
		}
	})

	return errorFunction
}

export const UnImplementedError = dkCreateCustomError('UnImplemented Error')
