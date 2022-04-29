/**
 * # NestJS REPL
 *
 * @author __[🐬Sayhao L.](https://github.com/Seiyial)__
 * @date 2021-10-30
 *
 * Adapted for NestJS 8, improved on from https://gist.github.com/royshouvik/2cba46b56dd70529731a068eb82ca538
 * Originally Built for ChillMail
 */
import { INestApplicationContext } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import chalk from 'chalk'
import ENV from 'env'
import fs from 'fs'
import fsp from 'fs/promises'
import got, { Got, Response } from 'got'
import purdy from 'purdy'
import repl from 'repl'
import { PrismaService } from 'setup/db/prisma.service'
// import { SessionService } from 'setup/session/SessionService'
import { AppModule } from 'app.module'
import tls from 'tls'
import toughCookie from 'tough-cookie'

// CONFIGURE THESE FOR YOUR NESTJS APPLICATION =========================
// FOR THIS TO WORK YOU ALSO NEED TO RESOLVE (package.json > "resolutions": {}) tough-cookie TO 4.0.0 (see CM README) and @types/express-session to "Seiyial/types-express-session-custom".
const PATH_TO_APPMODULE = `${ __dirname }/app.module`
const PATH_TO_REPL_HISTORY_FILE = './src/setup/repl.history'
const PATH_TO_ALIAS_FILE = './src/setup/consoleAlias.txt'
const IMPORT_ANY_MODULE_HERE = AppModule
const DEFAULT_PREFIX_URL = 'https://localhost:3000'
const SSL_CERT_FILE_PATH: null | string = null
const IMPL_LOGIN = async (app: INestApplicationContext, arg: string, httpClient: Got): Promise<Got> => {
	throw Error('IMPL_LOGIN not implemented, please configure at nest-repl.ts')
	// ARG: "email:abc@xyz.com" OR "id:1234-21323..."
	// const param = (arg.includes('@') && arg.includes('.')) ? 'email' : 'id'
	// console.log(chalk.blue.bold(`Logging in to ChillMail using ${param}: ${arg}`))
	// return app.get(PrismaService).user.findFirst({ where: { [param]: arg }, include: { oauthCredentials: true } })
	// 	.then((result) => {
	// 		if (result) {
	// 			return app.get(SessionService).setSession({ user: result })
	// 		} else {
	// 			throw Error('User not found')
	// 		}
	// 	})
	// 	.then(async (cookieStr) => {
	// 		log(`Loaded session cookie: ${chalk.yellow.bold(cookieStr)}`)
	// 		const cookieJar = new toughCookie.CookieJar(undefined, {})
	// 		return new Promise((resolve, reject) => {
	// 			cookieJar.setCookie(cookieStr, DEFAULT_PREFIX_URL, {}, (error, cookie) => {
	// 				if (error) reject(error)
	// 				const newClient = httpClient.extend({ cookieJar: cookieJar })
	// 				log(chalk.green.bold('Ready to go!\n'))
	// 				resolve(newClient)
	// 			})
	// 		})
	// 	})
}
// =====================================================================

const LOGGER_OPTIONS = {
	indent: 2,
	depth: 1
}

const { log } = console

function replWriter (value: object): string {
	return purdy.stringify(value, LOGGER_OPTIONS)
}
process.on('SIGTERM', () => {
	// import('child_process').then((cp) => cp.default.)
	// https://stackoverflow.com/questions/50702034/nodejs-get-child-processes-of-a-daemon-and-kill-them/50721341#50721341
	process.exit()
})


class InteractiveNestJS {

	// AUTOMATICALLY SET ALIASES VIA consoleAlias.json

	server: repl.REPLServer
	got: Got
	aliases: string[]

	constructor() {
		console.log(SSL_CERT_FILE_PATH)
		this.got = got.extend({
			prefixUrl: DEFAULT_PREFIX_URL,
			...SSL_CERT_FILE_PATH
				? { https: { certificateAuthority: [...tls.rootCertificates, fs.readFileSync(SSL_CERT_FILE_PATH, 'utf-8')] } }
				: {}
		})
		this.server = repl.start({
			useColors: true,
			prompt: '🌱 > ',
			writer: replWriter,
			ignoreUndefined: false,
			preview: true
		})
		this.server.context.got = this.got
		this.compileAndAttach().then(() => {
			this.server.on('exit', () => {
				log('Goodbye~')
				process.exit(0)
			})
		})
		this.server.setupHistory(PATH_TO_REPL_HISTORY_FILE, (e, r) => {
			if (e) {
				console.error('Setup console history error')
				console.log(e)
			}
		})
	}

