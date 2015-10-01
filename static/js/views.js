var fs = require('fs');
var View = function(name) {
  this.$element = fs.readFileSync("static/views/" + name + ".html");
};

exports.View = View;
