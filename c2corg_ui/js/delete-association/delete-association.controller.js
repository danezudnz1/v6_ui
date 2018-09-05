/**
 * @constructor
 * @param {angular.Scope} $rootScope
 * @param {!angular.Scope} $scope Scope.
 * @param {angular.$compile} $compile Angular compile service.
 * @param {ui.bootstrap.$modal} $uibModal modal from angular bootstrap
 * @param {app.Api} ApiService The API service
 * @param {app.Document} DocumentService service
 * @ngInject
 * @struct
 */
export default class DeleteAssociationController {
  constructor($rootScope, $scope, $compile, $uibModal, ApiService, DocumentService) {
    'ngInject';

    /**
     * @type {angular.$compile}
     * @private
     */
    this.compile_ = $compile;

    /**
     * @type {!angular.Scope}
     * @private
     */
    this.scope_ = $scope;

    /**
     * @type {ui.bootstrap.$modal} angular bootstrap modal
     * @private
     */
    this.modal_ = $uibModal;

    /**
     * @type {angular.Scope}
     * @private
     */
    this.rootscope_ = $rootScope;

    /**
     * @type {app.Api} The API service
     * @private
     */
    this.apiService_ = ApiService;

    /**
     * @type {app.Document}
     * @private
     */
    this.documentService_ = DocumentService;

    /**
     * @type {number}
     * @export
     */
    this.parentId;

    /**
     * @type {string}
     * @export
     */
    this.childDoctype;

    /**
     * @type {number}
     * @export
     */
    this.childId;
  }


  /**
   * @return {ui.bootstrap.modalInstance}
   * @private
   */
  openModal_() {
    const template = $('#delete-association-modal').clone();
    return this.modal_.open({
      animation: true,
      size: 'sm',
      template: this.compile_(template)(this.scope_),
      controller: 'DeleteAssociationModalController',
      controllerAs: 'delModalCtrl'
    });
  }

  /**
   * Unassociate the document and remove the card.
   * @param {goog.events.Event | jQuery.Event} [event]
   * @private
   */
  unassociateDocument_(event) {
    this.apiService_.unassociateDocument(this.parentId, this.childId).then(() => {
      this.documentService_.removeAssociation(this.childId, this.childDoctype, event);
    });
  }
}