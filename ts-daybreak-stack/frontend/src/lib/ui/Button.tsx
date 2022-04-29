import { motion } from 'framer-motion'
import { useBool } from 'lib/daybreak/hooks/useBool'
import React, { useEffect } from 'react'
import { LoadingSpinner } from './LoadingSpinner'

const map = {
	teal_filled: 'bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-700 ring-teal-700',
	primary_filled: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-700 ring-indigo-700',
	primary_light_medium: 'bg-indigo-200 text-indigo-900 hover:bg-indigo-300/80 active:bg-indigo-300 ring-indigo-800',
	primary_light: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:bg-indigo-200 ring-indigo-800',
	primary_link_transparent: 'bg-transparent text-indigo-800 hover:bg-indigo-300/30 active:bg-indigo-300/60',
	primary_link_transparent_light: 'bg-transparent text-indigo-800 hover:bg-indigo-300/20 active:bg-indigo-300/30 underline decoration-transparent hover:decoration-indigo-300 decoration-2',
	slate_link_transparent_light: 'bg-transparent text-slate-500 hover:bg-slate-300/50 hover:text-slate-800 active:bg-slate-300/30 underline decoration-transparent hover:decoration-slate-400/50 decoration-2',
	slate_super_light_outlined: 'bg-slate-50 text-black hover:bg-slate-100 active:bg-slate-200 border-2 border-slate-200 ring-slate-800',
	slate_light: 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300',
	slate_medium: 'bg-slate-200 text-black hover:bg-slate-300 active:bg-slate-300 ring-slate-800',
	slate_medium_light: 'bg-slate-100 text-black hover:bg-slate-200 active:bg-slate-300 ring-slate-800',
	slate_shade_light: 'bg-slate-300 text-black hover:bg-slate-400 active:bg-slate-500 ring-slate-800',
	slate_transparent_light: 'bg-transparent text-black hover:bg-slate-100 active:bg-slate-200 ring-slate-800',
	slate_transparent_medium: 'bg-transparent text-black hover:bg-slate-200 active:bg-slate-300 ring-slate-400',
	danger_transparent: 'bg-transparent text-red-600 hover:bg-red-50 active:bg-red-100 ring-red-600',
	danger_light: 'bg-red-100 text-red-900 hover:bg-red-200 active:bg-red-300 ring-red-800',
	success_light: 'bg-emerald-200 text-emerald-900 hover:bg-emerald-300 active:bg-emerald-300 ring-emerald-800',
	success_filled: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-700 ring-emerald-700',
	success_slate_outlined: 'text-slate-600 bg-slate-200/90 hover:bg-emerald-400/50 active:bg-emerald-700 active:text-white ring-slate-600',
	success_outlined: 'text-emerald-600 bg-transparent hover:bg-emerald-400/20 active:bg-emerald-600 active:text-white border border-emerald-600',
	success_transparent: 'bg-transparent text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 ring-emerald-400',
	custom: ''
} as const

const borders = {
	slate: 'border border-slate-200'
} as const

export type PButton = {
	theme: keyof typeof map,
	id?: string,
	onClickAsync?(): Promise<any>,
	onClick?(): any,
	raised?: boolean | 'sm',
	fullWidth?: boolean,
	className?: string,
	ring?: boolean,
	border?: keyof typeof borders,
	small?: boolean,
	extraSmall?: boolean,
	customFlexClassName?: string,
	setLoading?: boolean,
	fontLite?: boolean
}
export const Button: React.FC<PButton> = ({ customFlexClassName, border, children, theme, id, onClick, onClickAsync, fullWidth = true, raised = false, className, ring = true, small, setLoading, fontLite, extraSmall }) => {

	const isLoading = useBool()
	useEffect(() => {
		if (typeof setLoading === 'boolean') isLoading.set(setLoading)
	}, [setLoading])

	return <motion.button
		id={id}
		className={`rounded-md ${border ? borders[border] : ''} transition-colors ${map[theme]} flex ${customFlexClassName ?? 'items-center justify-center'} ${fullWidth ? 'w-full' : ''} ${extraSmall ? 'px-2 py-0' : (small ? 'px-4 py-1.5' : 'px-6 py-2')} ${fontLite ? '' : 'font-semibold'} transition-colors duration-150 transform rounded-md outline-none active:translate-y-[1px] ${raised ? (raised === 'sm' ? 'shadow-md' : 'shadow-s1') : ''} ${ring ? 'focus:ring-2 focus:ring-offset-2' : ''} ${className ?? ''}`}
		onClick={
			isLoading.val
				? undefined
				: onClickAsync
					? () => {
						isLoading.set(true)
						onClickAsync().finally(() => isLoading.set(false))
					}
					: onClick
		}
	>
		{
			isLoading.val
				? <LoadingSpinner size={16} />
				: children
		}
	</motion.button>
}
