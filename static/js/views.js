var View = function(name) {
  this.$element = $($.ajax("static/views/" + name + ".html", {
    async: false
  }).responseText);
};

exports.View = View;
