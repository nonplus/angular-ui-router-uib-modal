import angular = require("angular");

declare module 'angular' {
	export namespace ui {
		interface IState {
			modal?: boolean | string[];
		}
	}
}
