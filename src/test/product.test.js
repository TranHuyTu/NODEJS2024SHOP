'use strict';

const redisPubSubService = require('../services/redisPubSub.service');

class ProductServiceTest{

    purchaseProduct( productId, quantity ){
        const order = {
            productId,
            quantity
        }
        redisPubSubService.publish('duyen', order);
    }
}

module.exports = new ProductServiceTest();