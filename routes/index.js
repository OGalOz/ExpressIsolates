var express = require('express');
var fs = require('fs');
var router = express.Router();
var qzv_data_base = '/data/QZVs'
var process = require("process");
var mysql = require('mysql2');
var mime = require('mime');

//var aux_mysql_funcs = require('./js_src/my_sql_funcs')
const path = require('path');

//import process from 'process';
const readline = require('readline');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



/* Testing routing for multiple files */
/*
router.get('/data/QZVs/:data(*)/:filename(*)', function(req, res, next) {
  res.send("Data is " + req.params.data + ", params are " + JSON.stringify(req.params));
});
*/


/* Catching QZV file data */
router.get(qzv_data_base + '/:dataname(*)/:basefile(*)', function(req, res, next) {
    let dataname = req.params.dataname
    let basefile = req.params.basefile
    let x =  basefile.split(".")
    if (x.length != 2) {
        res.status(400).send("Incorrect basefile request for qzv files, "
                            + "must be of format 'x.y', instead " + basefile)
    }
    let filename = x[0]
    let filetype =  x[1]
    console.log(filetype)
    let filetype_options = ["csv", "jsonp", "html"]
    if (!(filetype_options.includes(filetype)))  {
        res.status(400).send("Incorrect filetype for qzv files: " + filetype)
    } else {
        if (filetype == "html" & filename != "index"){
            res.status(400).send("Files ending with .html must be 'index.html', instead " + basefile)
        }
        let file_loc = qzv_data_base + "/" + dataname + "/" + basefile
        if (fs.existsSync("./" + file_loc)) {
            //file exists
            res.status(200).sendFile(file_loc);
        } else {
                res.status(400).send("Could not find any file at the location " + file_loc)
        }
        //res.status(200).sendFile('data/QZVs/' + req.params.dataname + "/" + req.params.filename);
    }
});


router.get('/text_list_to_file', function (req, res, next) {
    // req should be post, although it doesn't matter too much
    console.log("HERE TEXT STR TO FILE.")
    dubl_list = req.query["file_list"]
    file_str = ""
    for (i = 0; i < dubl_list.length; i++) {
        file_str += dubl_list[i].join(',') + "\n"
    }
    console.log(file_str)
    fp = path.join(appRoot, 'public/CSVs/csv_now.csv')
    fs.writeFile(fp, file_str, err => {
        if (err) {
          console.error(err)
          return
        }
        console.log("file written at " + fp)


        //file written successfully
        //res.status(200).send("Incomplete.")
    })
    
    promptClientDownload(fp, res)

});

function promptClientDownload(fp, res) {
    //res.download(fp)

    let filename = path.basename(fp);
    let mimetype = mime.lookup(fp);

    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);

    let filestream = fs.createReadStream(fp);
    filestream.pipe(res);

    /*
      var file = fs.readFileSync(fp, 'binary');
      res.setHeader('Content-Length', file.length);
      res.write(file, 'binary');
      res.end();
    */
}

router.get('/single_value', function (req, res, next) {
    
    let qr_res = req.query;
    let asv_name = qr_res.ASV_name
    let sample_name = qr_res.Sample_name

    query_str = get_init_query_str() 
    query_str += "WHERE s.asv='asdf' "
    query_str += "AND s.sample='qwer';"
    query_str = query_str.replace('asdf', asv_name)
    query_str = query_str.replace('qwer', sample_name)
    //console.log(query_str)

    return_my_sql_query(query_str, res, "single_value" )

})


router.get('/srch_by_taxonomy', function (req, res, next) {
    
    let qr_res = req.query;
    
    query_str = get_init_query_str() 
    taxonomy_types = ["domain", "phylum", "class", "order",
                      "family", "genus", "species"]

    append_query_str = "WHERE "
    non_empty_val_bool = false
    taxonomy_types.forEach(element => {
        if (qr_res[element] != "") {
            non_empty_val_bool = true
            append_query_str += `a.${element}='${qr_res[element]}' AND `
        }
    })
    if (!(non_empty_val_bool)) {
        res.status(200).send("No search values given.")
    }
    // Removing last AND 
    append_query_str = append_query_str.slice(0,-5) + ";"
    query_str += append_query_str;;
    console.log(query_str);

    //res.status(200).send("Incomplete func.")

    return_my_sql_query(query_str, res, "srch_by_taxonomy" )

})




