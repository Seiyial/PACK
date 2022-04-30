import cp from 'child_process'
import { createInterface } from 'readline'

/** @type {(sh: string) => Promise<string>} */
const exec = (sh) => new Promise((resolve, reject) => {
	const ex = cp.exec(sh, (err, stdout, stderr) => {
		if (err) reject(err)
		if (stderr) reject(stderr)
		resolve(stdout)
	})
})

const readr = createInterface({
	input: process.stdin,
	output: process.stdout
})

/** @type {(question: string) => Promise<string>} */
const ask = (question) => new Promise((resolve, reject) => {
	readr.question(question + '\n> ', (result) => resolve(result))
})

const main = async () => {
	console.log(`
First time setup:
---------------------

0) project root: $ cd server; pnpm i; bin/up-orm; cd ..
1) project root: $ node bin/genkeypair.js
2) project root: $ cd private; mkcert localhost; cd ..
2a) $ touch server/.env; cat server/.env.example > server/.env; cat private/.server_private_key_passphrase
		use it as as server .env FE_DECRYPT_KEY_PASSPHRASE

(windows nushell)
3) project root: $ cd server; mkdir private; cd private; mkcert localhost; cd ../..

4) create database: $ psql -U postgres (password postgres)
	psql> CREATE DATABASE yourdbname;
	psql> \\q

5) migrate database: $ cd server; pnpm db-migrate; pnpm db; cd ..

6) cd server; ts-node bin/create-user.ts; cd ..

7) cd server; pnpm dev

8) frontend should need no setup other than $ touch frontend/.env; cat frontend/.env.example > frontend/.env

	`)
}
main()
