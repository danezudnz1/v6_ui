import googAsserts from 'goog/asserts';

/**
 * @param {string} apiUrl URL to the API.
 * @param {angular.Scope} $rootScope
 * @param {angular.$log} $log
 * @constructor
 * @struct
 */
export default class AuthenticationService {
  constructor(apiUrl, $rootScope, $log) {
    'ngInject';

    /**
     * @type {string}
     * @private
     */
    this.apiUrl_ = apiUrl;

    /**
     * The http service must be set later to prevent circular dependency error.
     * @type {?angular.$http}
     * @private
     */
    this.http_ = null;

    /**
     * @type {app.Lang}
     * @private
     */
    this.langService_ = null;

    /**
     * @type {angular.$log}
     * @private
     */
    this.$log = $log;

    /**
     * @type {string}
     * @private
     * @const
     */
    this.USER_DATA_KEY_ = 'userData';

    /**
     * @type {?appx.AuthData}
     * @export
     */
    this.userData = null;

    // Load current user data from storage
    const rawData = window.sessionStorage.getItem(this.USER_DATA_KEY_) ||
        window.localStorage.getItem(this.USER_DATA_KEY_);
    if (rawData) {
      this.userData = this.parseUserData_(rawData);
    }

    // Replace parsed user data when storage changed in another tab.
    // Handles set and remove. Does not handle same tab events.
    window.addEventListener('storage', (event) => {
      if (event.key === this.USER_DATA_KEY_) {
        this.userData = this.parseUserData_(event.newValue);
        if (!$rootScope.$$phase) {
          $rootScope.$apply();
        }
      }
    });
  }


  /**
   * @param {angular.$http} $http
   */
  setHttpService($http) {
    this.http_ = $http;
  }


  /**
   * @param {app.Lang} LangService Lang service.
   */
  setLangService(LangService) {
    this.langService_ = LangService;
  }


  /**
   * @return {boolean}
   * @export
   */
  isAuthenticated() {
    return !!this.userData && !this.isExpired_();
  }


  /**
   * @return {boolean}
   * @export
   */
  isModerator() {
    if (this.userData) {
      const roles = this.userData.roles;
      return roles.indexOf('moderator') > -1;
    } else {
      return false;
    }
  }


  /**
   * Checks if the current user has rights to access/edit the document.
   * TODO: rights to personal documents only for current user.
   * @param {string} doctype
   * @param {Object} options
   * @return {boolean}
   * @export
   */
  hasEditRights(doctype, options) {
    if (!this.isAuthenticated()) {
      return false;
    }

    if (this.isModerator()) {
      return true;
    }
    if (doctype === 'outings') {
      return this.hasEditRightsOuting_(options['users']);
    } else if (doctype === 'images') {
      return this.hasEditRightsImage_(options['imageType'], options['imageCreator']);
    } else if (doctype === 'profiles') {
      return this.userData.id === options['user_id'];
    } else if (doctype === 'articles') {
      return this.hasEditRightsArticle_(options['articleType'], options['authorId']);
    } else if (doctype === 'xreports') {
      return this.hasEditRightsXreport_(options['authorId'], options['users']);
    }

    return true;
  }


  /**
   * Checks if the current user has rights to access/edit the outing.
   * @param {Array<number>} userIds
   * @return {boolean}
   * @private
   */
  hasEditRightsOuting_(userIds) {
    return this.isAssociatedUser(userIds);
  }


  /**
   * Checks if the current user has rights to access/edit the xreport.
   * @param {string} authorId
   * @param {Array<number>} userIds
   * @return {boolean}
   * @private
   */
  hasEditRightsXreport_(authorId, userIds) {
    if (this.userData.id === parseInt(authorId, 10)) {
      return true;
    }
    return this.isAssociatedUser(userIds);
  }


  /**
   * @param {Array<number>} userIds
   */
  isAssociatedUser(userIds) {
    return userIds.indexOf(this.userData.id) !== -1;
  }


  /**
   * Checks if the current user has rights to access/edit the image.
   * @param {?string} imageType
   * @return {boolean}
   * @private
   */
  hasEditRightsImage_(imageType, creator) {
    if (imageType === 'collaborative') {
      return true;
    } else {
      return this.userData.id === creator;
    }
  }


  /**
   * Checks if the current user has rights to access/edit the article.
   * @param {string} articleType
   * @param {string} authorId
   * @return {boolean}
   * @private
   */
  hasEditRightsArticle_(articleType, authorId) {
    if (articleType === 'collab') {
      return true;
    } else {
      return this.userData.id === parseInt(authorId, 10);
    }
  }


  /**
   * @param {appx.AuthData} data User data returned by the login request.
   * @return {boolean} whether the operation succeeded.
   */
  setUserData(data) {
    try {
      const raw = JSON.stringify(data);
      this.userData = this.parseUserData_(raw);

      // set the interface language
      this.langService_.updateLang(this.userData.lang, /* syncWithApi */ false);

      const storage = data.remember ? window.localStorage : window.sessionStorage;
      if (DEBUG) {
        this.$log.log('Stored user data in', data.remember ? 'local' : 'session');
      }
      storage.setItem('userData', raw);
      return true;
    } catch (e) {
      // https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem
      // Either the storage is full or we are in incognito mode in a broken
      // browser.
      // TODO: display error message to user
      if (DEBUG) {
        this.$log.error('Fatal : failed to set authentication token', e);
      }
      return false;
    }
  }


