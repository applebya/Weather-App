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
			},

			getCityList: function () {
				console.log("Fetching Cities List...");
				return $http({
					method: 'GET',
					url: './cityList.json'
				});
			}
		}

	})

	.controller('ChartController', function ($log, $scope, dataService, c3Factory) {

		// Load in full list of cities (Yeh, it's huge!)
		$scope.loadCityList = function (city) {
			var promise = dataService.getCityList();

			// Handle promise
			promise.then(
				function (payload) {
					console.log("Cities JSON:", payload.data);

					var id = 0
					var cityList = _.clone(payload.data)
					.map(function (city) {
						id++
						return {
							id: id,
							name: city
						}
					});
					console.log("Cities now:", cityList);
					$scope.cityList = cityList;
				},
				function (err) {
					$log.error("Failure loading cityList", err);
				}
			)
		}

		$scope.loadCityList();

		// Load in our weather data
		$scope.refreshWeatherData = function (city) {
			dataService.getWeatherData(city).then(
				// Success
				function (payload) {

					// Grab our data set
					var rawData = _.clone(payload.data);
					$log.info("Raw data:", rawData);

					// Change selected city in scope
					$scope.selectedCity = rawData.city.name

					// Map out to object with date & temperature
					var list = _.clone(rawData.list)
					.map(function (listItem) {
						return {
							date: listItem.dt * 1000, // Convert unix s -> ms
							temp: listItem.main.temp,
							pressure: listItem.main.pressure
						}
					});
					$log.info("List:", list);

					// Ok, let's plot this new data on the temp chart!
					c3Factory.get('tempChart').then(function (chart) {
						chart.load({
							json: list,
							keys: {
								x: 'date',
								value: ['temp'],
							}
						});
					});

					// Calculate the mean pressure
					var pressTotal = 0;
					_.forEach(list, function (memo, num) {
						pressTotal += memo.pressure;
					});

					var pressAvg = Math.round(pressTotal / list.length, 2)
					
					// Plot out the pressure chart!
					c3Factory.get('pressChart').then(function (chart) {
						chart.load({
							columns: [['Pressure', pressAvg]]
						})
					});

				},
				// Errors
				function (err) {
					$log.error('Failure loading weather data', err);
					alert("Sorry, had trouble loading data for that city!");
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

		// Initial temperature chart config before loading in JSON
		$scope.tempConfig = {
			data: {
				json: [], // Empty until openweather request completed
				type: 'area-spline',
				names: {
					temp: "Temperature"
				},
				colors: {
					temp: '#EFF70A'
				}
			},
			axis: {
				x: {
					type: 'timeseries',
					tick: {
						format: function (timestamp) {
							return moment(timestamp).format('MMM Do');
						},
						values: daysArray,
					}
				}
			},
			tooltip: {
				format: {
					title: function (x) {
						return moment(x).format('MMM Do @ h:mma');
					},
					value: function (x) {
						return "<strong>" + x + "&deg;C</strong>"
					}
				}
			}
		};

		// Initial pressure chart config
		$scope.pressConfig = {
			data: {
				columns: [['Pressure', 0]],
				type: 'gauge',
				names: {
					Pressure: "Avg Pressure"
				}
			},
			gauge: {
				label: {
					format: function (value, ratio) {
						return value;
					}
				},
				units: 'hPa',
				min: 0,
				max: 2000
			},
			tooltip: {
				format: {
					value: function (x) {
						return "<strong>" + x + " hPa</strong>"
					}
				}
			}
		}

		$scope.selectedCity = "Toronto";

		$scope.refreshWeatherData($scope.selectedCity);

	})