function get_init_query_str() {
    let query_str = "SELECT s.asv, s.sample, s.relative_abundance, a.domain, " 
    query_str += "a.phylum, a.class, `a`.`order`, a.family, a.genus, a.species "
    query_str += "FROM "
    query_str += "Sample2ASV2RelativeAbundance s JOIN asv2taxonomy a ON "
    query_str += "s.asv = a.asv "
    return query_str
}

router.get('/asv_values', function (req, res, next) {
    
    let qr_res = req.query;
    let sample_name = qr_res.Sample_name
    
    query_str = get_init_query_str() 
    query_str += "WHERE s.sample='asdf';"
    query_str = query_str.replace('asdf', sample_name)
    console.log(query_str)
    // below args are 
    // string, res (object), format_sql_results (function), string
    return_my_sql_query(query_str, res, "asv_values" )

})

function return_my_sql_query(sql_query, res, format_type, format_func=null) {
    /*
     * Args:
     * sql_query (str)
     * res (response object as provided by express)
     * format_func (function)
     * format_type (str): Fixed vocabulary options for what type of query is being
     *                    performed.
     *
     *
     */
    // format_func is normally 'format_sql_results'
    
    var con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "SQLpw123!",
      database: "ASV_test"
    });


    con.connect(function(err) {
          if (err) throw err;
          con.query(sql_query, 
                    function (err, result, fields) {
            if (err) {
                res.status(400).send("Query failed. " + `${err}`)
                throw err;
            }

            let sql_result = result;
            
            // below function is normally 'format_sql_results'
            // but can be other functions (?)
            if (format_func === null) {
                format_sql_results(res, sql_result, format_type);
            } else {
                format_func(res, sql_result, format_type);
            }
            /*
            let x = result;
            res_str = typeof x;
            res_str = res_str.toString()
            */
            //res.status(200).send();
          });
          con.end()
    });
}

function format_sql_results(res, sql_result, format_type) {
    /*

    Description:
        We're given the sql_result as a JS object, given the 
        format_type we do different things with it. Eventually
        we use the 'res' object to return the response to the
        user.
    */
    if (typeof format_type != "string") {
        console.log("did not find format_type to be string")
        res.status(500).send("Server error. Contact maintainers.")
    }
    if (sql_result.length == 0) {
        res.status(400).send("No matches found.")
    } else {

        if (["asv_values", "sample_values", "single_value", "srch_by_taxonomy"].includes(format_type)) {
            // We return the Javascript filterable/sortable table
            // created by 'ag_grid.js'
            
            prepare_ag_grid(res, sql_result, format_type)
        } else {
            res.status(200).send("format_type not recognized")
        }
    }
}

function prepare_ag_grid(res, sql_result, format_type) {

    let colnm2type = {
        "asv": "string",
        "sample": "string",
        "relative_abundance": "number"
    }

    if (!(typeof sql_result == 'object')) {
        res.status(400).send("SQL Query object not as expected. ")
        console.log("SQL Query object not JS 'object' as expected. ") 
        return null
    } else if (sql_result.length == 0) {
       res.status(200).send("No results match query.")
       return null
    }

   // sql_result is a list of dictionaries
   // with keys 'asv', 'sample', and 'relative_abundance',
   // which all point to strings
    
   let num_results = sql_result.length;
    if (num_results == 0) {
        res.status(200).send("No results found.")
        return null
    }
   // We know from a previous function that there is at least a single result here
   let first_dictionary = sql_result[0]
   let col_names = Object.keys(first_dictionary)
   console.log("COL NAMES: " + col_names.join())


    // Creating  
    ag_grid_string = create_ag_grid_string(col_names, sql_result,
                                                     colnm2type)
    
    serve_ag_file(res, ag_grid_string, num_results)

}


