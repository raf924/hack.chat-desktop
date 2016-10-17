var parse = function (text) {
  var matches = text.match(/((http(|s):[/][/].+(|[ ]))|([?][^ ]+))/gi);
  if (matches != null) {
    matches.forEach(function(link) {
      text = text.replace(link.trim(), "<a href='"+link.trim()+"' target='_blank'>"+link.trim()+"</a>");
    });
  }
  return text;
}

exports.parse = parse;
