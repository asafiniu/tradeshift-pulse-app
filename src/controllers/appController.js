const POLL_TIMEOUT = 1000;

function AppController(PixiService, AppService, $scope) {

	var lastTimeStamp = new Date();

	$scope.error = function(msg) {
		$scope.errorMessage = msg;
	};

	$scope.poll = function(){
		// setTimeout(function(){
		// 	AppService.getEvents(lastTimeStamp).then(function(response) {
		// 		lastTimeStamp = response.data.end_time; // end of time range already visualized
		// 		$scope.template_path = PixiService.publish(response.data.events);
		// 		setTimeout($scope.poll, POLL_TIMEOUT); // go again
		// 	}).catch(function(error) {
		// 		$scope.error(error);
		// 	});
		// }, POLL_TIMEOUT);

		AppService.getEventsSSE(lastTimeStamp, function(response) {
			if (response.ok) {
				lastTimeStamp = response.data.end_time; // end of time range already visualized
				$scope.template_path = PixiService.publish(response.data.events);
			} else {
				$scope.error(response.error);
			}
		});
	};

	// init function
	(function(){
		$scope.poll();
	})();
}

module.exports = ['PixiService', 'AppService', '$scope', AppController];
