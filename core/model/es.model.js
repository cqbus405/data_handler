const mysql = require('../lib/mysql.lib')

exports.get = (startDate, endDate, startTime, endTime, parking, callback) => {
	SQL = "SELECT "
			+ "	DATE_FORMAT(`date`,'%Y-%m-%d') AS `date`, `time`, `count` "
			+ "FROM "
			+ parking + "_es "
			+ "WHERE "
			+ "	`date` BETWEEN '" + startDate + "' "
			+ "AND '" + endDate + "' "
			+ "AND `time` BETWEEN '" + startTime + "' "
			+ "AND '" + endTime + "';"

	mysql.connection.query(SQL, (error, results, fields) => {
		if (error) return callback(error, null)
		return callback(null, results)
	})
}