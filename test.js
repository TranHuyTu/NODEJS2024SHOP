'use strict';

const str = "pickoutthelongestsubstring";


let child_str = '', child_str_std = '';

for (const char of str) {
    if(child_str_std.length === 0){
        child_str_std+=char;
    }else{
        if(!child_str_std.includes(char)){
            child_str_std+=char;
            if(child_str_std.length > child_str.length){
                child_str = child_str_std;
            }
        }else{
                child_str_std = '';
        }
        console.log(child_str, char, child_str_std.includes(char), child_str_std);
    }
}

console.log(child_str);

const array = [6,3,1,4,12,4];
const array1 = [5,6,7,4,1];

const ArrayChallenge = (array)=>{
    let S = 0, S_std =0;
    const max = Math.max(...array);

    for(let i = 0; i < max; i ++){
        const positions = array.reduce((acc,value,index)=>{
            if(value>=i){
                acc.push(index)
            }
            return acc;
        },[]);
        if(positions.length === 0){
            S_std = 0;
        }else{
            let maxLength = 0;
            let currentLength = 1;

            for (let i = 0; i < positions.length; i++) {
                if (positions[i] + 1 === positions[i + 1]) {
                    currentLength++;
                } else {
                    maxLength = Math.max(maxLength, currentLength);
                    currentLength = 1;
                }
        }
            S_std = maxLength*i;
            if(S_std>S){
                S=S_std;
            }
            console.log(positions, S);
        }
    }
    return S;
}

console.log(ArrayChallenge(array), ArrayChallenge(array1))