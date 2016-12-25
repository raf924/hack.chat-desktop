interface Window{
    cordova?;
}

if(window.cordova){
    module.exports = require('./userData/cordova');
} else {
    module.exports = require('./userData/electron');
}
