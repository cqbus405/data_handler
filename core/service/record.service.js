const fs = require('fs')
const moment = require('moment')
const async = require('async')
const TX_ORG = require('../model/tx_org.model')
const TOTAL = require('../model/total.model')
const TOTAL_SPLIT = require('../model/total_split.model')
const PARKING_RECORDS = require('../index/parking_records.index')
const TOTAL_DURATION = require('../model/total_duration.model')

exports.handleOrgData = (fileName, callback) => {
	TX_ORG.get(fileName, (error, records) => {
		if (error) return callback(error)

		let platenoMap = {}
		let inAndOutRecord = []

		let jsonRecord = JSON.parse(JSON.stringify(records))

		jsonRecord.forEach(record => {
			let plateNo = record.plateno
			let owner = record.owner
			let enterOrExitTime = moment(record.enterorexittime).format('YYYY-M-D HH:mm:ss')
			let enterOrExit = record.enterorexit
			let parking = record.parking

			if (platenoMap[plateNo] === undefined) {
				if (enterOrExit === '进') {
					inAndOutRecord.push({
						plateno: plateNo,
						owner,
						entertime: enterOrExitTime,
						exittime: '',
						enterorexit: enterOrExit,
						parking
					})
				} else {
					inAndOutRecord.push({
						plateno: plateNo,
						owner,
						entertime: '',
						exittime: enterOrExitTime,
						enterorexit: enterOrExit,
						parking
					})
				}

				platenoMap[plateNo] = 1
			} else {
				let lastRecord = inAndOutRecord[inAndOutRecord.length - 1]
				let lastInOrOut = lastRecord.enterorexit

				if (lastInOrOut === '进' && enterOrExit === '出') {
					lastRecord.exittime = enterOrExitTime
				} else if (lastInOrOut === '出' && enterOrExit === '进') {
					inAndOutRecord.push({
						plateno: plateNo,
						owner,
						entertime: enterOrExitTime,
						exittime: '',
						enterorexit: enterOrExit,
						parking
					})
				} else if (lastInOrOut === '进' && enterOrExit === '进') {
					inAndOutRecord.push({
						plateno: plateNo,
						owner,
						entertime: enterOrExitTime,
						exittime: '',
						enterorexit: enterOrExit,
						parking
					})
				} else if (lastInOrOut === '出' && enterOrExit === '出') {
					inAndOutRecord.push({
						plateno: plateNo,
						owner,
						entertime: '',
						exittime: enterOrExitTime,
						enterorexit: enterOrExit,
						parking
					})
				}
			}
		})

		let output = 'plateno,owner,entertime,exittime,parking\n'

		inAndOutRecord.forEach(record => {
			let plateNo = record.plateno
			let owner = record.owner
			let enterTime = record.entertime
			let exitTime = record.exittime
			let parking = record.parking

			output += plateNo + ',' + owner + ',' + enterTime + ',' + exitTime + ',' + parking + '\n'
		})

		fs.writeFile(`d:/github/data_handler/dist/${fileName}.csv`, output, error => {
			if (error) return callback(error, null)

			return callback(null, 1)
		})
	})
}

exports.splitRecords = callback => {
	TOTAL.get((error, records) => {
		if (error) return callback(error, null)

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

		let output = 'plateno,owner,enterdate,enter,exit,entertime,exittime,parking\n'

		splitedRecords.forEach(record => {
			let plateNo = record.plateno
			let owner = record.owner
			let enterdate = record.enterdate
			let enter = record.enter
			let exit = record.exit
			let enterTime = record.entertime
			let exitTime = record.exittime
			let parking = record.parking

			output += plateNo + ',' + owner + ',' + enterdate + ',' + enter + ',' + exit + ',' + enterTime + ',' + exitTime + ',' + parking + '\n'
		})

		fs.writeFile('d:/github/data_handler/dist/total_split.csv', output, error => {
			if (error) return callback(error, null)

			return callback(null, 1)
		})
	})
}

