/**
 * @return {angular.Directive} Directive Definition Object.
 */
const StickyFiltersDirective = SCREEN => {
  return {
    restrict: 'A',
    controller: 'StickyFiltersController as stickyCtrl',
    link(scope, el, attrs, ctrl) {
      // show/hide filters on click, only available on phone
      $('.show-documents-filters-phone').click(() => {
        $('form[c2c-search-filters]').toggleClass('show');
        $('.map-right').removeClass('show');
      });
      // hide/show map on mobile
      $('.toggle-map').click(() => {
        $('.map-right').toggleClass('show');
      });
      // on mobile, clicking on the 'all filters' btn will scroll up to the top
      // because opening the whole filters list would only show you the bottom end.
      $('.orange-btn.more-filters-btn').click(() => {
        if (window.innerWidth < SCREEN.SMARTPHONE) {
          $('.documents-list-section').scrollTop(0);
        }
      });


      $('.documents-list-section').scroll(() => {
        const scrollMax = $('.simple-filters').height() + 30;
        const documentsListTop = $('.documents-list-section').scrollTop();
        // if you scroll down and there is no sticky bar, add it
        if (documentsListTop > scrollMax && $('.sticky-filters-btn-container').length === 0) {
          ctrl.addStickyFilters_();
        }
        //when you scroll up, remove the cloned filters and the sticky classes
        if (documentsListTop === 0 && $('.sticky-filters-btn-container').length > 0) {
          ctrl.removeStickyFilters_();
        }
      });
      // on resize, show filters if they have been hidden on smartphone
      $(window).resize(() => {
        ctrl.adaptFiltersWidth_();
      });
    }
  };
};

export default StickyFiltersDirective;