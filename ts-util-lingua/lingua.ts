
const capitalise = (value: string) => value.charAt(0).toUpperCase() + value.substring(1)

const capitalised = (value: string) => value.charAt(0).toUpperCase() + value.substring(1).toLowerCase()

const pluralModifier = (addChar: string, value: number | null | undefined) => {
	if (value && value !== 1) {
		return addChar
	} else {
		return ''
	}
}

const pluralableTerm = (valueIfSingular: string, valueIfPlural: string, count: number | null | undefined) => {
	if (count && count !== 1) {
		return valueIfPlural
	} else {
		return valueIfSingular
	}
}

/**
 * @author __[🐬Sayhao L.](https://github.com/Seiyial)__
 * @date 2021-12-29
 *
 * Linguistics utilities (lingua.ts)
 */
const lingua = { capitalise, capitalised, pluralModifier, pluralableTerm }
export default lingua
