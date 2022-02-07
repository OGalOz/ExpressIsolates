

var isobrow_sql = {
    "ret_sql_q": function return_my_sql_query(sql_query, res, format_type, format_func=null) {
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
        // Could be format_sql_seq
        
        var con = mysql.createConnection({
          host: "localhost",
          user: "enigma",
          port: '8888',
          socketPath: '/var/lib/mysql/mysql.sock',
          password: "enigma",
          database: "enigma_isolates"
        });
    
    
        con.connect(function(err) {
              if (err) {
                  console.log(err.message)
                  res.status(500).send("Mysql connection error.")
                  return err
              };
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
    },
    "get_seq_qry_str": function get_sql_seq_query_str(asv_name) {
        let query_str = "SELECT a.seq " 
        query_str += 'FROM asv2seq a WHERE asv LIKE "asdf";'
        query_str = query_str.replace('asdf', asv_name)
        return query_str
    },
    "test_str": "Yippidie Doo Dah"

} // Close isobrow_sql

/**
 * Expose `isobrow_sql`.
 */
module.exports = isobrow_sql;
