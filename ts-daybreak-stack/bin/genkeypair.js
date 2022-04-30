const { generateKeyPair, randomBytes } = require('crypto')
const fsp = require('fs/promises')
const path = require('path')

const passphrase = randomBytes(12).toString('hex')

generateKeyPair('rsa', {
	modulusLength: 4096,
	publicKeyEncoding: {
		type: 'spki',
		format: 'pem'
	},
	privateKeyEncoding: {
		type: 'pkcs1',
		format: 'pem',
		cipher: 'aes-256-cbc',
		passphrase
	}
}, (err, publicKey, privateKey) => {
	if (err) return console.error(err)
	const folder = path.resolve(__dirname, '../private')
	console.log('Targeting ' + folder)
	Promise.all([
		fsp.writeFile(path.join(folder, 'server_private_key.pem'), privateKey),
		fsp.writeFile(path.join(folder, '.server_private_key_passphrase'), passphrase),
		fsp.writeFile(path.join(folder, 'frontend_public_key.pem'), publicKey)
	]).then(() => {
		console.log('Done!')
		process.exit(0)
	}).catch((e) => {
		console.log(e)
		console.log(e.stack)
		console.log('(failed)')
		process.exit(1)
	})
	// console.log(`Done! Now please: \n  1. move private/frontend_public_key.pem into tite_client/frontend folder.\n  2. Paste this passphrase into the server .env file: FE_DECRYPT_KEY_PASSPHRASE="(cut out the passphrase from the privateKey file and paste here)"`)
})
