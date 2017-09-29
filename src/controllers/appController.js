const POLL_TIMEOUT = 1000;

function AppController(PixiService, AppService, OdometerService, $scope) {

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
