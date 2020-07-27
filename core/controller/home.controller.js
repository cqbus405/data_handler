const homeService = require('../service/home.service')

exports.homepage = (req, res) => {
	homeService.getHomePageDatas((error, datas) => {
		return res.render('index', {
			title: '车位使用情况统计',
			parkings: datas.parkings,
			error: error
		})
	})
}