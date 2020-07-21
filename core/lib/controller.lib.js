const fs = require('fs')
const path = require('path')

let controllerMap = {}
const files = fs.readdirSync('d:/github/data_handler/core/controller')
files.forEach(fileName => {
	let baseName = path.basename(fileName, '.controller.js')
	let baseNameWithController = path.basename(fileName, '.js')
	controllerMap[baseName] = require(path.join(__dirname, '../controller/' + baseNameWithController))
})

module.exports = controllerMap