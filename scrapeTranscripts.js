var request = require('request');
var cheerio = require('cheerio');
var xml2js  = require('xml2js');
var async   = require('async');
var moment  = require('moment');
var db      = require('monk')('localhost/hansdb');
var ProgressBar = require('progress');

var sessions = db.get('sessions');
sessions.index('session_header.date session_header.chamber', {unique: true});


var parser = new xml2js.Parser({
    explicitArray : false,
    attrkey: 'attr',
    tagNameProcessors: [
        function(name) {return name.replace(/\./g, '_')}
    ]
});

var bar = new ProgressBar('Pulling [:bar] :current/:total :percent :eta', {total: 0});

var hansardQueue = async.queue(function(task, callback) {
    request(task, function(error, response, body) {
            if (error) {
                console.log("Error in hansard request " + error);
                callback(error);
                return;
            }

            parser.parseString(body,
                function(error, result) {
                    if (error) {
                        console.log("Error in parsing hansard XML " + error);
                        callback(error);
                        return;
                    }

                    sessions.insert(result.hansard, function(error, doc) {
                        bar.tick(1);
                        if (error) console.log("Error in mongodb insert " + error);
                        callback(error);
                    });
            });
        }
    );
}, 20);
hansardQueue.drain = function() {console.log("All hansard pages parsed"); db.close();}

var indexQueue = async.queue(function(task, callback) {
    request(
        "http://www.aph.gov.au/Parliamentary_Business/Hansard?wc=" + task,
        function(error, response, body) {
            var $ = cheerio.load(body);

            var docs = $('[id^=main_0_content_0_lvHansard_hlXML]').map(function(i, e){return e.attribs.href});

            bar.total += docs.length;

            hansardQueue.push(docs.toArray());
            callback(error);
        }
    );
}, 20);
indexQueue.drain = function() {console.log("All index pages parsed");}

var startDate = moment("22/06/2015", "DD/MM/YYYY");
for (var i = 0; i < 52; ++i)
{
    indexQueue.push(startDate.format("DD/MM/YYYY"));
    startDate.subtract(7, "days");
}
