const app = require("./src/app");
const {app: {port}} = require('./src/configs/congif.mongdb')

const POST = port || 3056;

const server = app.listen(POST,()=>{
    console.log(`WSV eCommerce started with ${POST}`);
})

process.on("SIGINT", () => {
    server.close(()=>{
        console.log(`Exit server expression`)
    })
})