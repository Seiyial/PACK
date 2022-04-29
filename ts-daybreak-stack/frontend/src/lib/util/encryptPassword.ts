// if you get an error here it's probably because you need to run `node bin/genkeypair` at the server repository. You then need to drag the frontend public key file to tite_frontend/private folder.
import JSEncrypt from 'jsencrypt'
import publicKey from '../../../../private/frontend_public_key.pem'

const crypt = new JSEncrypt()
crypt.setPublicKey(publicKey)

const encryptPassword = (pw: string) => {
	return crypt.encrypt(pw)
}

export default encryptPassword
