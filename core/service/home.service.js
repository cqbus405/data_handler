const async = require('async')
const PARKING = require('../model/parking.model')

exports.getHomePageDatas = callback => {
	async.parallel({
		parkings: callback => {
			PARKING.getParkings((error, parkingList) => {
				if (error) return callback(error)
				let jsonParkingList = JSON.parse(JSON.stringify(parkingList))
				return callback(null, jsonParkingList)
			})
		}
	}, (error, results) => {
		if (error) return callback(error)
		return callback(null, results)
	})
}