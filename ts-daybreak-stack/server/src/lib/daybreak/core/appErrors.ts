// should provide a list of possible error codes as keys and error messages as values.

/** manual input of possible app errors. In implementations, use DkErrors instead */
export const _appErrors = {
	USER_NOT_FOUND: 'The user is not found.',
	USER_ALREADY_EXISTS: 'This user already exists.',
	USER_LOGIN_METHOD_NOT_ENABLED: 'This login method is not enabled for this account.',
	INVALID_SESSION: '(Invalid Session) please login again.',
	INVALID_REQUEST: 'Invalid request.',
	INCORRECT_PASSWORD: 'Incorrect password.',
	ALREADY_LOGGED_IN: 'You are already logged in. If switching to a new account, please logout first.',

	PRISMA_NOT_FOUND: 'Sorry, data not found.',
	PRISMA_ERROR: 'Failed to update data.',
	PRISMA_UNKNOWN: 'Sorry, database error. Please try again. If this persists, do contact us. (U)',
	PRISMA_RUST_PANIC_ERROR: 'Sorry, database error. Please try again. If this persists, do contact us. (U)',
	PRISMA_STRUCTURE_OR_VALIDATION_ERROR: 'Failed to update data. (PSOVE)',
	PRISMA_UNIQUE_CONSTRAINT_ERROR: 'Database unique constraint error',

	REDIS_ERROR: 'Failed to post data (R)',
	REDIS_STORED_BAD_FORMAT: 'Sorry, some data couldn\'t be retrieved. This is most likely a fault on our side.',

	WBW_BACKDATED_ISSUE_CREATION: 'This list does not accept new tickets. Please add your issue to the present Batch instead.',
	WBW_NO_ADDABLE_ISSUE_LIST_AND_NOT_AUTHORISED_TO_CREATE: 'There is no currently open Batch and you don\'t have the permissions in this project to create one. Please approach the project owner or someone else with admin permissions to do so.',
	WBW_CANNOT_POST_EMPTY_COMMENT: 'Cannot post an empty comment.',
	WBW_COMMENT_IMAGE_ATTACHMENT_TOO_LARGE: 'This image is too large. Please upload an image smaller than 10mb.',
	WBW_S3_UPLOAD_FAIL: '(S3) Upload failed.',

	NOT_YET_SUPPORTED: 'This feature is not yet supported.',
	UNAUTHORISED: 'You are not allowed to perform this action.',

	UNKNOWN: 'Sorry, something went wrong. (Unknown)',
	/** for custom error messages. */
	OTHER: 'Sorry, something went wrong. (Other)'
} as const
