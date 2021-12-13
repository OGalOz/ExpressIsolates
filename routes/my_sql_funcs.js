
var mysql = require('mysql2');



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
    
    var con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "SQLpw123!",
      database: db_nm 
    });
    
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



let asv_nm = "0001d123420b59585627edf5a1292ae8";
let sample_nm = "CPT2";
let r = get_single_asv_value_from_mysql(asv_nm, sample_nm, db_nm = null);
console.log(r)





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
