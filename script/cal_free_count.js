var moment = require('moment')
var mysql = require('mysql')
var fs = require('fs')

var groupByPlatenoAndDate = records => {
	var groupedDatas = {}
	records.forEach(record => {
		var plateno = record.plateno
		var enterdate = record.enterdate
		var parking = record.parking
		var key = plateno + '_' + enterdate + '_' + parking
		var isExists = groupedDatas.hasOwnProperty(key)
		if (!isExists) groupedDatas[key] = new Array()
		groupedDatas[key].push(record)
	})
	return groupedDatas
}

var getAvlRange = groupedDatas => {
	var START = '08:30:00'
	var END = '18:30:00'
	var recordsWithAvlRangeCSV = 'plateno,enterdate,from,to,avlrange,parking\n'
	for (var key in groupedDatas) {
		var records = groupedDatas[key]
		var lenOfRecords = records.length
		if (lenOfRecords === 1) {
			var record = records[0]
			var plateNo = record.plateno
			var enterDate = record.enterdate
			var enterTime = record.entertime
			var exitTime = record.exittime
			var parking = record.parking
			// console.log(record)
			if (moment(enterTime, 'H:m:s').isSameOrBefore(moment(START, 'H:m:s')) && moment(exitTime, 'H:m:s').isSameOrBefore(moment(END, 'H:m:s'))) {	
				var avlRange = moment(END, 'H:m:s').diff(moment(exitTime, 'H:m:s'), 'minutes')
				avlRange = Math.ceil(avlRange / 60)
				recordsWithAvlRangeCSV += plateNo + ',' + enterDate + ',' + exitTime + ',' + END + ',' + avlRange + ',' + parking + '\n'
 			} else if (moment(enterTime, 'H:m:s').isAfter(moment(START, 'H:m:s')) && moment(exitTime, 'H:m:s').isBefore(moment(END, 'H:m:s'))) {
				var frontAvlRange = moment(enterTime, 'H:m:s').diff(moment(START, 'H:m:s'), 'minutes')
				var backAvlRange = moment(END, 'H:m:s').diff(moment(exitTime, 'H:m:s'), 'minutes')
				frontAvlRange = Math.ceil(frontAvlRange / 60)
				backAvlRange = Math.ceil(backAvlRange / 60)
				recordsWithAvlRangeCSV += plateNo + ',' + enterDate + ',' + START + ',' + enterTime + ',' + frontAvlRange + ',' + parking + '\n'
				recordsWithAvlRangeCSV += plateNo + ',' + enterDate + ',' + exitTime + ',' + END + ',' + backAvlRange + ',' + parking + '\n'
			} else {
				var avlRange = moment(enterTime, 'H:m:s').diff(moment(START, 'H:m:s'), 'minutes')
				avlRange = Math.ceil(avlRange / 60)
				recordsWithAvlRangeCSV += plateNo + ',' + enterDate + ',' + START + ',' + enterTime + ',' + avlRange + ',' + parking + '\n'
			}
		} else if (lenOfRecords > 2) {
			for (var i = 0; i < lenOfRecords - 1; ++i) {
				var frontRecord = records[i]
				var backRecord = records[i + 1]

				var plateNo = frontRecord.plateno
				var enterDate = frontRecord.enterdate
				var parking = frontRecord.parking

				if (i === 0) {
					if (moment(frontRecord.entertime, 'H:m:s').isBefore(moment(START, 'H:m:s')) && moment(frontRecord.exittime, 'H:m:s').isSameOrAfter(moment(START, 'H:m:s'))) {
						var avlRange = moment(backRecord.entertime, 'H:m:s').diff(moment(frontRecord.exittime, 'H:m:s'), 'minutes')
						avlRange = Math.ceil(avlRange / 60)
						recordsWithAvlRangeCSV += plateNo + ',' + enterDate + ',' + frontRecord.exittime + ',' + backRecord.entertime + ',' + avlRange + ',' + parking + '\n'
					} else {
						var frontAvlRange = moment(frontRecord.entertime, 'H:m:s').diff(moment(START, 'H:m:s'), 'minutes')
						var backAvlRange = moment(backRecord.entertime, 'H:m:s').diff(moment(frontRecord.exittime, 'H:m:s'), 'minutes')
						frontAvlRange = Math.ceil(frontAvlRange / 60)
						backAvlRange = Math.ceil(backAvlRange / 60)
						recordsWithAvlRangeCSV += plateNo + ',' + enterDate + ',' + START + ',' + frontRecord.entertime + ',' + frontAvlRange + ',' + parking + '\n'
						recordsWithAvlRangeCSV += plateNo + ',' + enterDate + ',' + frontRecord.exittime + ',' + backRecord.entertime + ',' + backAvlRange + ',' + parking + '\n'
					}
				} 

				if (i + 1 === lenOfRecords - 1) {
					if (moment(backRecord.exittime, 'H:m:s').isBefore(moment(END, 'H:m:S'))) {
						var frontAvlRange = moment(backRecord.entertime, 'H:m:s').diff(moment(frontRecord.exittime, 'H:m:s'), 'minutes')
						var backAvlRange = moment(END, 'H:m:s').diff(moment(backRecord.exittime, 'H:m:s'), 'minutes')
						frontAvlRange = Math.ceil(frontAvlRange / 60)
						backAvlRange = Math.ceil(backAvlRange / 60)
						recordsWithAvlRangeCSV += plateNo + ',' + enterDate + ',' + frontRecord.exittime + ',' + backRecord.entertime + ',' + frontAvlRange + ',' + parking + '\n'
						recordsWithAvlRangeCSV += plateNo + ',' + enterDate + ',' + backRecord.exittime + ',' + END + ',' + backAvlRange + ',' + parking + '\n'
					} else {
						var avlRange = moment(backRecord.entertime, 'H:m:s').diff(moment(frontRecord.exittime, 'H:m:s'), 'minutes')
						avlRange = Math.ceil(avlRange / 60)
						recordsWithAvlRangeCSV += plateNo + ',' + enterDate + ',' + frontRecord.exittime + ',' + backRecord.entertime + ',' + avlRange + ',' + parking + '\n'
					}
				} 

				if (i > 0 && i < lenOfRecords - 2) {
					var avlRange = moment(backRecord.entertime, 'H:m:s').diff(moment(frontRecord.exittime, 'H:m:s'), 'minutes')		
					avlRange = Math.ceil(avlRange / 60)
					recordsWithAvlRangeCSV += plateNo + ',' + enterDate + ',' + frontRecord.exittime + ',' + backRecord.entertime + ',' + avlRange + ',' + parking + '\n'
				}
			}
		} else {
			var frontRecord = records[0]
			var backRecord = records[1]

			var plateNo = frontRecord.plateno
			var enterDate = frontRecord.enterdate
			var parking = frontRecord.parking

			if (moment(frontRecord.entertime, 'H:m:s').isAfter(moment(START, 'H:m:s')) && moment(backRecord.exittime, 'H:m:s').isBefore(moment(END, 'H:m:s'))) {
				var avlRange1 = moment(frontRecord.entertime, 'H:m:s').diff(moment(START, 'H:m:s'), 'minutes')
				var avlRange2 = moment(backRecord.entertime, 'H:m:s').diff(moment(frontRecord.exittime, 'H:m:s'), 'minutes')
				var avlRange3 = moment(END, 'H:m:s').diff(moment(backRecord.exittime, 'H:m:s'), 'minutes')
				avlRange1 = Math.ceil(avlRange1 / 60)
				avlRange2 = Math.ceil(avlRange2 / 60)
				avlRange3 = Math.ceil(avlRange3 / 60)
				recordsWithAvlRangeCSV += plateNo + ',' + enterDate + ',' + START + ',' + frontRecord.entertime + ',' + avlRange1 + ',' + parking + '\n'
				recordsWithAvlRangeCSV += plateNo + ',' + enterDate + ',' + frontRecord.exittime + ',' + backRecord.entertime + ',' + avlRange2 + ',' + parking + '\n'
				recordsWithAvlRangeCSV += plateNo + ',' + enterDate + ',' + backRecord.exittime + ',' + END + ',' + avlRange3 + ',' + parking + '\n'
			} else if (moment(frontRecord.entertime, 'H:m:s').isAfter(moment(START, 'H:m:s')) && moment(backRecord.exittime, 'H:m:s').isAfter(moment(END, 'H:m:s'))) {
				var avlRange1 = moment(frontRecord.entertime, 'H:m:s').diff(moment(START, 'H:m:s'), 'minutes')
				var avlRange2 = moment(backRecord.entertime, 'H:m:s').diff(moment(frontRecord.exittime, 'H:m:s'), 'minutes')
				avlRange1 = Math.ceil(avlRange1 / 60)
				avlRange2 = Math.ceil(avlRange2 / 60)
				recordsWithAvlRangeCSV += plateNo + ',' + enterDate + ',' + START + ',' + frontRecord.entertime + ',' + avlRange1 + ',' + parking + '\n'
				recordsWithAvlRangeCSV += plateNo + ',' + enterDate + ',' + frontRecord.exittime + ',' + backRecord.entertime + ',' + avlRange2 + ',' + parking + '\n'			
			} else if (moment(frontRecord.entertime, 'H:m:s').isBefore(moment(START, 'H:m:s')) && moment(backRecord.exittime, 'H:m:s').isBefore(moment(END, 'H:m:s'))) {
				var avlRange1 = moment(backRecord.entertime, 'H:m:s').diff(moment(frontRecord.exittime, 'H:m:s'), 'minutes')
				var avlRange2 = moment(END, 'H:m:s').diff(moment(backRecord.exittime, 'H:m:s'), 'minutes')
				avlRange1 = Math.ceil(avlRange1 / 60)
				avlRange2 = Math.ceil(avlRange2 / 60)
				recordsWithAvlRangeCSV += plateNo + ',' + enterDate + ',' + frontRecord.exittime + ',' + backRecord.entertime + ',' + avlRange1 + ',' + parking + '\n'
				recordsWithAvlRangeCSV += plateNo + ',' + enterDate + ',' + backRecord.exittime + ',' + END + ',' + avlRange2 + ',' + parking + '\n'														
			} else {
				var avlRange = moment(backRecord.entertime, 'H:m:s').diff(moment(frontRecord.exittime, 'H:m:s'), 'minutes')
				avlRange = Math.ceil(avlRange / 60)
				recordsWithAvlRangeCSV += plateNo + ',' + enterDate + ',' + frontRecord.exittime + ',' + backRecord.entertime + ',' + avlRange + ',' + parking + '\n'								
			}
		}
	}

	return recordsWithAvlRangeCSV
}

