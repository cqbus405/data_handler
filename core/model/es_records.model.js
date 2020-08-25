const mysql = require('../lib/mysql.lib')

exports.get = (parking, callback) => {
	SQL = "SELECT es_records.*, parking.property "
			+ "FROM es_records "
			+ "LEFT JOIN parking ON es_records.parking = parking.pkcode "
			+ "WHERE parking = '" + parking + "' "
			+ "ORDER BY date, time;"

	mysql.connection.query(SQL, (error, results, fields) => {
		if (error) return callback(error, null)
		return callback(null, results)
	})
}