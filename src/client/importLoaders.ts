(function () {
    let imports = [];

    function processNodes(nodes: NodeListOf<Element> | NodeList) {
        (<any>document.querySelector("#waitIndicator")).active = true;
        (<NodeList>nodes).forEach(processElement);
        imports.forEach(function (elementToImport, index) {
            let link = document.createElement("link");
            link.rel = "import";
            link.href = `bower_components/${elementToImport}/${elementToImport}.html`;
            if (index === imports.length - 1) {
                link.onload = function () {
                    (<any>document.querySelector("#waitIndicator")).active = false;
                }
            }
            document.head.appendChild(link);
        });
    }

    function processElement(node: Node | Element, index: number, nodes: NodeList | NodeListOf<Element>) {
        if (node.nodeName.toLowerCase().startsWith("paper-") || node.nodeName.toLowerCase().startsWith("iron-")) {
            let existingImport = imports.findIndex(function (name) {
                return name === node.nodeName.toLowerCase();
            });
            //FIXME: Imports that already exist are added anyway
            if (!customElements.get(node.nodeName.toLowerCase()) && existingImport === -1) {
                imports.push(node.nodeName.toLowerCase());
            }
        }
    }

    module.exports = function () {
        let allElements = document.querySelectorAll("body *");
        processNodes(allElements);
        let mutOb = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                processNodes(mutation.addedNodes);
            });
        });
        mutOb.observe(document.body, {childList: true, attributes: false, characterData: false, subtree: true});
    };
})();