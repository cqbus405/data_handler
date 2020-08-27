$(document).ready(function() {
	var parkingOption = $("#select-parking");
	// var inputStartDate = $("#input-start-date");
	// var inputEndDate = $("#input-end-date");
	// var inputStartTime = $("#input-start-time");
	// var inputEndTime = $("#input-end-time");
	var buttonSearch = $("#button-search");

	var spinner = $("#spinner");

	buttonSearch.click(function() {
		parking = parkingOption.val();
		// inputStartDateValue = inputStartDate.val();
		// inputEndDateValue = inputEndDate.val();
		// inputStartTimeValue = inputStartTime.val();
		// inputEndTimeValue = inputEndTime.val();

		// if (!inputStartDateValue || !inputEndDateValue || !inputStartTimeValue || !inputEndTimeValue) {
		// 	alert("日期和时间必填");
		// 	return;
		// }

		// inputStartTimeValue += ":00";
		// inputEndTimeValue += ":00";

		// if (!checkDate(inputStartDateValue, inputEndDateValue)) {
		// 	alert("结束日期不能小于开始日期");
		// 	return;
		// }

		// if (!checkTime(inputStartTimeValue, inputEndTimeValue)) {
		// 	alert("结束时间必须大于开始时间");
		// 	return;
		// }

		// console.log({
		// 	parking,
		// 	inputStartDateValue,
		// 	inputEndDateValue,
		// 	inputStartTimeValue,
		// 	inputEndTimeValue
		// });

		var echartsInstance = echarts.init(document.getElementById('main'));

		var url = `http://183.66.213.82:3003/record/avlPacByES?parking=${parking}`;
		
		// console.log(url);

		spinner.css("display", "block");

		$.ajax({
			url,
			dataType: "json",
			timeout: 12000,
			success: function(result) {
				spinner.css("display", "none");

				var datas = result.data.datas;
				var dates = result.data.dates;
				var total = result.data.total;

				echartsInstance.setOption({
					tooltip: {
		        trigger: 'axis',
		        position: function (pt) {
		          return [pt[0], '10%'];
		        }
			    },
			    title: {
		        left: 'center',
		        text: '统计结果',
			    },
			    xAxis: {
		        type: 'category',
		        boundaryGap: false,
		        data: dates
			    },
			    yAxis: {
		        type: 'value',
		        boundaryGap: [0, '100%']
			    },
			    dataZoom: [{
		        type: 'inside',
		        start: 0,
		        end: 10
			    }, {
		        start: 0,
		        end: 10,
		        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
		        handleSize: '80%',
		        handleStyle: {
	            color: '#fff',
	            shadowBlur: 3,
	            shadowColor: 'rgba(0, 0, 0, 0.6)',
	            shadowOffsetX: 2,
	            shadowOffsetY: 2
		        }
			    }],
			    series: [{
			    	type: 'line',
            name: '车位占用量',
            smooth: true,
            symbol: 'none',
            sampling: 'average',
            itemStyle: {
              color: 'rgb(255, 70, 131)'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgb(255, 158, 68)'
              }, {
                offset: 1,
                color: 'rgb(255, 70, 131)'
              }])
            },
            data: datas
			    },{
			    	type: 'line',
			    	name: '固定车位总量',
			    	smooth: true,
			    	symbol: 'none',
            sampling: 'average',
			    	data: total
			    }]
				})
			}
		})
	});
});

// function checkDate(inputStartDateValue, inputEndDateValue) {
// 	var startDate = new Date(inputStartDateValue.replace("-", "/").replace("-", "/"));
// 	var endDate = new Date(inputEndDateValue.replace("-", "/").replace("-", "/"));
// 	if (endDate < startDate) {
// 		return false;
// 	}
// 	return true;
// }

// function checkTime(startTime, endTime) {
//   var starArr = startTime.split(':');
// 	var endArr = endTime.split(':');
	 
// 	if (starArr[0] > endArr[0]) {
// 		return false;
// 	}

// 	if (starArr[0] == endArr[0]) {
// 		if (starArr[1] > endArr[1]) {
// 			return false;
// 		}

// 		if (starArr[1] == endArr[1]) {
// 			if (starArr[2] >= endArr[2]) {
// 				return false;
// 			}
// 		}
// 	}

// 	return true;
// }