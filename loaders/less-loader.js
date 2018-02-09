let less = require("less");

module.exports = function (source) {
    let callback = this.async();
    less.render(source.toString(), {
        sourceMap: {
            sourceMapFileInline: true,
        }
    }).then(function (output) {
        callback(null, output.css);
    }, function (err) {
        console.error(err);
        callback(err);
    });
};

module.exports.raw = true;