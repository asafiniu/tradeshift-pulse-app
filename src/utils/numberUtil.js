'use strict'

function NumberUtil() {

    const utils = {};

    utils.getRandomNumber = (min, max) => {
        return min + (Math.random() * (max - min));
    }
    
    utils.getRandomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    return utils;
}

module.exports = NumberUtil;
