
var fakeRecords = [{
	plateno: '京JAH122',	
	enterdate: '2020-06-03',	
	entertime: '10:24:00',	
	exittime: '14:29:00',	
	parking: 'cfy1'
}, {
	plateno: '京JAH122',
	enterdate: '2020-06-03',	
	entertime: '16:35:00',	
	exittime: '21:17:00',	
	parking: 'cfy1'
}, {
	plateno: '京JAH122',	
	enterdate: '2020-06-04',	
	entertime: '10:08:00',	
	exittime: '21:34:00',	
	parking: 'cfy1'
}, {
	plateno: '京JAH122',	
	enterdate: '2020-06-05',	
	entertime: '10:46:00',	
	exittime: '12:56:00',	
	parking: 'cfy1'
}, {
	plateno: '京JAH122',	
	enterdate: '2020-06-05',	
	entertime: '13:47:00',	
	exittime: '17:32:00',	
	parking: 'cfy1'
}, {
	plateno: '京JAH122',	
	enterdate: '2020-06-08',	
	entertime: '09:37:00',	
	exittime: '21:24:00',	
	parking: 'cfy1'
}, {
	plateno: '京JAH122',	
	enterdate: '2020-06-11',	
	entertime: '09:42:00',	
	exittime: '21:30:00',	
	parking: 'cfy1'
}, {
	plateno: '京JAH122',	
	enterdate: '2020-06-15',	
	entertime: '10:22:00',	
	exittime: '21:30:00',	
	parking: 'cfy1'
}, {
	plateno: '京JAH122',	
	enterdate: '2020-06-16',	
	entertime: '10:21:00',	
	exittime: '19:34:00',	
	parking: 'cfy1'
}, {
	plateno: '京JAH122',	
	enterdate: '2020-06-18',	
	entertime: '13:42:00',	
	exittime: '21:46:00',	
	parking: 'cfy1'
}, {
	plateno: '京JAH122',	
	enterdate: '2020-06-19',	
	entertime: '10:17:00',	
	exittime: '21:42:00',	
	parking: 'cfy1'
}, {
	plateno: '京JAH122',	
	enterdate: '2020-06-22',	
	entertime: '13:57:00',	
	exittime: '18:40:00',	
	parking: 'cfy1'
}, {
	plateno: '京JAH122',	
	enterdate: '2020-06-24',	
	entertime: '11:14:00',	
	exittime: '21:33:00',	
	parking: 'cfy1'
}, {
	plateno: '京JAH122',	
	enterdate: '2020-06-29',	
	entertime: '10:40:00',	
	exittime: '17:11:00',	
	parking: 'cfy1'
}]

var groupByPlatenoAndDate = records => {
	var groupedDatas = {}
	records.forEach(record => {
		var plateno = record.plateno
		var enterdate = record.enterdate
		var key = plateno + '_' + enterdate
		var isExists = groupedDatas.hasOwnProperty(key)
		if (!isExists) groupedDatas[key] = new Array()
		groupedDatas[key].push(record)
	})
	return groupedDatas
}

var getAvlRange = groupedDatas => {
	var START = '08:30:00'
	var END = '18:30:00'
	for (var key in groupedDatas) {
		var records = groupedDatas[key]
		var lenOfRecords = length(records)
		if (lenOfRecords === 1) {
			var record = records[0]
			var enterTime = record.entertime
			var exitTime = record.exittime
			if () {

			} else if () {

			} else {
				
			}
		} else {

		}
	}
}

var groupedDatas = groupByPlatenoAndDate(fakeRecords)

getAvlRange(groupedDatas)