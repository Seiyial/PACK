import { DkResult, r } from 'lib/daybreak'


const parsePageIndex = (pgIndexStr: string): DkResult<number> => {
	try {
		const num = parseInt(pgIndexStr)
		if (Number.isNaN(num)) return r.fail('INVALID_REQUEST')
		if (num < 0) return r.fail('INVALID_REQUEST')
		return r.pass(num)
	} catch (e) {
		return r.fail('INVALID_REQUEST')
	}
}

export default parsePageIndex