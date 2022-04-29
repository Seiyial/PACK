import { PrismaClient } from '.prisma/client'
import argon2 from 'argon2'
import { createInterface } from 'node:readline'

const prisma = new PrismaClient()
const readr = createInterface({
	input: process.stdin,
	output: process.stdout
})
const ask = (question: string) => new Promise<string>((resolve, reject) => {
	readr.question(question + '\n> ', (result) => resolve(result))
})


async function main () {

	const username = await ask('Desired name?')
	const email = await ask('Email?')
	const password = await ask('Password?')
	const SA = await ask('SA? if yes input YES, otherwise leave blank')
	
	const adminUser = await prisma.user.create({
		data: {
			email: email,
			name: username,
			canCreateProjects: true,
			sa: SA === 'YES',
			passwordHash: await argon2.hash(password!)
		}
	})

	console.log('Admin user created!')
	console.log(`Login email: ${adminUser.email}`)
	console.log(`Login password: ${password}`)
}

main()
