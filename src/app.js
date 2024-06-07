require('dotenv').config();
const compression = require('compression');
const express = require('express');
const { default: helmet } = require('helmet');
const morgan = require('morgan');
const app = express();
const cors = require('cors');

// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({
    extended: true,
}));

app.use(cors({
  origin: 'http://localhost:3000' // Hoặc '*' để cho phép tất cả các nguồn gốc
}));

//test pub,sub Redis
// require('./test/inventory.test');
// const productTest = require('./test/product.test');

// setTimeout(()=>{
//     productTest.purchaseProduct('product:002', 10);
// },100);


// init db
require('./dbs/init.mongodb');
const {countConnect, checkOverload} = require('./helpers/check.connect');
// const initRedis = require('./dbs/init.redis');
// initRedis.initRedis();
countConnect();
checkOverload();

// init routers
app.use('/',require('./routes'))

// handling error 

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    return next(error);
})

app.use((error, req, res, next) => {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message: error.message || 'Internal Server Error'
    })
});

module.exports = app;