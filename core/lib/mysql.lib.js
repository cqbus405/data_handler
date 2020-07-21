const mysql = require('mysql')
const config = require('../../util/path.util').getConfig('mysql')

var connection = mysql.createConnection(config)

module.exports = connection