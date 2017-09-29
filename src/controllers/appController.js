const POLL_TIMEOUT = 1000;

function AppController(PixiService, AppService, $scope) {

	var lastTimeStamp = new Date();

	$scope.error = function(msg) {
		$scope.errorMessage = msg;
	};

	AppService.getEventsSSE(lastTimeStamp, function(data) {
		var jsonData = {};
		var error = '';
		try {
			jsonData = JSON.parse(data);
		} catch (e) {
			jsonData = {};
		}

		if (jsonData && jsonData.volume) {
			// lastTimeStamp = jsonData.end_time; // end of time range already visualized
			PixiService.publish([jsonData]);
		} else {
			$scope.error(error);
		}
	});
}

module.exports = ['PixiService', 'AppService', '$scope', AppController];
