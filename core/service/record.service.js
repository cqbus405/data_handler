const fs = require('fs')
const moment = require('moment')
const TX_ORG = require('../model/tx_org.model')
const TOTAL = require('../model/total.model')

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
				splitedRecords.push(record)
			} else {
				let enterTime = record.entertime

				let enterDate = moment(enterTime).format('YYYY-M-D')

				let newRecord = {
					plateNo: record.plateno,
					owner: record.owner,
					entertime: enterTime,
					exittime: record.exittime,
					parking: record.parking
				}

				for (let i = 0; i < diff + 1; ++i) {
					if (i === 0) {
						newRecord.exittime = enterDate + ' 23:59:59'
					} else if (i === diff) {
						
					} else {

					}
				}
			}


		})

		return callback(null, )
	})
}