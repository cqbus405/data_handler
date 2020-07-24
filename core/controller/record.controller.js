const moment = require('moment')
const recordService = require('../service/record.service')

exports.handleOrgData = (req, res) => {
	let fileBaseName = req.query.filename

	if (!fileBaseName) {
		return res.json({
			errcode: 2,
			errmsg: '文件名缺失'
		})
	}

	recordService.handleOrgData(fileBaseName, (error, result) => {
		if (error) {
			return res.json({
				errcode: 1,
				errmsg: error
			})
		}

		return res.json({
			errcode: 0,
			errmsg: 'ok'
		})
	})
}

exports.splitRecords = (req, res) => {
	recordService.splitRecords((error, result) => {
		if (error) {
			return res.json({
				errcode: 1,
				errmsg: error
			})
		}

		return res.json({
			errcode: 0,
			errmsg: 'ok'
		})
	})
}

exports.calcParkingDuration = (req, res) => {
	let start = req.query.start
	let end = req.query.end

	if (!start || !end) {
		return res.json({
			errcode: 2,
			errmsg: '参数缺失'
		})
	}

	recordService.calcParkingDuration(start, end, (error, result) => {
		if (error) {
			return res.json({
				errcode: 1,
				errmsg: error
			})
		}

		return res.json({
			errcode: 0,
			errmsg: 'ok'
		})
	})
}

exports.freeParkingDuration = (req, res) => {
	let start = req.query.start
	let end = req.query.end

	if (!start || !end) {
		return res.json({
			errcode: 2,
			errmsg: '参数缺失'
		})
	}

	recordService.getFreeParkingDuration(start, end, (error, rdsWithFreePkgDurt) => {
		if (error) return res.json({
			errcode: 1,
			errmsg: error
		})

		return res.json({
			errcode: 0,
			errmsg: 'ok',
			data: rdsWithFreePkgDurt
		})
	}) 
}

exports.availablePercentage = async (req, res) => {
	const start = req.query.start
	const end = req.query.end
	const parking = req.query.parking
	const interval = parseInt(req.query.interval)

	await recordService.getAvailablePercentage(start, end, interval, parking, counts => {
		return res.json({
			errmsg: 'ok',
			data: {
				arr: counts,
				num: counts.length
			}
		})
	})
}