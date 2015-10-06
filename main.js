'use strict';

angular.module('weatherApp', ['angular-c3'])

	.factory('dataFactory', function () {
		return [1,2,3,4]
	})

	.controller('ChartController', function ($scope) {
		console.log("I'm alive!");

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
	  console.log("Hey!");
	});