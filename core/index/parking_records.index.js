const esClient = require('../lib/elasticsearch.lib')

exports.getParkingCount = async (enterDate, frontTime, nextTime, parking) => {
	let body = {
		"query": {
	    "bool": {
	      "filter": [{
          "term": {
            "parking": parking
          }
        }, {
          "term": {
            "enterdate": enterDate
          }
        }, {
          "range": {
            "enter": {
              "lte": frontTime,
              "format": "HH:mm:ss"
            }
          }
        }, {
          "range": {
            "exit": {
              "gte": nextTime,
              "format": "HH:mm:ss"
            }
          }
        }]
	    }
	  }		
	}

	const result = await esClient.count({
		index: 'parking_records',
		body
	})

	return result
}