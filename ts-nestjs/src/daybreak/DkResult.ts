type DkSuccessResult<DataType = undefined> = (
	DataType extends undefined
	? { data?: undefined, ok: true, issue?: undefined, errProps?: undefined }
	: { data: DataType, ok: true, issue?: undefined, errProps?: undefined }
)

type DkFailureResult = {
	ok: false,
	issue: string,
	errCode?: DkErrorCode,
	data?: undefined
	errProps: { [k: string]: any }
}

export type DkResult<DataType = undefined> = DkSuccessResult<DataType> | DkFailureResult

const _DkErrors = {
	USER_NOT_FOUND: '',
	INVALID_SESSION: '(Invalid Session) please login again.',

	CM_CREDS_CREATION_MISSING_EMAIL: 'We could not retrieve your email for credentials creation.',
	CM_CREDS_CREATION_MISSING_ACCESS_TOKEN: 'We could not retrieve your access token for credentials creation. Please try logging in again.',
	CM_CREDS_CREATION_MISSING_NAME: 'We could not retrieve your name for credentials creation.',
	CM_CREDS_MISSING_UID: 'Your authorised account could not be found. Please try re-authorising the app with your sign-in-provider.',
	CM_CREDS_NOT_FOUND: 'Your authorised account could not be found.',
	CM_CREDS_GMAIL_REFRESH_TOKEN_MISSING: 'Sorry, your gmail refresh token is missing from our records. Please manually re-connect your Gmail account.', // HELP DOCS
	CM_CREDS_TO_MAILBOX_PROVIDER_MISMATCH: 'Sorry, this mailbox may be setup wrongly. Please contact us. (CM_CREDS_TO_MAILBOX_PROVIDER_MISMATCH)',

	CM_UNABLE_TO_CREATE_USER_UNKNOWN_REASON: 'Sorry, we were unable to sign you up for an unknown reason. Please contact us.',
	CM_INVALID_REQ: 'something went wrong.',
	CM_INTENT_DATA_INVALID: 'We don\'t support this data type yet.',
	CM_INTENT_NOT_SUPPORTED: 'We don\'t support this data type yet.',
	CM_INTENT_JSON_LD_PARSE_FAIL: 'Sorry, the intent data for this message was of an unsupported format.',
	CM_MAILBOX_IS_UNPAID: 'This is a paid feature. Please ensure your mailbox is on a subscription. If you are, please contact us.',
	CM_MAILBOX_USER_PAUSED: 'You have currently deactivated your mailbox. Please reactivate it first.',
	CM_PROVIDER_NOT_YET_SUPPORTED: 'This feature is not yet supported for your mailbox type. Sorry for the inconvenience caused.',
	CM_RESOURCE_NOT_ACCESSIBLE: 'Not found.',
	TEST_ERROR: 'This is a test error.',
	CM_DRAFTS_FETCH_ERROR: 'Something went wrong with fetching your drafts. We\'re sorry. Please contact us.',
	CM_SETUPSYNC_THREAD_FETCH_FAIL: 'Failed to fetch threads. Sorry for the inconvenience. Please inform us about the error so that we can fix it.',
	CM_CREDS_NOT_ALLOWED_FOR_LOGIN: 'The owner of the ChillMail account this email belongs to has specified that ChillMail logins cannot be made through this account.',

	CM_FAIL_TO_RECONCILE_HISTORY: 'Failed to sync your most recent emails. Sorry for the inconvenience. This may be a bug, please check with us. Thanks!',

	CM_MAILBOX_EMAIL_ALREADY_EXISTS: 'This mailbox has already been created, either in your or another account. If you would like to transfer the mailbox to your account, please contact us to verify that you are its owner.',

	CM_APPLE_UNEXPECTED_RESULT: '',
	CM_APPLE_REFRESH_TOKEN_MISSING: '(Refresh token missing) Sorry. If this is your first time logging in, please contact us. If this is not your first time logging in, please remove us from your Apple Account control panel, then sign in again.',

	CM_USER_DOES_NOT_HAVE_GOOGLE_AUTH: 'Sorry, this feature is only for user accounts created using Google sign-in. If your account was created using Google sign-in, please sign out and sign-in to this account again.',
	CM_GMAIL_HISTORYID_NOT_FOUND: 'We are unable to sync your gmail account. Please contact us. (historyId 404)',
	CM_LISTHISTORY_BAD_RESPONSE: 'We are unable to sync your gmail account. Please contact us. (historyList badResp)',
	CM_GMAIL_UNEXPECTED_RESULT: 'We were unable to process this request. Feel free to contact me for help. Try to go to settings and "Re-authenticate with Google" to fix this issue. If it persists, please contact us.',
	CM_GMAIL_MAILBOX_STATUS_NOT_SYNCABLE: 'Your mailbox is not in a suitable state for syncing.',
	CM_MAILBOX_NOT_FOUND: 'Mailbox not locatable. Please try again.',
	CM_GMAIL_SIDE_CANNOT_PROCESS_DELETION: 'We could not process the deletion with Gmail. Sorry, this item may still remain undeleted on Gmail\'s side. This is most likely a bug. Feel free to contact us for more assistance.',
	CM_MAILBOX_SUB_LIMIT_FOR_PLAN_REACHED: 'You have exceeded the number of mailboxes allowed for your plan. If this is a wrong calculation, "Refresh Mailbox Subscriptions" and try again. If your payments do not reflect correctly, please contact support with a screenshot.',

	DOSP_UPLOAD_ERROR: 'Failed to upload the file.',
	DOSP_GET_ERROR: 'Failed to get the file.',

	CM_UPLOAD_DB_PATCH_ERROR: 'Failed to upload the file. (2)',
	CM_ATTACHMENT_DB_REC_NOT_FOUND: 'Sorry, something unexpected occured. Please report this. (CM_ADBR_NF)',
	CM_GMAIL_UNSUPPORTED_SYS_LABEL: 'Sorry, something unexpected occured. Please report this. (CM_G_UNSP_SYSLABEL)',
	CM_DRAFT_ATTACHMENT_STORAGE_QUOTA_OVERUSED: 'Sorry, you have used up too much storage in your draft attachments. Please delete some unused draft messages. If you have no draft messages, go to settings and purge draft attachments.',

	CM_GPEOPLE_INSUFFICIENT_PERMISSION: 'We require access to your Gmail contacts so as to properly display your Gmail messages.',
	CM_GPEOPLE_UNEXPECTED_RESULT: 'We were unable to obtain the requested information about your Google contact(s). If you did request to sync your contact information with us for better email display, go to mailbox settings and try "Re-grant permissions". If not, it\'s a bug; please let me know, thanks!',

	CM_DRAFT_NOT_FOUND: 'Draft not found. Please save the draft again.',

	PRISMA_NOT_FOUND: 'Sorry, data not found.',
	PRISMA_ERROR: 'Failed to update data.',
	PRISMA_UNKNOWN: 'Sorry, database error. Please try again. If this persists, do contact us. (U)',
	PRISMA_RUST_PANIC_ERROR: 'Sorry, database error. Please try again. If this persists, do contact us. (U)',
	PRISMA_STRUCTURE_OR_VALIDATION_ERROR: 'Failed to update data. (PSOVE)',

	REDIS_ERROR: 'Failed to post data (R)',
	REDIS_STORED_BAD_FORMAT: 'Sorry, some data couldn\'t be retrieved. This is most likely a fault on our side.',

	NOT_YET_SUPPORTED: 'This feature is not yet supported.',

	CM_USR_LABEL_DOESNT_EXIST: 'We couldn\'t find this label in this mailbox. If you created it in gmail, try going to Settings > Resync Labels.',

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

export const DkResults = {
	fail: (issue: string | DkError, data?: { [k: string]: any }): DkFailureResult => {
		if (typeof issue === 'string') {
			return <DkFailureResult>({ ok: false, issue, errProps: data })
		} else {
			return <DkFailureResult>({ ok: false, issue: issue.errMsg, errCode: issue.errCode, errProps: data })
		}
	},
	pass: <T = undefined>(data?: T): DkSuccessResult<T> => {
		return <DkSuccessResult<T>>({ ok: true, data })
	},
	_extractErrorFromResult: (result: DkFailureResult): DkError => {
		return ({ _isDkError: true, errCode: result.errCode ?? 'UNKNOWN', errMsg: _DkErrors[result.errCode ?? 'UNKNOWN'], props: result.errProps })
	},
	withoutData: (result: DkResult<any>): DkResult<undefined> => {
		return result.ok
			? { ok: true }
			: { ok: false, issue: result.issue, errProps: {}, errCode: (result as DkFailureResult).errCode }
	}
}

export const r = {
	pass: DkResults.pass,
	fail: (errCode: DkErrorCode, props?: { [k: string]: any }): DkFailureResult => ({
		ok: false,
		issue: DkErrors[errCode].errMsg,
		errCode,
		errProps: props ?? {},
		data: undefined
	}),
	prisma: <T extends object>(result: Promise<T>): Promise<DkResult<T>> => result
		.then((val) => ({ ok: true, data: val }) as DkSuccessResult<T>)
		.catch(() => ({ ok: false, errProps: {}, issue: DkErrors.PRISMA_ERROR.errMsg, errCode: 'PRISMA_ERROR' })),
	make: (result: Promise<any>): Promise<DkResult> => result
		.then(() => ({ ok: true, data: undefined }) as DkSuccessResult<undefined>)
		.catch((e) => ({ ok: false, errProps: {}, issue: DkErrors.PRISMA_ERROR.errMsg, errCode: 'PRISMA_ERROR' })),


	catchPrisma: (error: any, logError?: (stack: string) => void, errLabel?: string): DkFailureResult => {
		logError?.(`${errLabel ? `<<${errLabel}>>` : 'JS Error?'}\nError: ${error.name}\nMessage: ${error.message}\nStack: ${error.stack}`)
		return { ok: false, errProps: {}, issue: DkErrors.PRISMA_ERROR.errMsg, errCode: 'PRISMA_ERROR' }
	}
}
