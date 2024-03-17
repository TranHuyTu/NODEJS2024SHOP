'use strict';

const mongodb = require('mongoose');
const os = require('os');
const process = require('process');
const _SECONDS = 6000000; 

const countConnect = () => {
    const numberConnection = mongodb.connections.length;
    console.log(`Number of connections ::${numberConnection}`)

}

//check over load
const checkOverload = ()=>{
    setInterval(()=>{
        const numberConnection = mongodb.connections.length;
        const numCores = os.cpus().length;
        const memoryUsage = process.memoryUsage().rss;

        const maxConnections = numCores * 5;

        console.log(`Active connections:: ${numberConnection}`)
        console.log(`Memory usage:: ${memoryUsage/1024/1024} MB`)

        if(numberConnection > maxConnections){
            console.log('Connection overload detected!');
        }

    },_SECONDS)
}

module.exports = {
    countConnect,
    checkOverload
}