exports.calcParkingDuration = (start, end, callback) => {
	TOTAL_SPLIT.get(start, end, (error, records) => {
		if (error) return callback(error, null)

		let jsonRecords = JSON.parse(JSON.stringify(records))

		let rdsWithPkgDurt = calcParkingDurationInterval(start, end, jsonRecords)

		let output = 'plateno,owner,entertime,exittime,duration,parking\n'

		rdsWithPkgDurt.forEach(record => {
			output += record.plateno + ',' + record.owner + ',' + record.entertime + ',' + record.exittime + ',' + record.parkingduration + ',' + record.parking + '\n'
		})
		
		fs.writeFile('d:/github/data_handler/dist/total_duration.csv', output, error => {
			if (error) return callback(error, null)

			return callback(null, 1)
		})		
	})
}

const calcParkingDurationInterval = (start, end, records) => {
	records.forEach(record => {
		let enter = record.entertime
		let exit = record.exittime

		let currentDate = moment(enter).format('YYYY-MM-DD')
		let startTime = moment(start).format('HH:mm:ss')
		let endTime = moment(end).format('HH:mm:ss')

		let enterMoment = moment(enter)
		let exitMoment = moment(exit)
		let startMoment = moment(currentDate + ' ' + startTime)
		let endMoment = moment(currentDate + ' ' + endTime)

		let parkingDuration = 0

		if (exitMoment.isSameOrBefore(startMoment) || enterMoment.isSameOrAfter(endMoment)) { // 1、2
			parkingDuration = 0
		} else if (enterMoment.isSameOrBefore(startMoment) && exitMoment.isSameOrAfter(endMoment)) { // 6
			parkingDuration = endMoment.diff(startMoment, 'minutes')
		} else if (enterMoment.isSameOrBefore(startMoment) && (exitMoment.isSameOrBefore(endMoment) && exitMoment.isSameOrAfter(startMoment))) { // 3
			parkingDuration = exitMoment.diff(startMoment, 'minutes')
		} else if (enterMoment.isSameOrAfter(startMoment) && exitMoment.isSameOrBefore(endMoment)) { // 4
			parkingDuration = exitMoment.diff(enterMoment, 'minutes')
		} else { // 5
			parkingDuration = endMoment.diff(enterMoment, 'minutes')
		}

		record.parkingduration = parkingDuration
	})

	return [...records]
}

exports.getFreeParkingDuration = (start, end, callback) => {
	async.waterfall([
		callback => {
			TOTAL_SPLIT.get(start, end, (error, records) => {
				if (error) return callback(error)

				let splitedRecords = JSON.parse(JSON.stringify(records))

				return callback(null, splitedRecords)
			})
		},
		(splitedRecords, callback) => {
			let rdsWithPkgDurt = calcParkingDurationInterval(start, end, splitedRecords)
			callback(null, rdsWithPkgDurt)
		},
		(rdsWithPkgDurt, callback) => {
			let plateNoParkingRecordsMap = {}

			rdsWithPkgDurt.forEach(record => {
				let plateNo = record.plateno
				let enterDate = moment(record.entertime).format('YYYY-MM-DD')
				let mapKey = plateNo + '_' + enterDate

				let parkingRecords = plateNoParkingRecordsMap[mapKey]

				if (parkingRecords === undefined) {
					plateNoParkingRecordsMap[mapKey] = []
					plateNoParkingRecordsMap[mapKey].push(record)
				} else {
					parkingRecords.push(record)
				}
			})

			return callback(null, plateNoParkingRecordsMap)
		}, 
		(plateNoParkingRecordsMap, callback) => {	
			let combinedRecords = []

			const startDate = moment(start).format('YYYY-MM-DD')
			const endMoment = moment(startDate + ' ' + moment(end).format('HH:mm:ss'))
			const startMoment = moment(start)

			const totalDuration = endMoment.diff(startMoment, 'minutes')

			for (let key in plateNoParkingRecordsMap) {
				let records = plateNoParkingRecordsMap[key]

				let recordsLength = records.length

				if (recordsLength === 1) {
					combinedRecords.push(Object.assign({}, records[0], {
						available: totalDuration - records[0].parkingduration,
						percentage: parseFloat((((totalDuration - records[0].parkingduration) / totalDuration) * 100).toFixed(2))
					}))

					continue
				} 

				let theSumOfDuration = 0

				for (let i = 0; i < records.length; ++i) {
					let record = records[i]
					let duration = record.parkingduration

					if (duration === totalDuration) {
						combinedRecords.push(Object.assign({}, record, {
							available: 0,
							percentage: 0
						}))
						break
					}

					theSumOfDuration += duration
				}

				combinedRecords.push(Object.assign({}, records[0], {
					parkingduration: theSumOfDuration,
					available: totalDuration - theSumOfDuration,
					percentage: parseFloat((((totalDuration - theSumOfDuration) / totalDuration) * 100).toFixed(2))
				}))	
			}

			return callback(null, combinedRecords)
		}
	], (error, result) => {
		if (error) return callback(error, null)

		let output = 'plateno,owner,entertime,exittime,parking,parkingduration,available,percentage\n'

		result.forEach(item => {
			output += item.plateno + ',' + item.owner + ',' + item.entertime + ',' + item.exittime + ',' + item.parking + ',' + item.parkingduration + ',' + item.available + ',' + item.percentage + '\n'
		})

		fs.writeFile('d:/github/data_handler/dist/final.csv', output, error => {
			if (error) return callback(error, null)

			return callback(null, 1)
		})	
	})
}

