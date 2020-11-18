const config = require('config');


var configWrapper = function () {
    // if it's using config
    return config;
}

// configWrapper.prototype.get = function (key) {
//     return config.get(key);
// };

module.exports = {
    configWrapper: new configWrapper()
};