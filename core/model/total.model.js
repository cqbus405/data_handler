const connection = require('../lib/mysql.lib')

exports.get = callback => {
	const SQL = "SELECT "
						+ "	*, datediff(exittime, entertime) AS diff "
						+ "FROM "
						+ "	total "
						+ "ORDER BY "
						+ "	plateno, "
						+ "	entertime LIMIT 1;"

	connection.query(SQL, (error, results, fields) => {
		if (error) return callback(error, null)

		return callback(null, results)
	})
}