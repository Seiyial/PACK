import { useRef } from 'react'

const useKeygen = () => {
	const key = useRef<number>(0)
	const getKey = () => {
		key.current += 1
		return key.current
	}
	return getKey
}

export default useKeygen
