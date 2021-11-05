'use strict'

stringify.serialize = serialize
stringify.shake = shake
stringify.normalize = normalize
stringify.appendToUrl = appendToUrl

module.exports = stringify

function appendToUrl(url, i) {
	const qs = stringify(i)

	if (qs === '') return url
	return url + '?' + qs
}

function stringify(i) {
	if (i === null || typeof i !== 'object' || Array.isArray(i)) {
		throw new Error('Only objects can be stringified')
	}

	const shaken = shake(normalize(i))

	if (shaken === undefined) return ''
	return serialize(shaken)
}

function serialize(i, prefix) {
	if (Array.isArray(i)) {
		const hasComplex = i.some(isComplex)

		return i
			.map((i, idx) => {
				return serialize(
					i,
					prefix + (hasComplex ? '[' + idx + ']' : '[]')
				)
			})
			.join('&')
	}
	if (typeof i === 'object') {
		return Object.keys(i)
			.map((key) => {
				return serialize(
					i[key],
					prefix === undefined
						? encodeURIComponent(key)
						: prefix + '[' + encodeURIComponent(key) + ']'
				)
			})
			.join('&')
	}
	return prefix + '=' + encodeURIComponent(i)
}

function shake(i) {
	if (i === undefined) return
	if (Array.isArray(i)) {
		const shaken = i.map(shake).filter(isDefined)

		if (shaken.length === 0) return
		return shaken
	}
	if (typeof i === 'object') {
		let empty = true
		const shaken = Object.keys(i).reduce((o, key) => {
			const shaken = shake(i[key])

			if (shaken !== undefined) {
				empty = false
				o[key] = shaken
			}

			return o
		}, {})

		if (empty) return
		return shaken
	}
	return i
}

function normalize(i) {
	if (i === undefined) return undefined
	if (i === null) return ''
	if (i === true) return 'y'
	if (i === false) return 'n'
	if (typeof i.toJSON === 'function') return normalize(i.toJSON())

	const type = typeof i

	if (type === 'string') return i
	if (Array.isArray(i)) return i.map(normalize)
	if (type === 'object') {
		return Object.keys(i).reduce((o, key) => {
			o[key] = normalize(i[key])

			return o
		}, {})
	}

	return i + ''
}

function isDefined(i) {
	return i !== undefined
}

function isComplex(i) {
	if (Array.isArray(i)) return true
	if (typeof i === 'object') return true
	return false
}
