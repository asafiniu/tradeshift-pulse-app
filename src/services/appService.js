function AppService($http) {
	const service = {};

	/*
	 * get latest TS events
	 */
	service.getEvents = function(fromDate) {
		return $http.get(`/events/from/${new Date(fromDate).toISOString()}`);
	};

	// DEBUG
	service.checkDirect = function(fromDate) {
		return $http.get(`http://10.128.10.248:8080/events?lastseen=${fromDate}`);
	}

	return service;
}

module.exports = ['$http', AppService];
