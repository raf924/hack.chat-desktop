(function ($) {
    $.fn.tabs = function (method, data) {
        if (this.length == 0) return;
        var that = this;
        var tabSelector = ".tab";
        var activateTab = function (index) {
            var $tabs = that.find(`${tabSelector} a[data-tab]`);
            $tabs.each(function (i) {
                var $div = $("[id='" + $(this).attr("data-tab") + "']");
                $div.css("display", i == index ? "" : "none");
                $(this)[i == index ? "addClass" : "removeClass"]("active");
            });
            $(that).trigger("tabChanged", `${tabSelector} a[data-tab]`, that).attr("data-tab");
        };
        var observer = new MutationObserver(function (mutationRecord) {
            mutationRecord.forEach(function (mutation) {
                switch (mutation.type) {
                    case "attributes":
                        activateTab($(target).index(`${tabSelector} a[data-tab]`));
                        break;
                    case "childList":
                        if (mutation.addedNodes != null) {
                            var $tabs = $(mutation.addedNodes).find("a[data-tab]");
                            var $closeTab = $(mutation.addedNodes).find("a[data-close]");
                            $closeTab.click(function (e) {
                                $(that).trigger("tabClosed", $(this).attr("data-close"));
                            });
                            $tabs.click(function (e) {
                                activateTab($(this).index(`${tabSelector} a[data-tab]`));
                            });
                            activateTab($tabs.index(`${tabSelector} a[data-tab]`));
                        }
                        break;
                }
            });
        });
        observer.observe(this[0], {
            attributes: false,
            subTree: true,
            childList: true,
            characterData: false
        });
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
