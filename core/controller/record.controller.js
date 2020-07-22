const recordService = require('../service/record.service')

exports.handleOrgData = (req, res) => {
	let fileBaseName = req.query.filename

	if (!fileBaseName) {
		return res.json({
			errcode: 2,
			errmsg: '文件名缺失'
		})
	}

	recordService.handleOrgDataInterval(fileBaseName, (error, result) => {
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
	recordService.splitRecordsInterval((error, result) => {
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

exports.calParkingDuration = (req, res) => {
	let start = req.query.start
	let end = req.query.end
console.log(start, end)
	if (!start || !end) {
		return res.json({
			errcode: 2,
			errmsg: '参数缺失'
		})
	}

	recordService.getSplitedRecordsInterval(start, end, (error, result) => {
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