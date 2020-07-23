const controller = require('./controller.lib')

const setRouter = app => {
	app.get('/record/handleOrgData', controller.record.handleOrgData)
	app.get('/record/split', controller.record.splitRecords)
	app.get('/record/duration', controller.record.calcParkingDuration)
	app.get('/record/freeParkingDuration', controller.record.freeParkingDuration)
}

module.exports = setRouter