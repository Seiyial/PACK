import { AnimatePresence, motion } from 'framer-motion'
import { useString } from 'lib/daybreak/hooks/useString'
import { Button } from 'lib/ui/Button'
import paths from 'modules/shared/paths'
import querySession from 'modules/shared/querySession'
import useSession from 'modules/shared/useSession'
import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export type PLoginPage = {
}
export const LoginPage: React.FC<PLoginPage> = ({ children }) => {

	const sess = useSession({ ifLoggedIn: true })
	const nav = useNavigate()
	const err = useString()
	const errTimeout = useRef<number>()

	const perfSetTempError = (errVal: string) => {
		err.set(errVal)
		errTimeout.current = setTimeout(() => err.set(''), 5000)
	}

	const perfLogin = async () => {
		const email = (document.getElementById('email-field') as HTMLInputElement).value ?? ''
		const pw = (document.getElementById('pw-field') as HTMLInputElement).value ?? ''
		if (!email) return perfSetTempError('Please enter your email.')
		if (!email.includes('@')) return perfSetTempError('That\'s an invalid email.')
		if (!pw) return perfSetTempError('Please enter your password.')
		return querySession.loginWithEmailPassword(
			email,
			pw
		)
			.then((resp) => {
				if (resp.ok) {
					sess.setState({ currentUser: resp.data.user, initialised: true })
					nav(paths.main())
				} else {
					perfSetTempError(resp.err.msg)
				}
			})
	}

	return <motion.div
		className='flex flex-col items-center justify-center w-full h-full overflow-auto transition-all bg-indigo-900'
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		exit={{ opacity: 0 }}
		transition={{ duration: 1 }}
	>
		<motion.div
			className='p-5 bg-white shadow-xl rounded-xl w-[95vw] max-w-xs focus-within:shadow-2xl transition-shadow'
			initial={{ opacity: 0, y: 100 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 100 }}
			transition={{ duration: 1 }}
		>
			<div className='pt-10 pb-12 mb-3 font-bold text-center'>
				The App
			</div>

			<input
				id='email-field'
				autoFocus
				className='w-full px-4 py-2 font-semibold transition-colors border-2 rounded-md outline-none border-slate-300 hover:border-indigo-300 focus:border-indigo-700 placeholder:font-normal'
				placeholder='your-email@example.com'
			/>

			<div className='h-3' />

			<input
				id='pw-field'
				className='w-full px-4 py-2 font-semibold transition-colors border-2 rounded-md outline-none border-slate-300 hover:border-indigo-300 focus:border-indigo-700 placeholder:font-normal'
				placeholder='•••••••••'
				type='password'
				onKeyDown={({ key }) => {
					if (key === 'Enter') {
						const el = document.getElementById('login-btn')
						el?.focus()
						el?.click()
					}
				}}
			/>

			<div className='h-3' />

			<AnimatePresence>
				{
					err.val
						? <motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
							className='font-semibold text-center text-red-500'
						>
							{ err.val }
						</motion.div>
						: null
				}
			</AnimatePresence>
			<div className='h-3' />
			<Button
				theme='primary_filled'
				id='login-btn'
				onClickAsync={() => perfLogin()}
			>
				Login
			</Button>
		</motion.div>
	</motion.div>
}
