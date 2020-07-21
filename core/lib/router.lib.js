const controller = require('./controller.lib')

const setRouter = app => {

	app.get('/record/handleOrgData', controller.record.handleOrgData)

	app.get('/record/split', controller.record.splitRecords)

}

module.exports = setRouter