	async compileAndAttach () {
		log('Compiling AppModule...')
		const targetModule = require(PATH_TO_APPMODULE)
		const applicationContext = await NestFactory.createApplicationContext(targetModule.AppModule)
		applicationContext.useLogger({
			error: (e) => purdy(e, {}),
			log: (e) => purdy(e, {}),
			warn: (e) => purdy(e, {}),
			debug: (e) => purdy(e, {}),
			verbose: (e) => purdy(e, {})
		})
		this.server.context.app = applicationContext
		applicationContext.get(IMPORT_ANY_MODULE_HERE) // warm up the instanceLinks object

		const setAlias = (name: string, customMacro?: string) => {
			for (const [key, inst] of (applicationContext as any)._instanceLinksHost.instanceLinks.entries()) {
				if (inst[inst.length - 1].wrapperRef.name === name) {
					const macro = customMacro ?? name.replace(/[a-z]/g, '')
					this.server.context[macro] = applicationContext.get(key)
					log(`Aliased ${ chalk.blue.bold(name) } -> ${ chalk.green.bold(macro) }`)
					break
				}
			}
		}
		await readAliases().then((aliases) => {
			this.aliases = aliases
			aliases.forEach((al) => {
				const [item1, item2] = al.split(':')
				setAlias(item1.trim(), item2?.trim())
			})
		})
		this.server.context.alias = (name: string, customMacro?: string) => {
			setAlias(name, customMacro)
			this.aliases.push(`${ customMacro ? `${ customMacro }: ` : '' }${ name }`)
			saveAliases(this.aliases).then(() => log(`${ PATH_TO_ALIAS_FILE } updated`))
		}
		this.server.context.unalias = (macroOrName: string) => {
			const index = this.aliases.findIndex((al) => {
				if (al.includes(':')) {
					const [alias, target] = al.split(':')
					return (alias.trim() === macroOrName || target.trim() === macroOrName)
				} else {
					return al.trim() === macroOrName
				}
			})
			const [removedAlias] = this.aliases.splice(index, 1)
			saveAliases(this.aliases)
			if (removedAlias.includes(':')) {
				const [alias, target] = removedAlias.split(':')
				this.server.context[alias.trim()] = '(alias removed)'
			} else {
				this.server.context[removedAlias.replace(/[a-z]/g, '')] = '(alias removed)'
			}
			log('Alias removed')
		}

		this.server.context.info = (providerOrMacro: object | string) => {
			let provider: object
			if (typeof providerOrMacro === 'string') {
				provider = this.server.context[providerOrMacro]
			} else {
				provider = providerOrMacro
			}
			if (!provider) {
				log(chalk.yellow(`\nMacro ${ chalk.bold(`"${ providerOrMacro }"`) } Not found.\n`))
				return
			}

			log('')
			// try find in aliases
			let alias: string | null = null
			if (providerOrMacro !== provider) {
				alias = providerOrMacro as string
				log(chalk.cyan(`alias ${ chalk.bold(providerOrMacro) }`))
			} else {
				for (const v of this.aliases) {
					if (v.includes(':')) {
						const [macro, target] = v.split(':')
						if (target.trim() === provider.constructor.name) {
							alias = macro.trim()
							break
						}
					} else {
						if (v.trim() === provider.constructor.name) {
							alias = v.trim().replace(/[a-z]/g, '')
							break
						}
					}
				}

				if (alias) {
					log(chalk.cyan(`alias ${ chalk.bold(alias) }`))
				} else {
					log(chalk.gray(`alias this => alias('${ provider.constructor.name }')`))
				}
			}
			log(chalk.green.bold(`${ provider.constructor.name } {}`))
			const [keys, longestLen] = getAllObjKeysAndLongestLen(provider)
			for (const k of keys) {
				const val = provider[k]
				let print: string = `  ${ k }: `
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
						print += chalk.magenta(`${ val.constructor.name } {}`)
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
					print += chalk.yellow(val)
				} else {
					print += chalk.red(val)
				}
				log(print)
			}
			log(chalk.gray(`  use ${ alias ?? `alias('${ provider.constructor.name }'); <ALIAS>` }.<tab> for all`))
			log('')
		}

		this.server.context.help = () => {
			log('')
			log(chalk.gray('•') + ' ' + chalk.cyan('help()') + '     displays this help message')
			log('')
			log(chalk.yellow.bold('Lib Access'))
			log(chalk.gray('•') + ' ' + chalk.cyan(`alias(${ chalk.yellow('provider') }, ${ chalk.yellow('[customAlias]') })`) + ' obtains an instance and gives it an alias.')
			// log(chalk.gray('•') + ' ' + chalk.cyan(`get(${chalk.yellow('provider')}, ${chalk.yellow('[customAlias]')})`) + ' same as alias/2.')
			log(chalk.gray('•') + ' ' + chalk.cyan(`unalias(${ chalk.yellow('providerOrAlias') })`) + ' removes an alias.')
			log('')

			log(chalk.yellow.bold('HTTP Access'))
			log(chalk.gray('•') + ' ' + chalk.cyan(`login(${ chalk.yellow('<id> or <email>') })`) + ' attaches a logged in session the HTTP instance.')
			log(chalk.gray('•') + ' ' + chalk.cyan(`req(${ chalk.yellow('method') }, ${ chalk.yellow('path') }, ${ chalk.yellow('body') }, ${ chalk.yellow('returnType') }, ${ chalk.yellow('print') })`) + ' makes a http request. \n' + chalk.whiteBright('   Requires active running server') + '.')
			log(chalk.gray(`  • ${ chalk.white('method') } p, g, d, post, get, delete.`))
			log(chalk.gray(`  • ${ chalk.white('path') }   e.g. "/g/state"; use setRemote() to change prefixUrl.`))
			log(chalk.gray(`  • ${ chalk.white('body') }   JS Object, string, buffer, ReadableStream.`))
			log(chalk.gray(`  • ${ chalk.white('returnType') } "raw" or "json". JSON will be parsed.`))
			log(chalk.gray(`  • ${ chalk.white('print') }  (boolean) whether to print the result & statusCode.`))
			log(chalk.gray('•') + ' ' + chalk.cyan(`setRemote(${ chalk.yellow('remoteURL') })`) + ' makes this session\'s HTTP requests connect to remoteURL.\n   login() may not work.')
			log(chalk.gray('•') + ' ' + chalk.cyan('unsetRemote()') + ' changes the remote URL back to the default.')
			log('')
		}
		log(chalk.gray('help() to see commands'))