exports.getAvailablePercentage = async (start, end, interval, parking, callback) => {
	const sampleDate = '2019-01-01'
	
	const startTime = moment(start).format('HH:mm:ss')	
	const endTime = moment(end).format('HH:mm:ss')

	const totalDate = moment(end).diff(moment(start), 'd')
	const totalTime = moment(sampleDate + ' ' + endTime).diff(moment(sampleDate + ' ' + startTime), 'm')

	let counts = []
	for (let i = 0; i <= totalDate; ++i) {
		let currentDate = moment(start).add(i, 'd').format('YYYY-MM-DD')

		for (let j = 0; j < totalTime / interval; ++j) {

			let frontTime = moment(moment(currentDate + ' ' + startTime).add(j * interval, 'm')).format('HH:mm:ss')
			let nextTime = moment(moment(currentDate + ' ' + startTime).add((j + 1) * interval, 'm')).format('HH:mm:ss')

			if (j === parseInt(totalTime / interval) && totalTime % interval != 0) {
				nextTime = endTime
			}

			//for循环中执行sql语句效率低，需要调整优化
			let num = await TOTAL_SPLIT.getByStartEndDateParkingAsync(frontTime, nextTime, currentDate, parking)
			
			counts.push(num[0].num)

			// console.log(currentDate, frontTime + '-' + nextTime, num[0].num)	
		}
	}

	return callback(counts)
}

exports.getAvailablePercentageByES = async (startDate, endDate, startTime, endTime, parking, callback) => {
	const sampleDate = '2019-01-01'

	const totalDate = moment(endDate + ' 00:00:00').diff(moment(startDate + ' 00:00:00'), 'd')
	const totalTime = moment(sampleDate + ' ' + endTime).diff(moment(sampleDate + ' ' + startTime), 'm')

	let dates = []
	let datas = []

	for (let i = 0; i < totalDate; ++i) {
		let currentDate = moment(startDate + ' 00:00:00').add(i, 'd').format('YYYY-MM-DD')

		for (let j = 0; j < totalTime; ++j) {
			let frontTime = moment(moment(currentDate + ' ' + startTime).add(j, 'm')).format('HH:mm:ss')
			let nextTime = moment(moment(currentDate + ' ' + startTime).add(j + 1, 'm')).format('HH:mm:ss')

			let result = await PARKING_RECORDS.getParkingCount(currentDate, frontTime, nextTime, parking)

			dates.push(currentDate + ' ' + frontTime)
			datas.push(result.body.count)
			console.log(currentDate + ' ' + frontTime, result.body.count)
		}
	}

	return callback(dates, datas)
}