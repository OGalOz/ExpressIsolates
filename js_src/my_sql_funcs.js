
var mysql = require('mysql2');
var Promise = require('bluebird');

async function import_test() {
    con = await get_mysql_con()
    res = await apply_query_mysql(con, "SHOW TABLES;")
    console.log(res.then())
}



async function get_mysql_con(db_nm = null) {

    if (db_nm === null) {
        db_nm = "ASV_test";
    }
    var con = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "SQLpw123!",
      database: db_nm
    });

    return con
}

async function apply_query_mysql(con, query_str) {

    // con is a connection to MYSQL
    // query_str is a SQL query

    
    let res = await con.execute(query_str);
    con.end()
    /*
    (function(err) {
          if (err) throw err;
          x = con.query(query_str, 
                    function (err, result, fields) {
            if (err) {
                console.log("ERROR.")
                x = -1
            }

            
            x = result;
            return x
            //res.status(200).send("Got it: " + JSON.stringify(x));
          });
          con.end()
        return x
    });*/
    return res 

    //return x

}


function get_single_asv_value_from_mysql(asv_nm, sample_nm, db_nm = null, 
                                         tbl_nm = null) {
    /*
     *
     * asv_nm, sample_nm, db_nm are all strings.
     * db_nm should be "ASV_test" while in testing.
     *
     */

    if (db_nm === null) {
        db_nm = "ASV_test";
    }
    if (tbl_nm === null) {
        tbl_nm = "Sample2ASV2RelativeAbundance"
    }

    con = get_mysql_con()
    
    let query_str = "SELECT asv, sample, relative_abundance FROM qwer WHERE asv=asdf AND sample=zxcv;"
    query_str  = query_str.replace("qwer", tbl_nm)
    query_str  = query_str.replace("asdf", "'" + asv_nm + "'")
    query_str  = query_str.replace("zxcv", "'" + sample_nm + "'")

    let x = null
    con.connect(function(err) {
          if (err) throw err;
          con.query(query_str, 
                    function (err, result, fields) {
            if (err) {
                console.log("ERROR.")
                x = -1
            }

            
            x = result;
            console.log(JSON.stringify(x))
            //res.status(200).send("Got it: " + JSON.stringify(x));
          });
          con.end()
    });

    return x

}


import_test()


module.exports = { get_single_asv_value_from_mysql };


/*
router.get('/mysql/ASV_test/:asv_name(*)/:pw(*)', function (req, res, next) {

    let asv_name = req.params.asv_name;
    let pw = req.params.pw;

    var con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: pw,
      database: "ASV_test"
    });
    
    let query_str = "SELECT sample, relative_abundance FROM Sample2ASV2RelativeAbundance WHERE asv=asdf;"
    query_str  = query_str.replace("asdf", "'" + asv_name + "'")

    con.connect(function(err) {
          if (err) throw err;
          con.query(query_str, 
                    function (err, result, fields) {
            if (err) {
                res.status(400).send("Query failed. " + `${err}`)
                throw err;
            }

            let x = result;
            res_str = typeof x;
            res_str = res_str.toString()
            res.status(200).send("Got it: " + JSON.stringify(x));
          });
          con.end()
    });


})
*/