function create_ag_grid_string(col_names, sql_result, colnm2type) {
    // SQL_result is a list of dictionaries with the
    // same keys, those keys being listed in col_names,
    // which is also a list, but of strings.
    // colnm2type is a dictionary mapping column names
    // to their types, e.g. {"relative_abundance": 'number', "sample":...}
    

    // COLUMN DEF STRING
    let col_def_str = "const columnDefs = ["
    let field_str_end = ' sortable:true, filter: true, width: columnWidth("myGrid", 200) },'
    for (i = 0; i < col_names.length; i++) {
        col_def_str += '{ field: "' + col_names[i] + '",' + field_str_end;
    }
    // removing the last comma and adding end bracket
    col_def_str = col_def_str.slice(0, col_def_str.length - 1) + "];"

    // ROW DEF STRING
    let row_def_str = "const rowData = ["
    for (i = 0; i < sql_result.length; i++) {
        let crt_sql_dict = sql_result[i];
        row_def_str += "{ "
        for (j =0; j < col_names.length; j++) {
            cn = col_names[j]
            if (colnm2type[cn] == "number") {
                row_def_str += `${cn}: ${crt_sql_dict[cn]}, ` 
            } else {
                row_def_str += `${cn}: "${crt_sql_dict[cn]}", ` 
            }
        }
        row_def_str = row_def_str.slice(0, row_def_str.length - 2) + " },"
    }
    row_def_str = row_def_str.slice(0, row_def_str.length - 1) + "];"
   
    ag_grid_string = col_def_str + "\n" + row_def_str

    return ag_grid_string

}

function serve_ag_file(res, ag_grid_string, num_results) {
    /*
     * num_results (int Number): Number of rows as result of sql query.
     *
     */
    // We get the file at views/table_index.html
    // and replace substring with new ag_grid_string
    // and then serve this file.
    let fp = "./views/table_index.html";
    if (fs.existsSync(fp)) {
        console.log("HERE.")
        let file_str = fs.readFileSync(fp, 'utf8')

        file_str = file_str.replace("//PLZREPLACEMEDEARGOD", ag_grid_string);
        file_str = file_str.replace("{*ROW_NUMBER*}", num_results.toString());
        res.set('Content-Type', 'text/html')
        res.status(200).send(file_str)
    }

}

router.get('/sample_values', function (req, res, next) {
    
    let qr_res = req.query;
    let asv_name = qr_res.ASV_name

    query_str = get_init_query_str()  
    query_str += "WHERE s.asv='asdf';"
    query_str = query_str.replace('asdf', asv_name)
    console.log("QUERY:  " + query_str)

    return_my_sql_query(query_str, res, "sample_values")

})




 


/* QIIME2 Fixed sheets */
router.get('/stylesheets/base-template.css', function(req, res, next) {
  res.sendFile('stylesheets/base-template.css');
});
router.get('/stylesheets/bootstrap.min.css', function(req, res, next) {
  res.sendFile('stylesheets/bootstrap.min.css');
});
router.get('/stylesheets/normalize.css', function(req, res, next) {
  res.sendFile('stylesheets/normalize.css');
});
router.get('/stylesheets/style.css', function(req, res, next) {
  res.sendFile('stylesheets/style.css');
});
router.get('/stylesheets/tab-parent.css', function(req, res, next) {
  res.sendFile('stylesheets/tab-parent.css');
});
router.get('/fonts/glyphicons-halflings-regular.eot', function(req, res, next) {
  res.sendFile('fonts/glyphicons-halflings-regular.eot');
});
router.get('/fonts/glyphicons-halflings-regular.svg', function(req, res, next) {
  res.sendFile('fonts/glyphicons-halflings-regular.svg');
});
router.get('/fonts/glyphicons-halflings-regular.ttf', function(req, res, next) {
  res.sendFile('fonts/glyphicons-halflings-regular.ttf');
});
router.get('/fonts/glyphicons-halflings-regular.woff', function(req, res, next) {
  res.sendFile('fonts/glyphicons-halflings-regular.woff');
});
router.get('/fonts/glyphicons-halflings-regular.woff2', function(req, res, next) {
  res.sendFile('fonts/glyphicons-halflings-regular.woff2');
});
router.get('/javascripts/bootstrap.min.js', function(req, res, next) {
  res.sendFile('javascripts/bootstrap.min.js');
});
router.get('/javascripts/bundle.js', function(req, res, next) {
  res.sendFile('javascripts/bundle.js');
});
router.get('/javascripts/child.js', function(req, res, next) {
  res.sendFile('javascripts/child.js');
});
router.get('/javascripts/jquery-3.2.0.min.js', function(req, res, next) {
  res.sendFile('javascripts/jquery-3.2.0.min.js');
});
router.get('/javascripts/parent.js', function(req, res, next) {
  res.sendFile('javascripts/parent.js');
});
router.get('/javascripts/vendor.bundle.js', function(req, res, next) {
  res.sendFile('javascripts/vendor.bundle.js');
});
router.get('/images/qiime2-rect-200.png', function(req, res, next) {
  res.sendFile('images/qiime2-rect-200.png');
});


