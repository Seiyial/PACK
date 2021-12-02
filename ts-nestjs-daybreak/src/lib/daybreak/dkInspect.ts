import chalk from 'chalk'
import { isAsyncFunction } from 'util/types'

const dkInspect = (item: any, log: (str: string) => any = console.log) => {

	if (isAsyncFunction(item)) {
		log(chalk.cyanBright(`async fn ${item.name} (${getParamNames(item).map((v) => chalk.yellow(v)).join(', ')})`))
	} else if (item instanceof Function) {
		log(chalk.cyanBright(`fn ${item.name} (${getParamNames(item).map((v) => chalk.yellow(v)).join(', ')})`))
	} else if (item.constructor) {
		log(chalk.green.bold(`${item.constructor.name} {}`))
	} else if (item.name) {
		log(chalk.cyan(item))
	}
	if (typeof item === 'object' || typeof item === 'function') {
		const [keys, longestLen] = getAllObjKeysAndLongestLen(item)
		for (const k of keys) {
			const val = item[k]
			let print: string = `  ${k}: `
			if (typeof val === 'function') {
				if (val.constructor.name === 'AsyncFunction') {
					print += chalk.blue(' ' + new Array(longestLen - k.length + 1).join(chalk.gray('•')) + ' async fn (')
					print += getParamNames(val).map((v) => chalk.yellow(v)).join(', ')
					print += chalk.blue(')')
				} else {
					print += chalk.blueBright(' ' + new Array(longestLen - k.length + 1).join(chalk.gray('•')) + ' fn (')
					print += getParamNames(val).map((v) => chalk.yellow(v)).join(', ')
					print += chalk.blueBright(')')
				}
			} else if (Array.isArray(val)) {
				let _val = JSON.stringify(val)
				if (_val.length > 100) _val = _val.slice(0, 100) + chalk.gray(' (...)')
				print += chalk.cyan(_val)
			} else if (typeof val === 'object') {
				if (val?.constructor?.name) {
					print += chalk.magenta(`${val.constructor.name} {}`)
				} else {
					let _val = JSON.stringify(val)
					if (_val.length > 100) _val = _val.slice(0, 100) + chalk.gray(' (...)')
					print += chalk.cyan(_val)
				}
			} else if (typeof val === 'string') {
				print += chalk.green('"')
				print += chalk.green(val.length >= 30 ? val.slice(0, 30) + chalk.gray(' (...)') : val)
				print += chalk.green('"')
			} else if (typeof val === 'number') {
				print += chalk.keyword('orange')(val)
			} else {
				print += chalk.red(val)
			}
			log(print)
		}

	}
	log('')
}

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg
var ARGUMENT_NAMES = /([^\s,]+)/g
const getParamNames = (func: Function) => {
	var fnStr = func.toString().replace(STRIP_COMMENTS, '')
	var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES)
	if (result === null)
		result = []
	return result
}
const getAllObjKeysAndLongestLen = (obj: object): [string[], number] => {
	const properties = new Set<string>()
	let currentObj = obj
	do {
		Object.getOwnPropertyNames(currentObj).map((item) => properties.add(item))
	} while ((currentObj = Object.getPrototypeOf(currentObj)))
	properties.delete('__defineGetter__')
	properties.delete('__lookupGetter__')
	properties.delete('hasOwnProperty')
	properties.delete('__lookupSetter__')
	properties.delete('__defineSetter__')
	properties.delete('__proto__')
	properties.delete('constructor')
	properties.delete('propertyIsEnumerable')
	properties.delete('isPrototypeOf')
	properties.delete('valueOf')
	properties.delete('toString')
	properties.delete('toLocaleString')
	const keys = [...properties.keys()]
	const longestKeyForPaddingFunctions = keys.reduce((acc, k) => k.length > acc ? k.length : acc, 0)
	return [keys, longestKeyForPaddingFunctions]
}


export default dkInspect
