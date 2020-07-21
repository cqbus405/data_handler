const connection = require('../lib/mysql.lib')

exports.get = (fileName, callback) => {
	const SQL = "SELECT "
						+ "	* "
						+ "FROM "
						+ `	${fileName}_org `
						+ "WHERE "
						+ "	plateno IS NOT NULL "
						+ "AND CHAR_LENGTH(plateno) != LENGTH(plateno) "
						+ "AND cartype != '临时车' "
						+ "ORDER BY "
						+ "	plateno, "
						+ "	enterorexittime;"

	connection.query(SQL, (error, results, fields) => {
		if (error) return callback(error, null)

		return callback(null, results)
	})
}