/* Temporary QIIME2 Values */
router.get('/data/JSONP/level-1.jsonp', function(req, res, next) {
  res.sendFile('data/JSONP/level-1.jsonp');
});
router.get('/data/JSONP/level-2.jsonp', function(req, res, next) {
  res.sendFile('data/JSONP/level-2.jsonp');
});
router.get('/data/JSONP/level-3.jsonp', function(req, res, next) {
  res.sendFile('data/JSONP/level-3.jsonp');
});
router.get('/data/JSONP/level-4.jsonp', function(req, res, next) {
  res.sendFile('data/JSONP/level-4.jsonp');
});
router.get('/data/JSONP/level-5.jsonp', function(req, res, next) {
  res.sendFile('data/JSONP/level-5.jsonp');
});
router.get('/data/JSONP/level-6.jsonp', function(req, res, next) {
  res.sendFile('data/JSONP/level-6.jsonp');
});
router.get('/data/JSONP/level-7.jsonp', function(req, res, next) {
  res.sendFile('data/JSONP/level-7.jsonp');
});

/* End QIIME2 Values */


/*
 * Testing parsing within router
 */

async function processLineByLine(num_lines, fp) {
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


router.get('/test_parse', function(req, res, next) {

    let fp = "./data/testing/table-with-taxonomy.tsv";
    if (fs.existsSync(fp)) {
        processLineByLine(10, fp);
        res.send(process.cwd());
    } else {
        res.send("Not found");
    }

});


router.get('/query_asv', function(req, res, next) {

    let fp = "./views/query_landing.html";
    if (fs.existsSync(fp)) {
        console.log("HERE.")
        let file_str = fs.readFileSync(fp)
        res.set('Content-Type', 'text/html')
        res.status(200).send(file_str)
    } else {
        res.send("Not found");
    }

});







router.get('/xx/yy', function(req, res, next) {
  res.sendFile('xx/yy');
});
router.get('/xx/yy', function(req, res, next) {
  res.sendFile('xx/yy');
});
router.get('/xx/yy', function(req, res, next) {
  res.sendFile('xx/yy');
});



/* Tests */

/* GET Random Text. */
router.get('/test', function(req, res, next) {
  res.send('random text!');
});
/* */

/* GET current directory (variables). */
router.get('/test2', function(req, res, next) {
  res.send(__dirname);
});
/* */


/* GET basic file. */
router.get('/test3', function(req, res, next) {
  res.sendFile('/Users/omreeg/All_Work/Projects/Isolates_Website/isolates_webapp/index.HTML');
});
/* */

/* GET File. */
router.get('/testFile', function(req, res, next) {
  res.sendFile('/Users/omreeg/All_Work/Projects/Isolates_Website/isolates_webapp/data/Spring2019-20190615-taxa-bar-plots-rename_HTML/index.html');
});
/* */






module.exports = router;
