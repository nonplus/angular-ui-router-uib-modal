files = {
	libs: [
		'node_modules/lodash/index.js',
		'node_modules/angular/angular.js',
		'node_modules/angular-ui-router/release/angular-ui-router.js',
		'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js'
	],

	src: [
		'src/angular-ui-router-uib-modal.js'
	],

	test: [
		'node_modules/angular-mocks/angular-mocks.js',
		'test/*.spec.js'
	]
};

if (exports) {
	var _ = require('lodash');
	_.extend(exports, files);
}