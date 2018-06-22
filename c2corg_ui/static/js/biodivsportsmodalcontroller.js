/**
 * @module app.BiodivSportsModalController
 */
import appBase from './index.js';

/**
 * We have to use a secondary controller for the modal so that we can inject
 * uibModalInstance which is not available from the first level controller.
 * @param {Object} $uibModalInstance modal from angular bootstrap
 * @param {string} title title
 * @param {string|null} description description
 * @param {string} infoUrl link for more information
 * @param {string} kmlUrl link to area KML
 * @param {Array<boolean>} period sensitive month
 * @constructor
 * @ngInject
 */
const exports = function($uibModalInstance, title, description, infoUrl, kmlUrl, period) {

  /**
   * @type {Object} $uibModalInstance angular bootstrap
   * @private
   */
  this.modalInstance_ = $uibModalInstance;

  /**
   * @type {string} title
   * @export
   */
  this.title = title;

  /**
   * @type {string|null} description
   * @export
   */
  this.description = description;

  /**
   * @type {string} infoUrl
   * @export
   */
  this.infoUrl = infoUrl;

  /**
   * @type {string} kmlUrl
   * @export
   */
  this.kmlUrl = kmlUrl;

  /**
   * @type {Array<string>} sensitive months
   * @export
   */
  this.months = [];

  for (let i = 0; i < period.length; i++) {
    if (period[i]) {
      this.months.push(window.moment().month(i).format('MMMM'));
    }
  }
};

/**
 * @export
 */
exports.prototype.close = function() {
  this.modalInstance_.close();
};

appBase.module.controller('AppBiodivSportsModalController', exports);


export default exports;