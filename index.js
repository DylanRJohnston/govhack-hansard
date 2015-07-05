var express = require('express');
var db      = require('monk')(process.env.MONGOLAB_URI || "localhost/hansdb");
var moment  = require('moment');


var sessions   = db.get('sessions');
var word_count = db.get('word_count');
var app     = express();

app.all('/',
    function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        next();
    }
);

app.get('/search',
    function(req, res) {

        var startDate = moment(req.query.startDate, "DD/MM/YYYY");
        var endDate   = moment(req.query.endDate,    "DD/MM/YYYY");
        var limit     = req.query.limit || 10000;

        console.log("startDate " + startDate.toDate())
        console.log("endDate " + endDate.toDate())

        var query = {
            date: {
                    $gt: startDate.toDate(),
                    $lt: endDate.toDate()
            }
        };

        sessions.find(query, {limit: limit}, function (error, docs){
            if (error) console.log(error);

            res.json(docs);
        });
    }
);

app.get('/word_count', function(req, res) {
    var limit = req.query.limit || 1000;

    word_count.find({}, {limit: limit, sort: {value: -1}}, function(error, docs) {
        if (error) console.log(error);

        res.json(docs);
    });
});

var server = app.listen(process.env.PORT || 5000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
