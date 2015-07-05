var request = require('request');
var cheerio = require('cheerio');
var xml2js  = require('xml2js');
var async   = require('async');
var moment  = require('moment');
var db      = require('monk')(process.env.MONGOLAB_URI || "localhost/hansdb");
var ProgressBar = require('progress');

var sessions = db.get('sessions');
sessions.index("date");
//sessions.index('session_header.date session_header.chamber', {unique: true});


// var parser = new xml2js.Parser({
//     explicitArray : false,
//     attrkey: 'attr',
//     tagNameProcessors: [
//         function(name) {return name.replace(/\./g, '_')}
//     ]
// });

var bar = new ProgressBar('Pulling [:bar] :current/:total :percent :eta', {total: 0});

var hansardQueue = async.queue(function(task, callback) {
    console.log(task);
    request(task, function(error, response, body) {
            if (error) {
                console.log("Error in hansard request " + error);
                callback(error);
                return;
            }

            var sanatisedBody = body.replace(/(<\/?[a-z]+)\./g, "$1_");
            var $ = cheerio.load(sanatisedBody);

            var date = moment($('session_header > date').text(), "YYYY-MM-DD").toDate();

            var finishedInserting = false;
            var attemptedInserts = 0;
            var completedInserts = 0;

            //subdebate_1 represents all discussions on an issue
            $('subdebate_1').each(function(){
                var title = $('> subdebateinfo > title', this).text();

                $('speech', this).each(function() {
                    var talkers = {};
                    $('talker', this).each(function() {
                        var id = $('> name_id', this).text();
                        if (talkers[id]) return;

                        talkers[id] = {};
                        talkers[id].name = $('> name', this).text();
                        talkers[id].electorate = $('> electorate', this).text();
                        talkers[id].party = $('> party', this).text();
                    });

                    var recentSpeaker = "";
                    $('span.HPS-Normal', this).each(function() {
                        var speaker = $('a', this).attr("href");
                        var interjecting = $('[class~="Interjecting"]', this).count;

                        if (speaker && talkers[speaker]) {
                            recentSpeaker = speaker;
                        }

                        ++attemptedInserts;

                        sessions.insert({
                            speaker: talkers[recentSpeaker],
                            date: date,
                            bill: title,
                            interjecting: interjecting,
                            text: $(this).text().replace(/[^a-zA-z0-9 .]/g, "").replace(/\s\s+/g, ' ')
                        }, function(error, doc) {
                            if (error) console.log("Error in mongodb insert " + error);
                            ++completedInserts

                            if (finishedInserting && attemptedInserts ==  completedInserts) {
                                bar.tick(1);
                                callback(null);
                            }
                        });
                    });
                });
            });

            finishedInserting = true;
            if (attemptedInserts ==  completedInserts) {
                bar.tick(1);
                callback(null);
            }
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
