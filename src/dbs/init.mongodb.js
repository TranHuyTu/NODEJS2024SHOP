'use strict';

const mongoose = require('mongoose')
const {db:{host, name, port}} = require('../configs/congif.mongdb')

const connectString = `mongodb+srv://${host}:${port}/${name}`

class Database{

    constructor(){
        this.connect();
    }

    connect(type = 'mongodb'){
        if(1==1){
            mongoose.set('debug', true);
            mongoose.set('debug',{color:true});
        }
        mongoose.connect(connectString,{ 
            maxPoolSize: 100 
        }).then(_ => console.log(`Connected to Mongoose Successfully PRO:: 
        ${connectString}`))
        .catch(err=>console.log('Error Connected'))
    }
    static getInstance(){
        if(!Database.instance){
            Database.instance = new Database()
        }

        return Database.instance
    } 
}

const instanceMongodb = Database.getInstance()
module.exports =instanceMongodb