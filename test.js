new Promise((resolve, reject) => {
    return resolve(`0`)
}).then((data) => {
    process.nextTick(() =>{
        console.log(`2`);
    });
    console.log(data);
})

console.log('3::')

setTimeout(() => {
    console.log(`4`);
}, 100)

process.nextTick(() =>{
        console.log(`5`);
    });