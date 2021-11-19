

const readline = require('readline');
const fs = require("fs");


const readInterface = readline.createInterface({
    input: fs.createReadStream('table-with-taxonomy.tsv'),
    console: false
});

let variable = [];
let line_num = 0
readInterface.on('line', function(line) {
    console.log(line_num)
    if (!(line[0] == "#")) {
        variable.push(line.split("\t"))
    }
    line_num += 1;
});

readInterface.on('close', function() {
    console.log(variable[0])
});

//console.log("X, ", variable);
//console.log("X, ", variable);

