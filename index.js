var express = require('express');
var db      = require('monk')(process.env.MONGOLAB_URI + 'hansdb');
var moment  = require('moment');


var sessions = db.get('sessions');

var app     = express();

app.get('/search',
    function(req, res) {
        var startDate = moment(req.query.startDate, "DD/MM/YYYY");
        var endDate   = moment(req.query.endDate,    "DD/MM/YYYY");

        console.log("startDate " + startDate.toDate())
        console.log("endDate " + endDate.toDate())

        var query = {
            date: {
                    $gt: startDate.toDate(),
                    $lt: endDate.toDate()
            }
        };

        sessions.find(query, function (error, docs){
            if (error) console.log(error);

            res.json(docs);
        });
    }
);

var server = app.listen(5000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
