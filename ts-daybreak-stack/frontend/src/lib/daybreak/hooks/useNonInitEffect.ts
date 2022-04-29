import React, { useEffect, useRef } from 'react'

const useNonInitEffect = (effect: React.EffectCallback, deps?: React.DependencyList) => {
	const initialised = useRef<boolean>(false)
	useEffect(() => {
		if (!initialised.current) {
			initialised.current = true
		} else {
			effect()
		}
	}, deps)
}

export default useNonInitEffect
