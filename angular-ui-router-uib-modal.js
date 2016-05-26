/**
 * AngularJS module that adds support for ui-bootstrap modal states when using ui-router.
 *
 * @link https://github.com/nonplus/angular-ui-router-uib-modal
 *
 * @license angular-ui-router-uib-modal v0.0.8
 * (c) Copyright Stepan Riha <github@nonplus.net>
 * License MIT
 */

(function(angular) {

"use strict";
angular.module("ui.router.modal", ["ui.router"])
	.config(["$stateProvider", function($stateProvider) {

		var stateProviderState = $stateProvider.state;

		$stateProvider.state = function (stateName, options) {

			if (options.modal) {

				if (options.onEnter) {
					throw new Error("Invalid modal state definition: The onEnter setting may not be specified.");
				}

				if (options.onExit) {
					throw new Error("Invalid modal state definition: The onExit setting may not be specified.");
				}

				var modalInstance;

				// Get modal.resolve keys from state.modal or state.resolve
				var resolve = (Array.isArray(options.modal) ? options.modal : []).concat(Object.keys(options.resolve || {}));

				var inject = ["$uibModal", "$state"];
				options.onEnter = function($uibModal, $state) {

					// Add resolved values to modal options
					if (resolve.length) {
						options.resolve = {};
						for(var i = 0; i < resolve.length; i++) {
							options.resolve[resolve[i]] = injectedConstant(arguments[inject.length + i]);
						}
					}

					modalInstance = $uibModal.open(options);

					modalInstance.result['finally'](function() {
						if (modalInstance) {
							// Dialog was closed via $uibModalInstance.close/dismiss, go to our parent state
							$state.go($state.get("^", stateName).name);
						}
					});
				};

				// Make sure that onEnter receives state.resolve configuration
				options.onEnter.$inject = inject.concat(resolve);

				options.onExit = function() {
					if (modalInstance) {
						// State has changed while dialog was open
						modalInstance.close();
						modalInstance = null;
					}
				};

			}

			return stateProviderState.call($stateProvider, stateName, options);
		};
	}]);

function injectedConstant(val) {
	return [function() { return val; }];
}


})(window.angular);