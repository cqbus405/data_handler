var mysql = require('mysql')
var moment = require('moment')
var fs = require('fs')

var files = fs.readdirSync('d:/github/data_handler/dist')
files.forEach(file => {
	if (file === 'splited_records.csv') {
		fs.unlinkSync('d:/github/data_handler/dist/' + file)
	}
})

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'q',
	password: 'cqgogogo',
	database: 'parking3'
})

connection.connect()

var getTableNames = callback => {
	var GET_TABLES = "SELECT table_name "
								 + "FROM information_schema.tables "
								 + "WHERE table_schema = 'parking3' "
								 + "ORDER BY table_name DESC;"

	connection.query(GET_TABLES, function(error, results, fields) {
	  if (error) return callback(error)
		return callback(null, results)
	})
}

var getRecords = (tableName, callback) => {
	var GET_AK_RECORDS = "SELECT `车牌号` AS plateno, `进场VIP类型` AS cartype, DATE_FORMAT(`进场时间`, '%Y-%m-%d %H:%i:%s') AS entertime, "
										 + "DATE_FORMAT(`出场时间`, '%Y-%m-%d %H:%i:%s') AS exittime, DATEDIFF(`出场时间`, `进场时间`) AS diff, '" + tableName + "' AS parking "
										 + "FROM " + tableName + " "
										 + "WHERE `进场VIP类型` != '临时车' "
										 + "AND DATE_FORMAT(`进场时间`, '%Y-%m-%d') > '2019-07-31' "
										 + "ORDER BY entertime, plateno;"

	var GET_CT_RECORDS_PARKING1 = "SELECT * FROM ( "
															+ "SELECT `卡ID号` AS plateno, `卡类型` AS cartype, DATE_FORMAT(`入场时间`, '%Y-%m-%d %H:%i:%s') AS entertime, "
															+ "DATE_FORMAT(`出场时间`, '%Y-%m-%d %H:%i:%s') AS exittime, DATEDIFF(`出场时间`, `入场时间`) AS diff, 'cfy1' AS  parking "
															+ "FROM cfy_1 "
															+ "WHERE `卡类型` = '月卡' "
															+ "AND `卡ID号` IS NOT NULL "
															+ "AND `入场时间` < `出场时间` "
															+ "AND DATE_FORMAT(`入场时间`, '%Y-%m-%d') >= '2020-03-01' "
															+ "GROUP BY plateno, cartype, entertime, exittime) a "
															+ "GROUP BY plateno, DATE_FORMAT(entertime, '%Y-%m-%d %H:%i') "
															+ "ORDER BY entertime, plateno;"

	var GET_CT_RECORDS_PARKING2 = "SELECT * FROM ( "
															+ "SELECT `卡ID号` AS plateno, `卡类型` AS cartype, DATE_FORMAT(`入场时间`, '%Y-%m-%d %H:%i:%s') AS entertime, "
															+ "DATE_FORMAT(`出场时间`, '%Y-%m-%d %H:%i:%s') AS exittime, DATEDIFF(`出场时间`, `入场时间`) AS diff, 'cfy3' AS parking "
															+ "FROM cfy_3 "
															+ "WHERE `卡类型` = '月卡' "
															+ "AND DATE_FORMAT(`入场时间`, '%Y-%m-%d') >= '2020-03-01' "
															+ "AND `入场时间` < `出场时间`) a "
															+ "GROUP BY plateno, cartype, entertime, exittime "
															+ "ORDER BY entertime, plateno;"

	var sql = ''
	if (tableName === 'cfy_1') {
		sql = GET_CT_RECORDS_PARKING1
	} else if (tableName === 'cfy_3') {
		sql = GET_CT_RECORDS_PARKING2
	} else {
		sql = GET_AK_RECORDS
	}

	connection.query(sql, function(error, results, fields) {
	  if (error) return callback(error)
	  return callback(null, results)
	})
}

var splitRecords = () => {
	getTableNames((err, tableNames) => {
		if (err) {
			console.log(err)
		} else {
			var tableNamesJSON = JSON.parse(JSON.stringify(tableNames))
			var n = 0
			tableNamesJSON.forEach(item => {
				var tableName = item.table_name
				if (tableName !== 'splited') {
					getRecords(tableName, (err, records) => {
						if (err) console.log(err)

						let jsonRecords = JSON.parse(JSON.stringify(records))

						let splitedRecords = []

						jsonRecords.forEach(record => {
							let diff = record.diff

							if (diff === 0) {
								record.entertime = moment(record.entertime).format('YYYY-MM-DD HH:mm:ss')
								record.exittime = moment(record.exittime).format('YYYY-MM-DD HH:mm:ss')
								splitedRecords.push(record)
							} else {
								const dateFormat = 'YYYY-MM-DD'

								let enterTime = record.entertime
								let exitTime = record.exittime

								let enterDate = moment(enterTime).format(dateFormat)
								let exitDate = moment(exitTime).format(dateFormat)

								let newRecord

								for (let i = 0; i < diff + 1; ++i) {
									if (i === 0) {
										newRecord = Object.assign({}, record, {
											entertime: moment(enterTime).format('YYYY-MM-DD HH:mm:ss'),
											exittime: moment(enterDate + ' 23:59:59').format('YYYY-MM-DD HH:mm:ss')
										})
									} else if (i === diff) {
										newRecord = Object.assign({}, record, {
											entertime: moment(exitDate + ' 00:00:00').format('YYYY-MM-DD HH:mm:ss'),
											exittime: moment(exitTime).format('YYYY-MM-DD HH:mm:ss')
										})
									} else {
										newRecord = Object.assign({}, record, {
											entertime: moment(moment(enterTime).add(i, 'd').format(dateFormat) + ' 00:00:00').format('YYYY-MM-DD HH:mm:ss'),
											exittime: moment(moment(enterTime).add(i, 'd').format(dateFormat) + ' 23:59:59').format('YYYY-MM-DD HH:mm:ss')
										})
									}

									splitedRecords.push(newRecord)
								}
							}
						})

						// let output = 'plateno,entertime,exittime,parking\n'
						let output = ''

						splitedRecords.forEach(record => {
							let plateNo = record.plateno
							let enterTime = record.entertime
							let exitTime = record.exittime
							let parking = record.parking

							output += plateNo + ',' + enterTime + ',' + exitTime + ',' + parking + '\n'
						})

						fs.writeFile('d:/github/data_handler/dist/' + tableName + '_splited.csv', output, err => {
							if (err) console.log(err)
							console.log(tableName, 'Done!')

							n++
							if (n === 14) {
								console.log('All have done!')
								connection.end()

								// 读取文件夹下的文件
								var files = fs.readdirSync('d:/github/data_handler/dist')
								
								// 合并文件
								files.forEach((fileName, idx) => {
									if (fileName !== 'splited_records.csv') {
										var filePath = 'd:/github/data_handler/dist/' + fileName
										combineSplitedFiles(filePath, idx)
										fs.unlinkSync(filePath)
									}
								})

								console.log('File combine success!')
							}
						})					
					})
				}
			})
		}
	})
}

var combineSplitedFiles = (filePath, idx) => {
	var content = fs.readFileSync(filePath, 'utf-8')
	var fileContent = ''

	if (idx === 0) {
		fileContent += 'plateno,enterdatetime,exitdatetime,parking\n' + content
	} else {
		fileContent = content
	}

	fs.appendFileSync('d:/github/data_handler/dist/splited_records.csv', fileContent)
}

splitRecords()