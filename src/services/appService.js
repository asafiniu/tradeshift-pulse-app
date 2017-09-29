function AppService($http) {
	const service = {};

	/*
	 * get latest TS events
	 */
	service.getEventsSSE = function(fromDate, callback) {
		var source = new EventSource(`/events/from/${new Date(fromDate).toISOString()}`);
		source.onmessage = function (event) {
			callback(event.data);
		};
	};

	return service;
}

module.exports = ['$http', AppService];
