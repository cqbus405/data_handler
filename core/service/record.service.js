const fs = require('fs')
const moment = require('moment')
const TX_ORG = require('../model/tx_org.model')
const TOTAL = require('../model/total.model')
const TOTAL_SPLIT = require('../model/total_split.model')

exports.handleOrgDataInterval = (fileName, callback) => {
	TX_ORG.get(fileName, (error, records) => {
		if (error) return callback(error)

		let platenoMap = {}
		let inAndOutRecord = []

		let jsonRecord = JSON.parse(JSON.stringify(records))

		jsonRecord.forEach(record => {
			let plateNo = record.plateno
			let carType = record.cartype
			let owner = record.owner
			let enterOrExitTime = moment(record.enterorexittime).format('YYYY-M-D HH:mm:ss')
			let enterOrExit = record.enterorexit

			if (platenoMap[plateNo] === undefined) {
				if (enterOrExit === '进') {
					inAndOutRecord.push({
						plateno: plateNo,
						cartype: carType,
						owner,
						entertime: enterOrExitTime,
						exittime: '',
						enterorexit: enterOrExit
					})
				} else {
					inAndOutRecord.push({
						plateno: plateNo,
						cartype: carType,
						owner,
						entertime: '',
						exittime: enterOrExitTime,
						enterorexit: enterOrExit
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
						cartype: carType,
						owner,
						entertime: enterOrExitTime,
						exittime: '',
						enterorexit: enterOrExit
					})
				} else if (lastInOrOut === '进' && enterOrExit === '进') {
					inAndOutRecord.push({
						plateno: plateNo,
						cartype: carType,
						owner,
						entertime: enterOrExitTime,
						exittime: '',
						enterorexit: enterOrExit
					})
				} else if (lastInOrOut === '出' && enterOrExit === '出') {
					inAndOutRecord.push({
						plateno: plateNo,
						cartype: carType,
						owner,
						entertime: '',
						exittime: enterOrExitTime,
						enterorexit: enterOrExit
					})
				}
			}
		})

		let output = 'plateno,cartype,owner,entertime,exittime,parking\n'

		inAndOutRecord.forEach(record => {
			let plateNo = record.plateno
			let carType = record.cartype
			let owner = record.owner
			let enterTime = record.entertime
			let exitTime = record.exittime
			let parking = fileName

			output += plateNo + ',' + carType + ',' + owner + ',' + enterTime + ',' + exitTime + ',' + parking + '\n'
		})

		fs.writeFile(`d:/github/data_handler/dist/${fileName}.csv`, output, error => {
			if (error) return callback(error, null)

			return callback(null, 1)
		})
	})
}

exports.splitRecordsInterval = callback => {
	TOTAL.get((error, records) => {
		if (error) return callback(error, null)

		let jsonRecords = JSON.parse(JSON.stringify(records))

		let splitedRecords = []

		jsonRecords.forEach(record => {
			let diff = record.diff

			if (diff === 0) {
				record.entertime = moment(record.entertime).format()
				record.exittime = moment(record.exittime).format()
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
							entertime: moment(enterTime).format(),
							exittime: moment(enterDate + ' 23:59:59').format()
						})
					} else if (i === diff) {
						newRecord = Object.assign({}, record, {
							entertime: moment(exitDate + ' 00:00:00').format(),
							exittime: moment(exitTime).format()
						})
					} else {
						newRecord = Object.assign({}, record, {
							entertime: moment(moment(enterTime).add(i, 'd').format(dateFormat) + ' 00:00:00').format(),
							exittime: moment(moment(enterTime).add(i, 'd').format(dateFormat) + ' 23:59:59').format()
						})
					}

					splitedRecords.push(newRecord)
				}
			}
		})

		let output = 'plateno,owner,entertime,exittime,parking\n'

		splitedRecords.forEach(record => {
			let plateNo = record.plateno
			let owner = record.owner
			let enterTime = record.entertime
			let exitTime = record.exittime
			let parking = record.parking

			output += plateNo + ',' + owner + ',' + enterTime + ',' + exitTime + ',' + parking + '\n'
		})

		fs.writeFile('d:/github/data_handler/dist/total_split.csv', output, error => {
			if (error) return callback(error, null)

			return callback(null, 1)
		})
	})
}

exports.getSplitedRecordsInterval = (start, end, callback) => {
	TOTAL_SPLIT.get(start, end, (error, records) => {
		if (error) return callback(error, null)

		let jsonRecords = JSON.parse(JSON.stringify(records))

		let output = 'plateno,owner,entertime,exittime,duration,parking\n'

		jsonRecords.forEach(record => {

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

			if (exitMoment.isSameOrBefore(startMoment) || enterMoment.isSameOrAfter(endMoment)) {
				parkingDuration = 0
			} else if (enterMoment.isSameOrBefore(startMoment) && exitMoment.isSameOrAfter(endMoment)) {
				parkingDuration = endMoment.diff(startMoment, 'minutes')
			} else if (enterMoment.isSameOrBefore(startMoment) && (startMoment.isSameOrBefore(exitMoment) && endMoment.isSameOrAfter(exitMoment))) {
				parkingDuration = exitMoment.diff(startMoment, 'minutes')
			} else if (enterMoment.isSameOrAfter(startMoment) && exitMoment.isSameOrBefore(endMoment)) {
				parkingDuration = exitMoment.diff(enterMoment, 'minutes')
			} else {
				parkingDuration = endMoment.diff(startMoment, 'minutes')
			}

			output += record.plateno + ',' + record.owner + ',' + record.entertime + ',' + record.exittime + ',' + parkingDuration + ',' + record.parking + '\n'
		})

		fs.writeFile('d:/github/data_handler/dist/total_duration.csv', output, error => {
			if (error) return callback(error, null)

			return callback(null, 1)
		})		
	})
}