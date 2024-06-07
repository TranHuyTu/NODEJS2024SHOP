'use strict';

const redisPubSubService = require('../services/redisPubSub.service');

class InventoryServiceTest{
    constructor(){
        redisPubSubService.subscribe('duyen', (channel, message) => {
            console.log(`CHANNEL:: ${channel} -> ${message}`);
            InventoryServiceTest.updateInventory(JSON.parse(message));
        })
    }
    
    static updateInventory({ productId, quantity }){
        console.log(`Update inventory ${productId} with quantity ${quantity}`);
    }
}

module.require = new InventoryServiceTest();