		this.server.context.login = (arg: string) => {
			log(chalk.gray(`:: IMPL_LOGIN(applicationContext, "${ arg }")`))
			IMPL_LOGIN(
				applicationContext,
				arg,
				this.server.context.got
			).then((newGot) => {
				this.got = newGot
				this.server.context.got = newGot
			})
		}
		this.server.context.resetCookies = () => {
			this.got = this.server.context.got.extend({ cookieJar: new toughCookie.CookieJar() })
			this.server.context.got = this.got
			log(chalk.blue('Cookies have been reset.'))
		}
		this.server.context.req = async (
			method: string,
			path: string,
			body: object | any,
			returnType: 'raw' | 'json' = 'json',
			print: boolean = true
		) => {
			const _path = path.startsWith('/') ? path.substring(1) : path
			const _method = (method.length === 1) ? httpMethodExpander[method.toLowerCase()] : method.toUpperCase()
			log(`\n${ chalk.yellow.bold(_method) } ${ chalk.cyan('/' + _path) } ${ JSON.stringify(body) }`)
			const result = this.server.context.got(_path, {
				method: _method,
				..._method.toLowerCase() !== 'get'
					? typeof body === 'object' ? { json: body } : { body }
					: {},
				timeout: 20000
			})

			// SHOW GOT's PREFIXURL

			const r = (returnType === 'json')
				? result.json()
				: result
			return r.then(async (resp) => {
				if (returnType === 'json') {
					const fullResp = await result
					if (print) {
						log(fullResp.statusCode.toString().startsWith('2') ? chalk.green.bold(fullResp.statusCode.toString()) : chalk.red.bold(fullResp.statusCode.toString()))
						purdy(resp as any, {})
					}
					return resp
				} else {
					if (print) {
						log((resp as Response).statusCode.toString().startsWith('2') ? chalk.green.bold((resp as Response).statusCode.toString()) : chalk.red.bold((resp as Response).statusCode.toString()))
						log(`${ chalk.gray('Body:') } ${ (resp as Response).body }`)
					}
					return resp
				}
			}).catch((e) => {
				if (e instanceof TypeError && 'code' in e && (e as any).code === 'ERR_INVALID_URL') {
					log(`${ chalk.magenta('ERR_INVALID_URL') }: ${ chalk.white.bold('Is your server running?') }`)
				}
				if (print) {
					if ('message' in e) log(chalk.red(e.message.toString()))
					purdy(e, {})
				}
				return e
			})
		}

		this.server.context.setRemote = (remote: string) => {
			this.got = this.server.context.got.extend({ prefixUrl: remote })
			this.server.context.got = this.got
			log('Updated HTTP access remote to ' + remote.toString())
		}
		this.server.context.unsetRemote = () => {
			const prefixUrl = DEFAULT_PREFIX_URL
			this.got = this.server.context.got.extend({ prefixUrl })
			this.server.context.got = this.got
			log('Reset HTTP access remote to ' + prefixUrl)
		}
	}
}

const httpMethodExpander = {
	p: 'POST',
	g: 'GET',
	d: 'DELETE'
}

// return null: no exit
// return false: is folder
const consoleAliasFileExists = async (): Promise<boolean | null> => {
	try {
		return (await fsp.lstat(PATH_TO_ALIAS_FILE)).isFile()
	} catch (e) {
		return null
	}
}
const readAliases = async (): Promise<string[]> => {
	const fStatus = await consoleAliasFileExists()
	if (fStatus === null) return []
	if (fStatus) {
		const f = await fsp.readFile(PATH_TO_ALIAS_FILE, 'utf-8')
		return f.split('\n')
	} else {
		purdy(Error(`${ PATH_TO_ALIAS_FILE } is a non-file. No aliases can be parsed or saved.`), {})
		return []
	}
}
const saveAliases = async (aliases: string[]): Promise<void> => {
	const fStatus = await consoleAliasFileExists()
	if (fStatus || fStatus === null) {
		await fsp.writeFile(PATH_TO_ALIAS_FILE, aliases.join('\n'))
	} else {
		purdy(Error(`${ PATH_TO_ALIAS_FILE } is a non-file. No aliases can be parsed or saved.`), {})
	}
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

const session = new InteractiveNestJS()
