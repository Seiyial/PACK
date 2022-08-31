import produce, { Draft, freeze } from 'immer'
import { useCallback, useMemo, useState } from 'react'

export type RUseObjExtended<T, U extends {}> =
	RUseObj<T> &
	RCustomMappedFns<T, U>

export type RUseObj<T> = {
	val: T,
	update: (updater: (state: Draft<T>) => void) => void,
	set: (newValOrUpdaterFn: T | ((oldState: T) => T)) => void,
}

type CustomActionSpec<T> = { [k: string]: (state: T, ...params: any[]) => void }
type RCustomMappedFns<T, U extends CustomActionSpec<T>> = {
	[K in keyof U]: (
		U[K] extends (state: T, ...params: infer X) => void
		? (...params: X) => void
		: never
	)
}

/**
 * @author __[🐬Sayhao L.](https://github.com/Seiyial)__
 * @date 2022-02-02
 *
 * ## TWO ways to use.
 *
 * ### Basic usage:
 * ```ts
 * 	const controller = useObj<DataType>(initialState: DataType)
 * 	controller.state
 * 	controller.set(newState: DataType) // setState
 * 	controller.update((state) => { immer update })
 * ```
 *
 * ### Advanced usage as reducer
 * ```ts
 * 	const controller = useObj(initialState as DataType, { [k extends string]: immer functions } as const)
 * ```
 *
 * We can't do `useObj<T>(initial, { custom fx })`; ReduxToolkit can't do it too.
 * We can do `useObj<T, typeof actionsConst>(initial, actionsConst)` though.
 */
const useObj = <T, U extends CustomActionSpec<T> = CustomActionSpec<T>> (
	initialValue: T,
	customUpdaters?: U
): (typeof customUpdaters) extends undefined ? RUseObj<T> : RUseObjExtended<T, U> => {
	const [val, set] = useState(freeze(initialValue, true))

	const update = useCallback((updater: (orig: Draft<T>) => any) => set(produce<T>((v) => { updater(v) })), [])
	const customUpdaterFunctions: RCustomMappedFns<T, U> = useMemo(
		() => (
			customUpdaters
				? Object.fromEntries(
					(Object.entries(customUpdaters) as [string, (state: T, ...params: any[]) => void][])
						.map(([k, f]) => [k, (...p: any[]) => update((s) => (f as Function)(s, ...p))])
				)
				: {}
		) as RCustomMappedFns<T, U>, [update, customUpdaters]
	)

	const base: RUseObj<T> = {
		// better than use-immer, because it allows returning anything whereas use-immer requires Not returning anything for mutable update
		// (thus this skips the need for { } function braces).
		update,
		set,
		val
	}
	return {
		...base,
		...customUpdaterFunctions
	} as RUseObjExtended<T, U>
}

export default useObj
