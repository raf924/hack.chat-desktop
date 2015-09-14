var View = function(name) {
  this.$element = $($.ajax("../views/" + name + ".html", {
    async: false
  }).responseText);
};

exports.View = View;
