(function ($) {
    $.fn.tabs = function (method, data) {
        if (this.length == 0) return this;
        let that = this;
        let tabSelector = ".tab";
        let activateTab = function (index: number | string, newTab?: boolean) {
            let $tabs = that.find(`${tabSelector} [data-tab]`);
            if (typeof index === "number") {
                $tabs.each(function (i) {
                    let $div = $(`[id='${$(this).attr("data-tab")}']`);
                    $(this)[i == index ? "addClass" : "removeClass"]("active");
                    $div[i == index ? "addClass" : "removeClass"]("active");

                });
            } else if (typeof index === "string") {
                $tabs.removeClass("active");
                $(`[id='${index}']`).addClass("active");
            }
            if (newTab) {
                $(that).trigger("tabs.opened", $(`${tabSelector} [data-tab].active`, that).attr("data-tab"));
            }
            $(that).trigger("tabs.changed", $(`${tabSelector} [data-tab].active`, that).attr("data-tab"));

        };
        this.on("click", "[data-close]", function () {
            $(that).trigger("tabs.closed", $(this).attr("data-close"));
            $(`[id='${$(this).attr("data-close")}']`).remove();
            $(this).parent().remove();
        }).on("click", "[data-tab]", function () {
            activateTab($(this).index(`${tabSelector} [data-tab]`));
        });
        let observer = new MutationObserver(function (mutationRecord) {
            mutationRecord.forEach(function (mutation) {
                switch (mutation.type) {
                    case "attributes":
                        activateTab($(mutation.target).index(`${tabSelector} [data-tab]`));
                        break;
                    case "childList":
                        if (mutation.addedNodes.length > 0) {
                            let $tabs = $(mutation.addedNodes).find("[data-tab]");
                            activateTab($tabs.index(`${tabSelector} [data-tab]`), true);
                        }
                        break;
                }
            });
        });
        observer.observe(this[0], {
            attributes: false,
            subtree: false,
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
        return this;
    }
}(jQuery));