import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export type PRedirect = {
	targetPath: string
}
export const Redirect: React.FC<PRedirect> = ({ targetPath }) => {

	const nav = useNavigate()
	useEffect(() => {
		nav(targetPath)
	}, [])

	return <></>
}
