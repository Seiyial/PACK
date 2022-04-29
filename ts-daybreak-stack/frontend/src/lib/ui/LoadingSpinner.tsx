import React from 'react'

export type PLoadingSpinner = {
	size: number
}
export const LoadingSpinner: React.FC<PLoadingSpinner> = ({ children, size }) => {
	return <>
		<svg
			xmlns='http://www.w3.org/2000/svg'
			xmlnsXlink='http://www.w3.org/1999/xlink'
			style={{ margin: 'auto', background: 'none', display: 'block', shapeRendering: 'auto' }}
			width={size}
			height={size}
			viewBox='0 0 100 100'
			preserveAspectRatio='xMidYMid'
		>
			<circle cx='50' cy='50' fill='none' stroke='currentColor' strokeWidth='10' r='35' strokeDasharray='164.93361431346415 56.97787143782138'>
				<animateTransform attributeName='transform' type='rotate' repeatCount='indefinite' dur='1.25s' values='0 50 50;360 50 50' keyTimes='0;1'></animateTransform>
			</circle>
			{ /* <!-- [ldio] generated by https://loading.io/ -->< */ }
		</svg>
	</>
}
