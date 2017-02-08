require('./../node_modules/roboto-fontface/css/roboto/roboto-fontface.css');
require('material-components-web/dist/material-components-web.min.css');
require('./../node_modules/material-design-icons/iconfont/material-icons.css');
require('./../index.html');
let r = require.context(`${__dirname}/../static/css`);
r.keys().forEach((file) => {
    r(file);
});

