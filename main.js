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
		$scope.refreshWeatherData = function (city) {
			var promise = dataService.getWeatherData(city);
			console.log("promise", promise);
			// Handle data promise
			promise.then(
				function (payload) {
					$log.info("Success:", payload.data);

					var rawData = _.clone(payload.data);

					$log.info("Raw data:", rawData);

					// Map out to object with date & temperature
					var list = _.clone(rawData.list)
					.map(function (listItem) {
						return {
							date: listItem.dt,
							temp: listItem.main.temp
						}
					});

					$log.info("List:", list);

					c3Factory.get('chart').then(function(chart) {
						console.log("chart", chart);
					  chart.load({
					    json: list,
					    keys: {
					    	x: 'date',
					    	value: ['temp']
					    }
					  });
					});
				},
				function (err) {
					$log.error('Failure loading weather data', err);
				}			
			);
		}

		$scope.refreshWeatherData('Toronto');

		// Initial chart config before loading in JSON
		$scope.config = {
		  data: {
		    json: [], // Empty until openweather request completed		    
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