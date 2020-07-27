const esClient = require('../lib/elasticsearch.lib')

exports.getParkingCount = async (enterDate, frontTime, nextTime, parking) => {
	const result = await esClient.count({
		index: 'parking_records',
		body: {
		  "query": {
		    "bool": {
		      "filter": [
		        {
		          "term": {
		            "parking": parking
		          }
		        },
		        {
		          "term": {
		            "enterdate": enterDate
		          }
		        },
		        {
		          "range": {
		            "enter": {
		              "lte": frontTime,
		              "format": "HH:mm:ss"
		            }
		          }
		        },
		        {
		          "range": {
		            "exit": {
		              "gte": nextTime,
		              "format": "HH:mm:ss"
		            }
		          }
		        }
		      ]
		    }
		  }
		}
	})

	return result
}