var getRecords = callback => {
	var connection = mysql.createConnection({
		host: 'localhost',
		port: 3306,
		user: 'q',
		password: 'cqgogogo',
		database: 'parking3'
	})

	connection.connect()

	var SQL = `
		SELECT
			plateno,
			DATE_FORMAT(enterdatetime, '%Y-%m-%d') AS enterdate,
			DATE_FORMAT(enterdatetime, '%H:%i:%s') AS entertime,
			DATE_FORMAT(exitdatetime, '%H:%i:%s') AS \`exittime\`,
			parking
		FROM
			splited_records
		WHERE
			(
				(
					(
						DAYOFWEEK(enterdatetime) != 7
						AND DAYOFWEEK(enterdatetime) != 1
					)
					AND DATE_FORMAT(enterdatetime, '%m-%d') NOT IN (
						'09-13',
						'09-14',
						'09-15',
						'10-01',
						'10-02',
						'10-03',
						'10-04',
						'10-05',
						'10-06',
						'10-07'
					)
				)
				OR DATE_FORMAT(enterdatetime, '%m-%d') IN ('09-29', '10-12')
			)
		AND (
			DATE_FORMAT(enterdatetime, '%H:%i:%s') <= '18:30:00'
			AND DATE_FORMAT(exitdatetime, '%H:%i:%s') >= '08:30:00'
			AND (
				DATE_FORMAT(enterdatetime, '%H:%i:%s') >= '08:30:00'
				OR DATE_FORMAT(exitdatetime, '%H:%i:%s') <= '18:30:00'
			)
		)
		ORDER BY
			parking,
			plateno,
			enterdatetime;
	`

	connection.query(SQL, function(error, results, fields) {
		if (error) return callback(error)

		connection.end()

		var records = JSON.parse(JSON.stringify(results))
		return callback(null, records)
	})
}

getRecords((error, records) => {
	if (error) {
		console.log(error)
	} else {
		var groupedDatas = groupByPlatenoAndDate(records)
		// console.log(JSON.stringify(groupedDatas))
		var recordsWithAvlRangeCSV = getAvlRange(groupedDatas)
		fs.writeFileSync('d:/github/data_handler/dist/avl_records.csv', recordsWithAvlRangeCSV)
	}
})