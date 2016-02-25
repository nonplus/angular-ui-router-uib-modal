angular-ui-router-uib-modal
===========================

[![Build Status](https://travis-ci.org/nonplus/angular-ui-router-uib-modal.svg?branch=master)](https://travis-ci.org/nonplus/angular-ui-router-uib-modal)

AngularJS module that adds support for ui-bootstrap modal states when using ui-router.

Motivation
----------

Some RIAs using UI-Router use modal dialogs for certain application states.
The [UI-Router's FAQ](https://github.com/angular-ui/ui-router/wiki/Frequently-Asked-Questions#how-to-open-a-dialogmodal-at-a-certain-state),
shows how to implement modal dialogs using [ui.bootstrap.modal](http://angular-ui.github.io/bootstrap/#/modal) service.
While it works well,  it requires a lot of boiler-plate code, complicates the state definition, and requires the state
controller to be aware that its inside a `$uibModalInstance` to automatically close the dialog on a state change.
 
This module gets rid of the boilerplate by adding support for a `modal: true` option in state definitions.
 This causes the state to be displayed via `$uibModal.open(...)` instead of within a `<ui-view/>`.

Installing the Module
---------------------
Installation can be done through bower or npm:
``` shell
bower install angular-ui-router-uib-modal
```

In your page add:
```html
  <script src="bower_components/angular-ui-router-uib-modal/angular-ui-router-uib-modal.js"></script>
```

Loading the Module
------------------

This module declares itself as `ui.router.modal`, so it can be declared as a dependency of your application as normal:

```javascript
var app = angular.module('myApp', ['ng', 'ui.router', 'ui.bootstrap', 'ui.router.modal']);
```

Specifying modal states
-----------------------

Adding a `modal: true` to a state definition causes its template to be opened through a call to
 `$uibModal.open(stateDefinition)` rather than embedding it inside of a `<ui-view/>`.
 
To specify which resolved state values are available to the modal controller, use an array instead of `true`,
e.g. `modal: ['value1', 'value2']`.

Inside the modal state controller, the modal via can be closed via `$uibModalInstance.close/dismiss()` or by 
transitioning to the parent state via `$state.go('^')`.


```javascript
$stateProvider
  .state('contacts', {
    url: '/contacts',
    // ...
  })
  .state('contacts.contact', {
    url: '/:contactId',
    modal: true,
    template: '<div class="modal-header">...',
    controller: function($scope, $state, contact) {
		$scope.close = function() {
			$state.go('^');
		}
    },
    resolve: {
      // Single contact
      contact: ['Contacts', '$stateParams', function(Contacts, $stateParams) {
        // Use Contacts service to retrieve a contact
        return Contacts.get({ id: $stateParams.contactId });
      }]
    }
  })
```

Caveats
-------

**Modal does not have access to parent state's `$scope` values**

The modal's `$scope` doesn't inherit anything from the parent state's scope.  So any
data that comes from the parent should be specified via `resolve` settings.

**You must specify resolved parent state values to provide to the modal controller**

By default, `$uibModal.open()` is called with only the resolved values of the modal state.  If you want to include
values resolved in parent states, use an array instead of `true` for the `modal` setting.

In the following examples, `$uibModal.open()` for the `parent.child` state will be called with resolved values
`a`, `b`, `x`, `y` and `z`.

```
$stateProvider
  .state('parent', {
    ...
    resolve: {
      a: ...,
      b: ...,
      c: ...
    }
  })
  .state('parent.child', {
    ...
    modal: ['a', 'b'],
    resolve: {
      x: ...,
      y: ...,
      z: ...
    }
  })
```
                                   
**Does not work with old versions of UI-Bootstrap**

The module uses the current `$uibModal` service rather than the deprecated `$modal`.

**Does not work with custom `onEnter` and `onExit` state configurations**
 
The module works by adding `onEnter` and `onExit` state configurations to modal states.
If these are already defined in a modal state, an error is thrown.

Copyright & License
-------------------

Copyright 2016 Stepan Riha. All Rights Reserved.

This may be redistributed under the MIT licence. For the full license terms, see the LICENSE file which
should be alongside this readme.
