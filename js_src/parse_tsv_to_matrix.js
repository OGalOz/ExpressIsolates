


const fileSystem = require("fs");


function parseTSV(tsv_fp) {
    // tsv_fp (str): Path to tsv file
    //
    // returns list<row_dict>, where row_dict maps
    //  headers to their values. One row_dict per row.
    
    //var fileString = ""

    let fileString = getFileStringSynchronously(tsv_fp)
    
    let op_JSON = tsvJSON(fileString)

    return op_JSON 
    
}

function getFileStringSynchronously(fp) {
    // fp (str) Path to file
    // Returns
    //  fileString (str) Entire file in a string
    let fileString = fileSystem.readFileSync(fp, 'utf8' , (err, data) => {
                        if (err) {
                          console.error(err)
                          return
                        }
                        //return data
    })

    return fileString

}




// From URL https://gist.github.com/iwek/7154706
//var tsv is the TSV file with headers
function tsvJSON(tsv){
    // tsv (string): Entire tsv file in string format
    // NOTE THAT WE CUT THE SPLIT OFF A LINE EARLIER THAN EXPECTED.
    
  console.log(tsv)
  var lines=tsv.split("\n");

  var result = [];

  var headers=lines[0].split("\t");

  console.log(headers)

  for(var i=1;i<lines.length - 1;i++){

	  var obj = {};
	  var currentline=lines[i].split("\t");

	  for(var j=0;j<headers.length;j++){
		  obj[headers[j]] = currentline[j];
	  }

	  result.push(obj);

  }

  //return result; //JavaScript object
  return JSON.stringify(result); //JSON
}







/*
async function processLineByLine(num_lines, fp) {
    // num_lines (int) -1 implies no limit
    // fp (str) filepath to file we want to read from, generally TSV
  const fileStream = fs.createReadStream(fp);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.
  let crt_line = 0;
  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    console.log(`Line from file: ${line}`);
    crt_line += 1;
    if (crt_line == num_lines) {
        return "stop";
    }
  }
}
*/


console.log(parseTSV("table-with-taxonomy.tsv"));

