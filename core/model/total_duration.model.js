const mysql = require('../lib/mysql.lib')

exports.get = callback => {
	const SQL = "SELECT plateno, `owner`, DATE_FORMAT(entertime, '%Y-%m-%d %H:%i:%s') AS entertime, DATE_FORMAT(exittime, '%Y-%m-%d %H:%i:%s') AS exittime, duration, parking "
						+ "FROM total_duration;"

	mysql.connection.query(SQL, (error, results, fields) => {
		if (error) return callback(error, null)

		return callback(null, results)
	})
}