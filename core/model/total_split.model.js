const mysql = require('../lib/mysql.lib')

exports.get = (start, end, callback) => {
	const SQL = "SELECT "
						+ "	plateno, "
						+ "	`owner`, "
						+ "	date_format( "
						+ "		entertime, "
						+ "		'%Y-%m-%d %H:%i:%s' "
						+ "	) AS entertime, "
						+ "	date_format( "
						+ "		exittime, "
						+ "		'%Y-%m-%d %H:%i:%s' "
						+ "	) AS exittime, "
						+ "	parking "
						+ "FROM "
						+ "	total_split;"
						// + "WHERE "
						// + "	entertime >= '"
						// + start + "' "
						// + "AND exittime <= '"
						// + end + "';"
						// + end + "' LIMIT 1000;"

	mysql.connection.query(SQL, (error, results, fields) => {
		if (error) return callback(error, null)

		return callback(null, results)
	})
}

exports.getByStartEndDateParkingAsync = async (start, end, date, parking) => {
	const SQL = "SELECT "
						+ "	count(DISTINCT plateno) AS num "
						+ "FROM "
						+ "	total_split "
						+ "WHERE "
						+ "	parking = '" + parking + "' "
						+ "AND DATE(entertime) = '" + date + "' "
						+ "AND ( "
						+ "	TIME(entertime) <= '" + start + "' "
						+ "	AND TIME(exittime) >= '" + end + "' "
						+ ");"
	var result = await mysql.querySync(SQL)
	return JSON.parse(JSON.stringify(result))
}