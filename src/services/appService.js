function AppService($http) {
	const service = {};

	/*
	 * get latest TS events
	 */
	service.getEvents = function(fromDate) {
		return $http.get(`/events/from/${new Date(fromDate).toISOString()}`);
	};

	service.getEventsSSE = function(fromDate, callback) {
		var source = new EventSource(`/events/from/${new Date(fromDate).toISOString()}`);
		source.onmessage = function (event) {
			console.log(JSON.stringify(event, null, 4));
			callback(event.data);
		};
	};

	// DEBUG
	service.checkDirect = function(fromDate) {
		return $http.get(`http://10.128.10.248:8080/events?lastseen=${fromDate}`);
	}

	return service;
}

module.exports = ['$http', AppService];
