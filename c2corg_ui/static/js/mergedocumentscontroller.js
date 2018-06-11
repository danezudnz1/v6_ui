/**
 * @module app.MergeDocumentsController
 */
import appBase from './index.js';

/**
 * @param {appx.Document} documentData Data set as module value in the HTML.
 * @param {app.Api} appApi appApi.
 * @param {app.Alerts} appAlerts
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {ui.bootstrap.$modalStack} $uibModalStack $uibModalStack.
 * @constructor
 * @ngInject
 */
const exports = function(documentData, appApi, appAlerts, gettextCatalog, $uibModalStack) {

  /**
   * @type {appx.Document}
   * @export
   */
  this.sourceDocument = documentData;

  /**
   * @type {app.Api}
   * @private
   */
  this.appApi_ = appApi;

  /**
   * @type {app.Alerts}
   * @private
   */
  this.appAlerts_ = appAlerts;

  /**
   * @type {angularGettext.Catalog}
   * @private
   */
  this.gettextCatalog_ = gettextCatalog;

  /**
   * @type {ui.bootstrap.$modalStack}
   * @private
   */
  this.$uibModalStack_ = $uibModalStack;

  /**
   * @export
   * @type {string}
   */
  this.module;

  /**
   * @export
   * @type {appx.SimpleSearchDocument}
   */
  this.targetDocument;
};

appBase.module.controller('AppMergeDocumentsController', exports);

/**
 * @export
 * @param {appx.SimpleSearchDocument} document
 */
exports.prototype.selectTargetDocument = function(document) {
  this.targetDocument = document;
};

/**
 * @export
 */
exports.prototype.mergeDocuments = function() {
  if (!this.targetDocument) {
    return;
  }

  const msg = this.gettextCatalog_.getString('Are you sure you want to merge?');
  if (window.confirm(msg)) {
    this.appApi_.mergeDocuments(
      this.sourceDocument.document_id, this.targetDocument.document_id)
      .then(
        (response) => {
          this.closeDialog();
          this.appAlerts_.addSuccess(this.gettextCatalog_.getString(
            'Documents successfully merged'
          ));
        }
      );
  }
};


/**
 * @export
 */
exports.prototype.closeDialog = function() {
  this.$uibModalStack_.dismissAll();
};


/**
 * @export
 */
exports.prototype.getTargetTitle = function() {
  if (!this.targetDocument) {
    return null;
  }

  const locale = this.targetDocument.locales[0];
  let title = (locale.title_prefix) ? locale.title_prefix + ' : ' : '';
  title += locale.title;

  return title;
};


export default exports;
