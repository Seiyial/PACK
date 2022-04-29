module.exports = {
	content: [
		"./src/**/*.{vue,js,ts,jsx,tsx}",
		"index.html"
	],
	theme: {
		extend: {
			fontSize: {
				'2xs': '.65rem'
			},
			boxShadow: {
				s1: '0px 3px 6px 0px rgba(0,0,0,0.2)'
			}
		},
	},
	plugins: [],
}
