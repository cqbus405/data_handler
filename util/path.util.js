const fs = require('fs')

exports.getConfig = key => {
	const config = JSON.parse(fs.readFileSync('d:/github/data_handler/config/config.json', 'utf-8'))
	const value = config[key]
	return value
}