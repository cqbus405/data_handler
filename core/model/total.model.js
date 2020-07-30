const mysql = require('../lib/mysql.lib')

exports.get = callback => {
	const SQL = "SELECT "
						+ "plateno, `owner`, DATE_FORMAT(entertime, '%Y-%m-%d') as enterdate, "
						+ "DATE_FORMAT(entertime, '%Y-%m-%d %H:%i:%s') AS entertime, DATE_FORMAT(exittime, '%Y-%m-%d %H:%i:%s') AS exittime, "
						+ "DATE_FORMAT(entertime, '%H:%i:%s') AS enter, DATE_FORMAT(exittime, '%H:%i:%s') AS `exit`, "
						+ "parking, datediff(exittime, entertime) AS diff "
						+ "FROM "
						+ "total2 "
						// + " WHERE plateno = '京N7SX72' AND DATE_FORMAT(entertime, '%Y-%m-%d') = '2019-08-05' "
						+ "ORDER BY "
						+ "plateno, "
						+ "entertime;"

	mysql.connection.query(SQL, (error, results, fields) => {
		if (error) return callback(error, null)

		return callback(null, results)
	})
}

exports.getParkingList = callback => {
	const SQL = "SELECT DISTINCT "
						+ "	parking "
						+ "FROM "
						+ "	total;"

	mysql.connection.query(SQL, (error, results, fields) => {
		if (error) return callback(error, null)

		return callback(null, results)
	})
}