const config = require('config');


<<<<<<< HEAD
function ConfigWrapper(inputCfg = config) {
    this.cfg = inputCfg;
}

ConfigWrapper.prototype.get = function (key) {
    return this.cfg[key];
}

module.exports = ConfigWrapper;
=======
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
>>>>>>> f59b4b9816bc07c60cd409bc55f2608f8a6be05f
