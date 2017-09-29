function AppService($http) {
	const service = {};

	/*
	 * get latest TS events
	 */
	service.getEvents = function(fromDate) {
		return $http.get(`/events/from/${new Date(fromDate).toISOString()}`);
	};

	return service;
}

module.exports = ['$http', AppService];
