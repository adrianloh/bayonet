'use strict';

var Ranger = angular.module('Ranger', ['pasvaz.bindonce']);

Ranger.config(function ($anchorScrollProvider, $locationProvider) {
	$locationProvider.html5Mode(true);
	$anchorScrollProvider.disableAutoScrolling();
});


Ranger.filter('toArray', function () {
	return function (obj) {
		if (!(obj instanceof Object)) {
			return obj;
		}
		return Object.keys(obj).map(function (key) {
			return Object.defineProperty(obj[key], '$key', {__proto__: null, value: key});
		});
	};
});


Ranger.directive('formhandler', function ($http) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			scope.victims = {
				restime: 0,
				restotal: 0,
				isinvalid: false,
				value: "",
				checkalreadyexists: function() {
					var _this = this,
						data = {
							size: 20,
							from: 0,
							sort: ["_score"],
							query : {
								"bool" : {
									"should" : [
										{
											"fuzzy_like_this_field" : {
												"name" : {
													"boost" : 5,
													"like_text" : _this.value
												}
											}
										},
										{
											"fuzzy_like_this_field" : {
												"fullpath" : {
													"like_text" : _this.value
												}
											}
										}
									]
								}
							}
						};
						$http.post("http://localhost:9200/bayonet/_search", data).then(function(res) {
						var hits = res.data.hits;
						_this.restotal = hits.total;
						_this.restime = res.data.took;
						if (hits.total>0) {
							scope.hitlist = hits.hits;
						}
					});
				}
			};
		}
	};
});

var yowza;

Ranger.controller("HitlistController", function ($window, $rootScope, $scope, $location, $timeout, $http) {

	yowza = $scope;

	$scope.hitlist = [];

	$scope.sort = {
		predicate: '_score',
		reverse: true
	};

	$scope.filterFileItem = function (victim) {
		// Return true to show, false to hide
		return true;
	};

	$window.addEventListener( "popstate", function (e) {
		console.log($location.path());
	});

});