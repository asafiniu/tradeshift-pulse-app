const POLL_TIMEOUT = 1000;

function AppController(PixiService, AppService, OdometerService, $scope) {

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
			OdometerService.addVolume(jsonData.volume);
			PixiService.publish([jsonData]);
		} else {
			$scope.error(error);
		}
	});
}

module.exports = ['PixiService', 'AppService', 'OdometerService', '$scope', AppController];
