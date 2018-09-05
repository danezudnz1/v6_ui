export default class ConfirmSaveController {
  constructor($uibModalInstance, DocumentService, LangService) {
    'ngInject';

    /**
     * @export
     * @type {app.Lang}
     */
    this.langService = LangService;

    /**
     * @type {Object} $uibModalInstance angular bootstrap
     * @private
     */
    this.modalInstance_ = $uibModalInstance;

    /**
     * @type {string}
     * @export
     */
    this.message = DocumentService.document.message;

    /**
     * @type {string}
     * @export
     */
    this.quality = DocumentService.document.quality || 'draft';
  }

  /**
   * @export
   */
  close(action) {
    this.modalInstance_.close(action);
  }
}