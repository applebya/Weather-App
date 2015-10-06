'use strict';

angular.module('weatherApp', ['angular-c3'])

	.factory('dataService', function ($http) {
		return {
			getWeatherData: function (city) {
				console.log("Fetching Data for:", city);
				return $http({
					method: 'GET',
					url: 'http://api.openweathermap.org/data/2.5/forecast/city?q='+city+'&units=metric&mo'
				});
			}
		}

	})

	.controller('ChartController', function ($log, $scope, dataService, c3Factory) {

		// Load in our weather data
		$scope.refreshWeatherData = function (weatherData) {
			var promise = dataService.getWeatherData('Toronto');
			console.log("promise", promise);
			// Handle data promise
			promise.then(
				function (payload) {
					$log.info("Success:", payload.data);

					c3Factory.get('chart').then(function(chart) {
						console.log("chart", chart);
					  chart.load({
					      columns: [
					          ['data1', 30, 200, 100, 400, 150, 250, 50, 100, 250],
					          ['data2', 50, 25, 133, 46, 693, 345, 34, 14, 55]
					      ]
					  });
					});

					return payload.data;
				},
				function (err) {
					console.log("Failure");
					$log.error('failure loading weather data', err);
				}			
			);
		}

		$scope.refreshWeatherData()

	  $scope.config = {
	    data: {
	      x: 'x',
	      columns: [
	          ['x', '2012-12-29', '2012-12-30', '2012-12-31'],
	          ['data1', 230, 300, 330],
	          ['data2', 190, 230, 200],
	          ['data3', 90, 130, 180]
	      ]
	    },
	    axis: {
	        x: {
	            type: 'timeseries',
	            tick: {
	                format: '%m/%d',
	            }
	        }
	    }
	  };
	})