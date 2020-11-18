const config = require('config');


function ConfigWrapper(inputCfg = config) {
    this.cfg = inputCfg;
}

ConfigWrapper.prototype.get = function (key) {
    return this.cfg[key];
}

module.exports = ConfigWrapper;