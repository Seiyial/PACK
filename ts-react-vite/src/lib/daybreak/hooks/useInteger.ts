import { useState } from 'react'


const useInteger = (initialValue: number = 0) => {
	const [val, setVal] = useState<number>(initialValue)
	return ({
		val,
		add: (by: number = 1) => setVal((v) => v + by),
		decr: (by: number = 1) => setVal((v) => v - by),
		set: setVal
	})
}

export default useInteger