const mysql = require('../lib/mysql.lib')

exports.getParkings = callback => {
	var SQL = "SELECT pkcode, pkname FROM parking;"
	mysql.connection.query(SQL, (error, results, fields) => {
		if (error) return callback(error, null)
		return callback(null, results)
	})
}