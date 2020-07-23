const connection = require('../lib/mysql.lib')

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
						+ "	total_split "
						+ "WHERE "
						+ "	entertime >= '"
						+ start + "' "
						+ "AND exittime <= '"
						// + end + "';"
						+ end + "' LIMIT 100;"

	connection.query(SQL, (error, results, fields) => {
		if (error) return callback(error, null)

		return callback(null, results)
	})
}