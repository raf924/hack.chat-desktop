export class Tabs {

    tabSelector: string = ".tab";
    tabContentContainer: HTMLElement;
    tabContainer: HTMLElement;

    get count(): number {
        return this.tabContainer.querySelectorAll(this.tabSelector).length;
    }

    constructor(tabContainer: string | HTMLElement, tabContentContainer: string | HTMLElement, tabClass?: string) {
        if (tabContainer instanceof HTMLElement) {
            this.tabContainer = tabContainer;
        } else if (typeof tabContainer === "string") {
            this.tabContainer = <HTMLElement>document.querySelector(`[id='${tabContainer}']`);
            if (!this.tabContainer) {
                throw "tabContainer must be a valid HTMLElement or its id";
            }
        } else {
            throw "tabContainer must be a valid HTMLElement or its id";
        }

        if (tabContentContainer instanceof HTMLElement) {
            this.tabContentContainer = tabContentContainer;
        } else if (typeof tabContentContainer === "string") {
            this.tabContentContainer = <HTMLElement>document.querySelector(`[id='${tabContentContainer}']`);
            if (!this.tabContentContainer) {
                throw "tabContentContainer must be a valid HTMLElement or its id";
            }
        } else {
            throw "tabContentContainer must be a valid HTMLElement or its id";
        }

        if (typeof tabClass === "string") {
            this.tabSelector = `.${tabClass}`;
        } else if (tabClass) {
            console.warn(`tabClass must be a string. Using default tab selector: ${this.tabSelector}`);
        }
        this.tabContainer.addEventListener("click", (function (e) {
            let target = <HTMLElement>e.target;
            if(target.dataset["close"]){
                let tabId = target.dataset["close"];
                let event = new CustomEvent("tabs.closed", {detail: tabId});
                this.tabContainer.dispatchEvent(event);
                this.tabContentContainer.querySelector(`[id='${tabId}']`).remove();
                target.parentElement.remove();
            } else if(target.dataset["tab"]){
                this.activateTab(target.dataset["tab"]);
            }

        }).bind(this));
        let observer = new MutationObserver((function (mutationRecord) {
            mutationRecord.forEach((function (mutation) {
                switch (mutation.type) {
                    case "attributes":
                        this.activateTab((<HTMLElement>mutation.target).dataset["tab"]);
                        break;
                    case "childList":
                        if (mutation.addedNodes.length > 0) {
                            for (let node of mutation.addedNodes) {
                                if ((<HTMLElement>node).dataset["tab"]) {
                                    this.activateTab((<HTMLElement>node).dataset["tab"], true);
                                }
                            }
                        }
                        break;
                }
            }).bind(this));
        }).bind(this));
        observer.observe(this.tabContainer, {
            attributes: false,
            subtree: false,
            childList: true,
            characterData: false
        });
    }

    /**
     * Activate a tab given its index or its id
     * @param index index or id of the tab to activate.
     * @param newTab true if the tab is new
     */
    activateTab(index: string | number, newTab?: boolean) {
        if (typeof index !== "number" && typeof index !== "string") {
            throw "tab index must be a number or a string";
        }
        let tabs = this.tabContainer.querySelectorAll(`${this.tabSelector} [data-tab]`);
        let tabContents = this.tabContentContainer.children;
        if (typeof index === "number") {
            Array.from(tabs).forEach((function (tab: HTMLElement, i) {
                let tabContent = this.tabContentContainer.querySelector(`[id='${tab.dataset["tab"]}']`);
                tab.classList.toggle("active", i === index);
                tabContent.classList.toggle("active", i === index);
            }).bind(this));
        } else if (typeof index === "string") {
            Array.from(tabs).forEach((tab) => tab.classList.remove("active"));
            Array.from(tabContents).forEach((tabContent) => tabContent.classList.remove("active"));
            this.tabContentContainer.querySelector(`[id='${index}']`).classList.toggle("active", true);
            this.tabContainer.querySelector(`[data-tab='${index}']`).classList.toggle("active", true);
        }
        let tab = <HTMLElement>this.tabContainer.querySelector(`${this.tabSelector} [data-tab].active`);
        if (tab == null) {
            return this;
        }
        let tabId = tab.dataset["tab"];
        if (newTab) {
            let event = new CustomEvent("tabs.opened", {detail: tabId});
            this.tabContainer.dispatchEvent(event);
        }
        let event = new CustomEvent("tabs.changed", {detail: tabId});
        this.tabContainer.dispatchEvent(event);
    }
}