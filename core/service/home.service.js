const async = require('async')
const TOTAL = require('../model/total.model')

exports.getHomePageDatas = callback => {
	async.parallel({
		parkings: callback => {
			TOTAL.getParkingList((error, parkingList) => {
				if (error) return callback(error)
				let jsonParkingList = JSON.parse(JSON.stringify(parkingList))

				let parkings = []

				jsonParkingList.forEach(item => {
					let parkingCode = item.parking
					let parkingName
					switch (parkingCode) {
						case 'ljxj':
							parkingName = '两江新界'
							break

						case 'tx':
							parkingName = '土星'
							break

						case 'yxgc':
							parkingName = '渝兴广场'
							break

						default:
							parkingName = ''
					}

					parkings.push({
						parkingCode,
						parkingName
					})
				})

				return callback(null, parkings)
			})
		}
	}, (error, results) => {
		if (error) return callback(error)
		return callback(null, results)
	})
}