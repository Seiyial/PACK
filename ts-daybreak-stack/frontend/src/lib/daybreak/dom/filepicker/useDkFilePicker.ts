

const useDkFilePicker = () => {
	const pickFile = () => new Promise<File | null>((resolve, reject) => {
		const inputEl = document.createElement('input')
		inputEl.type = 'file'
		inputEl.onchange = (event) => {
			const files = (event.target as HTMLInputElement)?.files
			const file = files?.item(0)
			if (!file) return resolve(null)
			return resolve(file)
		}
		inputEl.click()
	})

	return { pickFile }
}

export default useDkFilePicker
