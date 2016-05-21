describe('angular-ui-router-uib-modal', function() {

	var $stateProvider, $uibModal;

	beforeEach(module('ui.router.modal'));

	beforeEach(module('ui.router', function(_$stateProvider_) {
		$stateProvider = _$stateProvider_;
	}));

	beforeEach(module('ui.bootstrap'));

	//beforeEach(module('ui.bootstrap', function(_$uibModal_) {
	//	$uibModal = _$uibModal_;
	//	jasmine.spyOn($uibModal, "open");
	//}));

	var baseVal1, baseVal2, baseVal3, modalChildVal1, modalTemplate, injected, modalClosing, baseResolve;

	beforeEach(module(function($stateProvider) {
		baseVal1 = {};
		baseVal2 = ["one", 2, "three"];
		baseVal3 = function() { throw new Error("This shouldn't be called!"); };
		modalChildVal1 = {};
		modalTemplate = "modalChild: <ui-view></ui-view>";
		baseResolve = jasmine.createSpy("base1").and.returnValue(baseVal1);

		$stateProvider.state('base', {
			template: "<ui-view></ui-view>",
			params: {
				a: "",
				b: ""
			},
			resolve: {
				base1: baseResolve,
				base2: function() { return baseVal2; },
				base3: function() { return baseVal3; }
			}
		});

		$stateProvider.state('unrelated', { });

		$stateProvider.state('base.normalChild', {
			template: "normalChild"
		});

		$stateProvider.state('base.modalChild', {
			modal: ["base1", "base2", "base3"],
			template: modalTemplate,
			//controller: "ModalStateCtrl",
			controller: function(base1, base2, base3, modalChild1, $scope) {
				injected = {
					base1: base1,
					base2: base2,
					base3: base3,
					modalChild1: modalChild1,
					$scope: $scope
				};
				modalClosing = jasmine.createSpy();
				$scope.$on("modal.closing", modalClosing);
			},
			resolve: {
				modalChild1: function() { return modalChildVal1; }
			}
		});

		$stateProvider.state('base.modalChild.grandChild', {
			template: "grandChild"
		});

	}));

	describe("entering a non-modal state", function() {
		it("should not call $uibModal.open()", inject(function($state, $rootScope, $uibModal) {
			spyOn($uibModal, "open");
			$state.go("base.normalChild"); $rootScope.$digest();
			expect($state.current.name).toEqual('base.normalChild');
			expect($uibModal.open).not.toHaveBeenCalled();
		}));
	});

	describe("entering modal state", function() {

		it("should call $uibModal.open()", inject(function($state, $rootScope, $uibModal) {
			spyOn($uibModal, "open").and.callThrough();
			$state.go("base.modalChild"); $rootScope.$digest();
			expect($state.current.name).toEqual('base.modalChild');
			expect($uibModal.open).toHaveBeenCalled();
		}));

		it("should inject values resolved in state", inject(function($state, $rootScope, $uibModal) {
			spyOn($uibModal, "open").and.callThrough();
			$state.go("base.modalChild"); $rootScope.$digest();
			expect(injected.modalChild1).toBe(modalChildVal1);
		}));

		it("should inject values specified in modal setting", inject(function($state, $rootScope, $uibModal) {
			spyOn($uibModal, "open").and.callThrough();
			$state.go("base.modalChild"); $rootScope.$digest();
			expect(injected.base1).toBe(baseVal1);
			expect(injected.base2).toBe(baseVal2);
			expect(injected.base3).toBe(baseVal3);
		}));

	});

	describe("entering nested state from modal", function() {
		it("should not re-open modal", inject(function($state, $rootScope, $uibModal) {
			spyOn($uibModal, "open").and.callThrough();
			$state.go("base.modalChild"); $rootScope.$digest();
			$uibModal.open.calls.reset();
			$state.go(".grandChild"); $rootScope.$digest();
			expect($state.current.name).toEqual('base.modalChild.grandChild');
			expect($uibModal.open).not.toHaveBeenCalled();
		}));
	});

	describe("exiting nested state", function() {
		it("should not close modal", inject(function($state, $rootScope, $uibModal) {
			spyOn($uibModal, "open").and.callThrough();
			$state.go("base.modalChild.grandChild"); $rootScope.$digest();
			$uibModal.open.calls.reset();
			$state.go("^"); $rootScope.$digest();
			expect($state.current.name).toEqual('base.modalChild');
			expect(modalClosing).not.toHaveBeenCalled();
		}));
	});

	describe("exiting modal state", function() {
		it("should close modal", inject(function($state, $rootScope, $uibModal) {
			$state.go("base.modalChild"); $rootScope.$digest();
			expect($state.current.name).toEqual('base.modalChild');
			$state.go("^"); $rootScope.$digest();
			expect($state.current.name).toEqual('base');
			expect(modalClosing).toHaveBeenCalled();
		}));
	});

	describe("going to unrelated state", function() {
		it("should close modal", inject(function($state, $rootScope, $uibModal) {
			$state.go("base.modalChild.grandChild"); $rootScope.$digest();
			expect($state.current.name).toEqual('base.modalChild.grandChild');
			$state.go("unrelated"); $rootScope.$digest();
			expect($state.current.name).toEqual('unrelated');
			expect(modalClosing).toHaveBeenCalled();
		}));
	});

	describe("closing modal", function() {
		it("should exit modal state", inject(function($state, $rootScope, $uibModal) {
			$state.go("base.modalChild", { a: "someValue" }); $rootScope.$digest();
			expect($state.current.name).toEqual('base.modalChild');
			baseResolve.calls.reset();
			injected.$scope.$close(); $rootScope.$digest();
			expect($state.current.name).toEqual('base');
			expect(baseResolve.calls.count()).toBe(0);
		}));
	});

	describe("closing modal from nested state", function() {
		it("should go to parent state", inject(function($state, $rootScope, $uibModal) {
			$state.go("base.modalChild.grandChild", { a: "someValue" }); $rootScope.$digest();
			expect($state.current.name).toEqual('base.modalChild.grandChild');
			baseResolve.calls.reset();
			injected.$scope.$close(); $rootScope.$digest();
			expect($state.current.name).toEqual('base');
			expect(baseResolve.calls.count()).toBe(0);
		}));
	});
});