export const dkFmtError = (error: any, label?: string): string => {
	return `${label ? `<<${label}>>` : 'JS Error?'}\nError: ${error.name}\nMessage: ${error.message}\nStack: ${error.stack}`
}
