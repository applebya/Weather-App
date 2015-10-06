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

			// Handle data promise
			promise.then(
				// Success
				function (payload) {

					// Grab our data set
					var rawData = _.clone(payload.data);
					$log.info("Raw data:", rawData);

					// Map out to object with date & temperature
					var list = _.clone(rawData.list)
					.map(function (listItem) {
						return {
							date: listItem.dt * 1000, // Convert unix s -> ms
							temp: listItem.main.temp,
						}
					});
					$log.info("List:", list);

					c3Factory.get('chart').then(function(chart) {
						console.log("chart", chart);
						chart.load({
							json: list,
							keys: {
								x: 'date',
								value: ['temp'],
							}
						});
					});

				},
				// Errors
				function (err) {
					$log.error('Failure loading weather data', err);
				}			
			);
		}
		

		// Generate our day x-ticks (assuming 5-day forecast)
		var daysArray = []
		var thisDay = null
		var today = moment().startOf('day');

		for (var i = 0; i < 7; i++) {
			thisDay = today.clone().add(i, 'days').valueOf();
			daysArray.push(thisDay);
		};

		// Initial chart config before loading in JSON
		$scope.chartConfig = {
			data: {
				json: [], // Empty until openweather request completed
				type: 'area-spline',
			},
			axis: {
				x: {
					type: 'timeseries',
					tick: {
						format: function (timestamp) {
							return moment(timestamp).format('Do MMM');
						},
						values: daysArray,
					}
				}
			}
		};

		$scope.refreshWeatherData('Toronto');

	})