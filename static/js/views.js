const fs = require('fs');
var View = function(name) {
  this.element = fs.readFileSync(`static/views/${name}.html`).toString();
};

exports.View = View;
export {View};