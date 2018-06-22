/**
 * @module app.mapSearchDirective
 */
/**
 * Adapted from https://github.com/camptocamp/agridea_geoacorda/blob/master/jsapi/src/searchcontrol.js
 */

import appBase from './index.js';

/**
 * @return {angular.Directive} Directive Definition Object.
 */
const exports = function() {
  return {
    restrict: 'E',
    scope: {
      'map': '=appMapSearchMap'
    },
    controller: 'AppMapSearchController',
    bindToController: true,
    controllerAs: 'searchCtrl',
    templateUrl: '/static/partials/map/search.html',
    link:
        /**
         * @param {angular.Scope} scope Scope.
         * @param {angular.JQLite} element Element.
         * @param {angular.Attributes} attrs Atttributes.
         */
        function(scope, element, attrs) {
          // Empty the search field on focus and blur.
          element.find('input').on('focus blur', function() {
            $(this).val('');
          });
        }
  };
};

appBase.module.directive('appMapSearch', exports);


export default exports;