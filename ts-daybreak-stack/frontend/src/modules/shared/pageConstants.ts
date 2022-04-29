export const kPageDOMContainerID = 'wbw-page-scroll-container'



export const useScrollToBottom = () => () => {
	const el = document.getElementById(kPageDOMContainerID)
	if (el) {
		el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
	}
}
