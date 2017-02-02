(function($) {
    $.fn.visibleHeight = function() {
        var elBottom, elTop, scrollBot, scrollTop, visibleBottom, visibleTop;
        scrollTop = $(window).scrollTop();
        scrollBot = scrollTop + $(window).height();
        elTop = this.offset().top;
        elBottom = elTop + this.outerHeight();
        visibleTop = elTop < scrollTop ? scrollTop : elTop;
        visibleBottom = elBottom > scrollBot ? scrollBot : elBottom;
        return visibleBottom - visibleTop
    }
})(jQuery);

