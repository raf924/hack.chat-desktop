let r = require.context(`${__dirname}/static/css`);
r.keys().forEach((file) => {
    r(file);
});