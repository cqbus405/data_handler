const mysql = require('mysql')
const config = require('../../util/path.util').getConfig('mysql')

var pool = mysql.createPool(config)

exports.querySync = (sql, values) => {
	return new Promise((resolve, reject) => {
		pool.getConnection((error, connection) => {
			if (error) {
				reject(error)
			} else {
				connection.query(sql, values, (error, results, fields) => {
					if (error) {
						reject(error)
					} else {
						resolve(results)
					}
					connection.release()
				})
			}
		})
	})
}

exports.connection = mysql.createConnection(config)