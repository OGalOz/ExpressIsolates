var express = require('express');
var fs = require('fs');
var router = express.Router();
var qzv_data_base = '/data/QZVs'

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
