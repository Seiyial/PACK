import produce from 'immer'
import { RecoilState, useRecoilState } from 'recoil'

export const useImmerRecoil = <S> (atom: RecoilState<S>) => {
	const [state, setState] = useRecoilState(atom)
	return ({
		state,
		setState,
		update: (
			updateFn: (currentState: S) => void
		) => setState((s) => produce(s, updateFn))
	})
}
