import { PrismaClient } from '@prisma/client'
import { hash } from 'argon2'

const prisma = new PrismaClient();

(async () => {
	prisma.user.create({
		data: {
			email: 'sayhao@syxworks.me',
			name: 'Seiyial',
			passwordHash: await hash('password')
		}
	})
})()
