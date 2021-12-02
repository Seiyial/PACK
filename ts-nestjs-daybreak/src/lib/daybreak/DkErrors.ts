
const _DkErrors = {
	USER_NOT_FOUND: '',
	INVALID_SESSION: '(Invalid Session) please login again.',
	INVALID_REQUEST: 'Invalid request.',
	USER_ALREADY_EXISTS: 'This user already exists.',
	ALREADY_LOGGED_IN: 'You are already logged in. If switching to a new account, please logout first.',

	PRISMA_NOT_FOUND: 'Sorry, data not found.',
	PRISMA_ERROR: 'Failed to update data.',
	PRISMA_UNKNOWN: 'Sorry, database error. Please try again. If this persists, do contact us. (U)',
	PRISMA_RUST_PANIC_ERROR: 'Sorry, database error. Please try again. If this persists, do contact us. (U)',
	PRISMA_STRUCTURE_OR_VALIDATION_ERROR: 'Failed to update data. (PSOVE)',

	REDIS_ERROR: 'Failed to post data (R)',
	REDIS_STORED_BAD_FORMAT: 'Sorry, some data couldn\'t be retrieved. This is most likely a fault on our side.',

	NOT_YET_SUPPORTED: 'This feature is not yet supported.',

	UNKNOWN: 'Sorry, something went wrong.'
} as const

export type DkError = {
	errCode: DkErrorCode,
	errMsg: string,
	_isDkError: true,
	props?: object
}

export const DkErrors = Object.fromEntries(
	Object
		.entries(_DkErrors)
		.map(([k, v]) => ([k as DkErrorCode, { errCode: k, errMsg: v, _isDkError: true } as DkError]))
) as { [k in DkErrorCode]: DkError }

export type DkErrorCode = keyof typeof _DkErrors