  /**
   * @export
   */
  removeUserData() {
    try {
      // Make sure that user data are removed from all possible storages
      window.localStorage.removeItem(this.USER_DATA_KEY_);
      window.sessionStorage.removeItem(this.USER_DATA_KEY_);
    } catch (e) {} // eslint-disable-line no-empty
    this.userData = null;
  }


  /**
   * @param {string} raw Unparsed user data
   * @return {?appx.AuthData}
   * @private
   */
  parseUserData_(raw) {
    if (raw) {
      const data = /** @type {appx.AuthData} */ (JSON.parse(raw));
      // Make data immutable
      Object.freeze(data);
      Object.freeze(data.roles);
      return data;
    }
    return null;
  }


  /**
   * Test expiration. Requires this.userData not to be null.
   * @return {boolean}
   * @private
   */
  isExpired_() {
    googAsserts.assert(!!this.userData, 'this.userData should not be null');

    const now = Date.now() / 1000; // in seconds
    const expire = this.userData.expire;
    if (now > expire) {
      this.removeUserData();
      return true;
    }

    if (now > expire - 3600 * 24 * 7) {
      // Less than 7 days left, trying to renew authorization.
      // TODO: would be more robust if we knew the issued time.
      this.handle_token_renewal_(now, expire);
    }
    return false;
  }


  /**
   * @param {number} now Current time (in seconds)
   * @param {number} expire Token expiration (in seconds)
   * @private
   */
  handle_token_renewal_(now, expire) {
    const storage = window.localStorage;
    const pending = parseInt(storage.getItem('last_renewal') || 0, 10);

    if (!!this.http_ && now > pending + 15) {
      // If no pending renewal or more than 15s after last one
      if (DEBUG) {
        this.$log.log('Renewing authorization expiring on',
          new Date(expire * 1000));
      }

      try {
        storage.setItem('last_renewal', now.toString());
      } catch (e) {
        return; // do not flood the server
      }

      this.http_.post(this.apiUrl_ + '/users/renew', {}).then(
        (response) => {
          this.setUserData(response.data);
          if (DEBUG) {
            this.$log.log('Done renewing authorization');
          }
        },
        function() {
          if (DEBUG) {
            this.$log.log('Failed renewing authorization');
          }
        });
    }
  }


  /**
   * Add an 'Authorization' header containing the JWT token.
   * In the future, if cookie based security is implemented, it will be changed
   * to send the CSRF value instead.
   * @param {string} url Destination URL.
   * @param {!Object.<string>} headers Current headers.
   * @return {boolean} whether the operation was successful
   * @export
   */
  addAuthorizationToHeaders(url,
    headers) {
    const token = this.userData ? this.userData.token : null;
    if (token && !this.isExpired_()) {
      if (DEBUG && url.indexOf('http://') === 0) {
        // FIXME: ideally, should prevent the operation in prod mode
        this.$log.log('WARNING: added auth header to unsecure request to ' + url);
      }
      headers['Authorization'] = 'JWT token="' + token + '"';
      return true;
    }

    if (DEBUG) {
      this.$log.log('Application error, trying to authenticate request to ' +
          url + ' with missing or expired token');
    }
    return false;
  }


  /**
   * @param {string} method
   * @param {string} url
   * @return {boolean}
   * @export
   */
  needAuthorization(method, url) {
    if (url.indexOf(this.apiUrl_) === -1) {
      // UI user and xreport data service
      if ((url.indexOf('/profiles/data') !== -1 ||
          url.indexOf('/xreports/data') !== -1) && this.isAuthenticated()) {
        // forward auth header if user is authenticated
        return true;
      }

      // External URLs do not need auth.
      return false;
    }
    // Login and register API URLs are obviously public.
    if (url.indexOf('/users/login') !== -1 ||
        url.indexOf('/users/register') !== -1) {
      return false;
    }
    if (url.indexOf('/users/account') !== -1 ||
        url.indexOf('/users/preferences') !== -1 ||
        url.indexOf('/users/mailinglists') !== -1 ||
        url.indexOf('/users/following') !== -1 ||
        url.indexOf('/users/block') !== -1 ||
        url.indexOf('/users/unblock') !== -1 ||
        url.indexOf('/profiles') !== -1 ||
        url.indexOf('/personal-feed') !== -1 ||
        url.indexOf('/xreports/') !== -1) {
      return true;
    }

    if (url.indexOf('/profile-feed') !== -1 && this.isAuthenticated()) {
      return true;
    }

    // Figure write actions out using the HTTP method.
    // Read actions (GET) are generally public.
    return ['POST', 'PUT', 'DELETE'].includes(method);
  }
}