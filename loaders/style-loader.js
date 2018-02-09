function addStyle(style) {
    return function (element) {
        if (element === undefined) {
            element = document.head;
        }
        let styleTag = document.createElement("style");
        styleTag.innerHTML = style;
        element.appendChild(styleTag);
        return styleTag;
    }
}


module.exports = function (source) {
    return `module.exports = (${addStyle.toString()})(${JSON.stringify(source)})`;
};