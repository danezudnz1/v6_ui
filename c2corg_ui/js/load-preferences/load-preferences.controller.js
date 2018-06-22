/**
 * @param {angular.Scope} $scope Directive scope.
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {app.Api} ApiService Api service.
 * @constructor
 * @ngInject
 * @struct
 */
export default class LoadPreferencesController {
  constructor($scope, ngeoLocation, ApiService) {
    'ngInject';

    /**
     * @type {angular.Scope}
     * @private
     */
    this.scope_ = $scope;

    /**
     * @type {ngeo.Location}
     * @private
     */
    this.location_ = ngeoLocation;

    /**
     * @type {app.Api}
     * @private
     */
    this.apiService_ = ApiService;

    /**
     * @type {string}
     * @export
     */
    this.module;

    /**
     * @type {string}
     * @export
     */
    this.url;

    /**
     * @type {?appx.UserPreferences}
     * @private
     */
    this.preferences_;

    /**
     * @type {Object}
     * @private
     */
    this.params_ = {};
  }


  /**
   * @export
   */
  applyPreferences() {
    if (this.preferences_) {
      this.loadPreferences_();
    } else {
      this.apiService_.readPreferences().then((response) => {
        this.preferences_ = /** @type {appx.UserPreferences} */ (response['data']);
        this.loadPreferences_();
      });
    }
  }


  /**
   * @private
   */
  loadPreferences_() {
    const params = this.getParams_();
    if (this.url) {
      const list = [];
      for (const param in params) {
        list.push(param + '=' + params[param]);
      }
      window.location = this.url + '#' + list.join('&');
    } else {
      this.location_.deleteFragmentParam('offset');
      if ('a' in params) {
        this.location_.deleteFragmentParam('bbox');
      }
      this.location_.updateFragmentParams(params);
      this.scope_.$root.$emit('searchFilterChange', true);
    }
  }


  /**
   * @return {Object}
   * @private
   */
  getParams_() {
    const params = {};
    let areas, activities;
    switch (this.module) {
      case 'outings':
      case 'routes':
      case 'images':
      case 'xreports':
        areas = this.getAreas_();
        activities = this.getActivities_();
        break;
      case 'waypoints':
        areas = this.getAreas_();
        break;
      case 'books':
      case 'articles':
        activities = this.getActivities_();
        break;
      default:
        break;
    }
    if (areas) {
      params['a'] = areas;
    }
    if (activities) {
      params['act'] = activities;
    }
    return params;
  }


  /**
   * @return {string}
   * @private
   */
  getAreas_() {
    const data = this.preferences_.areas;
    const areas = [];
    for (let i = 0, n = data.length; i < n; i++) {
      areas.push(data[i].document_id);
    }
    return areas.join(',');
  }


  /**
   * @return {string}
   * @private
   */
  getActivities_() {
    return this.preferences_.activities.join(',');
  }
}