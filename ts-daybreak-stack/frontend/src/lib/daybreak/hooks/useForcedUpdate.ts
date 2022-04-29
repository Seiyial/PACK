import { useCallback, useState } from 'react'

const useForcedUpdate = () => {
	const [, updateState] = useState<{}>({})
	const forceUpdate = useCallback(() => updateState({}), [])
	return forceUpdate
}

export default useForcedUpdate
