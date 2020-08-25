var moment = require('moment')
var mysql = require('mysql')
var PARKING_RECORDS = require('../core/index/parking_records.index')
var fs = require('fs')

var files = fs.readdirSync('d:/github/data_handler/dist')
files.forEach(file => {
	if (file === 'es_records.csv') {
		fs.unlinkSync('d:/github/data_handler/dist/' + file)
	}
})

var getParkings = callback => {
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'q',
		password: 'cqgogogo',
		database: 'parking3'
	})

	connection.connect()

	var SQL = "SELECT parking FROM splited_records GROUP BY parking;"

	connection.query(SQL, function(error, results, fields) {
		if (error) return callback(error)

		connection.end()

		var parkings = JSON.parse(JSON.stringify(results))
		return callback(null, parkings)
	})
}

var getAvailablePercentageByES = async (startDate, endDate, startTime, endTime, parking) => {
	const sampleDate = '2019-01-01'

	const totalDate = moment(endDate + ' 00:00:00').diff(moment(startDate + ' 00:00:00'), 'd')
	const totalTime = moment(sampleDate + ' ' + endTime).diff(moment(sampleDate + ' ' + startTime), 'm')

	let output = ''

	for (let i = 0; i < totalDate; ++i) {
		let currentDate = moment(startDate + ' 00:00:00').add(i, 'd').format('YYYY-MM-DD')

		for (let j = 0; j < totalTime; ++j) {
			let frontTime = moment(moment(currentDate + ' ' + startTime).add(j, 'm')).format('HH:mm:ss')
			let nextTime = moment(moment(currentDate + ' ' + startTime).add(j + 1, 'm')).format('HH:mm:ss')
			let result = await PARKING_RECORDS.getParkingCount(currentDate, frontTime, nextTime, parking)

			output += currentDate + ',' + frontTime + ',' + result.body.count + ',' + parking + '\n'
		}
	}

	fs.writeFileSync('d:/github/data_handler/dist/' + parking + '_es.csv', output)
	console.log(parking + '_es.csv', 'Done!')
}

var calCount = () => {
	getParkings((error, parkings) => {
		if (error) {
			console.log(error)
		} else {
			parkings.forEach(async parking => {
				if (parking.parking === 'cfy1') {
					// await getAvailablePercentageByES('2020-03-01', '2020-07-31', '00:00:00', '23:59:59', 'cfy1')
				} else if (parking.parking === 'cfy3') {
					// await getAvailablePercentageByES('2020-03-01', '2020-07-31', '00:00:00', '23:59:59', 'cfy3')
				} else {
					// await getAvailablePercentageByES('2019-08-01', '2019-12-31', '00:00:00', '23:59:59', parking.parking)
				}			
			})

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
}

var combineSplitedFiles = (filePath, idx) => {
	var content = fs.readFileSync(filePath, 'utf-8')
	var fileContent = ''

	if (idx === 0) {
		fileContent += 'date,time,count,parking\n' + content
	} else {
		fileContent = content
	}

	fs.appendFileSync('d:/github/data_handler/dist/es_records.csv', fileContent)
}

calCount()