(function($) {
  $.fn.tabs = function(method, data) {
    if (this.length == 0) return;
    var that = this;
    var tabSelector = ".tab";
    var activateTab = function(index) {
      // FIXME: When a tab is added the other tabs are still active
      var $tabs = that.find(tabSelector + " a");
      $tabs.each(function(i) {
        var $div = $("#" + $(this).attr("data-tab"));
        $div.css("display", i == index ? "" : "none");
        $(this)[i == index ? "addClass" : "removeClass"]("active");
      });
      $(that).trigger("tabChanged", $(tabSelector + " a", that).attr("data-tab"));
    };
    var observer = new MutationObserver(function(mutationRecord, mutationObserver) {
      mutationRecord.forEach(function(mutation) {
        if (mutation.type == "attributes") {
          activateTab($(target).index(tabSelector + " a"));
        }
        if (mutation.addedNodes != null) {
          var tabs = $(mutation.addedNodes).find("a");
          tabs.click(function(e) {
            activateTab($(this).index(tabSelector + " a"));
          });
        }
      });
    });
    observer.observe(this[0], {
      attributes: false,
      subTree: true,
      childList: true,
      characterData: false
    });
    /*$(document).on("click", tabSelector + " a", function(e) {
       $(this).addClass("active");
       console.log("Activating tab");
       activateTab($(this).index(tabSelector + " a"));
     });*/
    switch (method) {
      case "init":
        if (data != null) {
          if (typeof data.class == "string") {
            tabSelector = data.class;
          } else if (data.class != null) {
            console.warn("class property must be a string");
            return;
          }
          //TODO: Find other options to add
        } else {
          //TODO: Find something to put here
        }
        console.log("Initializing tabs");
        activateTab(0);
        break;
      case "activate":
        if (data != null && typeof data == "number") {
          activateTab(data);
        } else {
          console.warn("argument must be a number");
        }
        break;
      default:
        if (method != null) {
          this.tabs("init", method);
        } else {
          this.tabs("init");
        }
        break;

    }
  }
}(jQuery));
