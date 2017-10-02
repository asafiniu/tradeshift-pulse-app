'use strict';

const POLL_TIMEOUT = 1000;

function AppController(EventsService, MockEventsService, OdometerService, MapService, $scope) {

	var lastTimeStamp = new Date();

	function pad(num) {
		var strNum = num.toString();
		return strNum.length == 1 ? ("0" + strNum) : strNum;
	}

	$scope.error = function(msg) {
		$scope.errorMessage = msg;
	};

	var now = new Date();
	$scope.currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
	EventsService.getEventsSSE(lastTimeStamp, function(data) {
		var jsonData = {};
		var error = '';
		try {
			jsonData = JSON.parse(data);
		} catch (e) {
			jsonData = {};
		}

		if (jsonData && jsonData.volume) {
			OdometerService.addVolume(jsonData.volume);
			MapService.publish([jsonData]);
		} else {
			$scope.error(error);
		}
	});
	// MockEventsService.startEventStream((events) => {
	// 	events.forEach((event) => {
	// 		OdometerService.addVolume(event.volume);
	// 		MapService.publish([event]);
	// 	});
	// });
}

module.exports = [
	'EventsService',	
	'MockEventsService',
	'OdometerService',
	'MapService',
	'$scope',
	AppController,
];
