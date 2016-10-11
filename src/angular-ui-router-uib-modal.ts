"use strict";

angular.module("ui.router.modal", ["ui.router"])
	.config(["$stateProvider", function($stateProvider: angular.ui.IStateProvider) {

		let stateProviderState = $stateProvider.state;

		$stateProvider["state"] = state as any;

		function state(name: string, config: angular.ui.IState): angular.ui.IStateProvider
		function state(config: angular.ui.IStateProvider): angular.ui.IStateProvider
		function state(name: any, config?: angular.ui.IState): angular.ui.IStateProvider {

			var stateName: string;
			var options: angular.ui.IState;

			// check for $stateProvider.state({name: "state", ...}) usage
			if (angular.isObject(name)) {
				options = name;
				stateName = options.name;
			} else {
				options = config;
				stateName = name;
			}

			if (options.modal) {

				if (options.onEnter) {
					throw new Error("Invalid modal state definition: The onEnter setting may not be specified.");
				}

				if (options.onExit) {
					throw new Error("Invalid modal state definition: The onExit setting may not be specified.");
				}

				let openModal: angular.ui.bootstrap.IModalServiceInstance;

				// Get modal.resolve keys from state.modal or state.resolve
				let resolve = (Array.isArray(options.modal) ? options.modal as string[] : [] as string[]).concat(Object.keys(options.resolve || {}));

				let inject = ["$uibModal", "$state"];
				options.onEnter = function($uibModal: angular.ui.bootstrap.IModalService, $state: angular.ui.IStateService) {

					// Add resolved values to modal options
					if (resolve.length) {
						options.resolve = {};
						for (let i = 0; i < resolve.length; i++) {
							options.resolve[resolve[i]] = injectedConstant(arguments[inject.length + i]);
						}
					}

					let thisModal = openModal = $uibModal.open(options as angular.ui.bootstrap.IModalSettings);

					openModal.result['finally'](function() {
						if (thisModal === openModal) {
							// Dialog was closed via $uibModalInstance.close/dismiss, go to our parent state
							$state.go($state.get("^", stateName).name);
						}
					});
				};

				// Make sure that onEnter receives state.resolve configuration
				options.onEnter["$inject"] = inject.concat(resolve);

				options.onExit = function() {
					if (openModal) {
						// State has changed while dialog was open
						openModal.close();
						openModal = null;
					}
				};

			}

			return stateProviderState.call($stateProvider, stateName, options);
		}
	}]);

function injectedConstant<T>(val: T): [() => T] {
	return [function() { return val; }];
}
