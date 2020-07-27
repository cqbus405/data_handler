const controller = require('./controller.lib')

const setRouter = app => {
	app.get('/', controller.home.homepage)
	app.get('/record/handleOrgData', controller.record.handleOrgData)
	app.get('/record/split', controller.record.splitRecords)
	app.get('/record/duration', controller.record.calcParkingDuration)
	app.get('/record/freeParkingDuration', controller.record.freeParkingDuration)
	app.get('/record/avlPct', controller.record.availablePercentage)
	app.get('/record/avlPacByES', controller.record.availablePercentageByES)
}

module.exports = setRouter