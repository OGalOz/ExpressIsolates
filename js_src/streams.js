
/*
 * In Node JS, we use streams to handle files as inputs
 * and outputs. A stream is an instance of an 'eventEmitter'.
 * The 'eventEmitter' throws a few events:
 *  'Data', 'Finish', 'Error', 'End'.
 *  Where Data means readable data is available
 *  Finish means stream is done writing data.
 *  End emitted when stream finished reading data.
 * 
 * Every time we read a chunk, we read 16KB.
 *
 */

const readline = require('readline');
const fileSystem = require("fs");


function read_table_into_obj(tsv_fp) {

    let data = "";
    // leftover keeps the end of a chunk to use with next chunk.
    var leftover = "";
    let headers = {};
    // data_obj is a list that keeps every line as a sub list split by \t
    let data_obj = [];
    let chunk_num = 0;
    let readStream = fileSystem.createReadStream(tsv_fp);
    
    readStream.setEncoding("UTF8");
    
    // Default chunk size is 16KB, so the number of chunks
    // will be file_size/16KB. 16KB means 16384 characters.
    readStream.on("data", (chunk) => {
    	//data += chunk;
        chunk_lines = chunk.split("\n");
        if (chunk_num == 0) {
            headers = get_headers(chunk_lines);
            console.log("headers: '" + headers.join("', '") + "'.")
        //    let leftover = "";
        }
        chunk_lines[0] = leftover + chunk_lines[0];
        [new_data, leftover] = process_chunk(chunk_lines, headers, leftover)
        data_obj.concat(new_data)
        chunk_num += 1
        if (chunk_num % 25 == 0) {
            console.log(`Chunk ${chunk_num} just read!`)
            console.log("Current leftover (A): " + leftover)
        }
        //return data_obj
    });

    console.log("HELLOP")
    console.log(data_obj)
    
    readStream.on("end", () => {
        console.log("Current leftover (B): " + leftover)
        console.log(data_obj.length.toString());
    	console.log("Finished.");
    });
    
    readStream.on("error", (error) => {
    	console.log(error.stack);
    });
}

function process_chunk(chunk_lines, headers) {
    let last_line = chunk_lines[chunk_lines.length - 1];
    let new_leftover = "";
    if (last_line[last_line.length - 1] == "\n") {
        new_data = get_data(chunk_lines, headers);
    } else {
        new_leftover = chunk_lines.pop();
        new_data = get_data(chunk_lines, headers);
    }

    return [new_data, new_leftover]
}

function get_data(chunk_lines, headers) {
    let new_data = [];
    let h_len = headers.length;
    for ( let j = 0; j < chunk_lines.length; j++) {
        let chunk_dict = {}
        let crt_line = chunk_lines[j];
        if (crt_line.slice(0,1) == "#") {
            continue;
        }
        let crt_split_lines = crt_line.split('\t');
        if (!(crt_split_lines.length == h_len)) {
            throw `Incompatible length of line and header for chunk line: ${crt_line}`
        }
        /*
         * List of dicts,
        for (let k = 0; k < h_len; k++) {
            chunk_dict[headers[k]] = crt_split_lines[k];
        }
        new_data.push(chunk_dict)
        */
        new_data.push(crt_split_lines)
    }
    return new_data
}

function get_headers(chunk_lines) {
    // chunk_lines list<string>
        let i = 0;
        let l = chunk_lines[i];
        let num_lines = chunk_lines.length;
        while (l[0] == "#") {
            i += 1;
            if (i == num_lines) {
                throw 'All comments in first chunk of file.'
            }
            l = chunk_lines[i];
        }
        headers = l.split("\t");
        return headers
}



read_table_into_obj("table-with-taxonomy.tsv");
