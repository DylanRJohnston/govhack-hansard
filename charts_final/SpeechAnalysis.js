var TEXTAN = new Textan();
var exportThis;

//for any query we calculate:
//  relative word frequency stuff
//  shouting proportions of each party
//  question proportions of each party
function updateData(options, callback) {
   /*  */
   var options = options || {};
   var phrase = options.phrase || null;
   var party = options.party || null;
   //get all relevant speeches
   getSpeeches(function(speeches) {
      console.log("successfully got speeches: ",speeches);

      //build text by speaker
      var textBySpeaker = {}; // {John Blogs:"", Jamie Phillips:"", ...}
      for(var s = 0; s < speeches.length; s++) {
         if(!speeches[s].speaker) continue;
         if(textBySpeaker[speeches[s].speaker.name] === undefined) {
            textBySpeaker[speeches[s].speaker.name] = speeches[s].text + " ";
         } else {
            textBySpeaker[speeches[s].speaker.name] += " "+speeches[s].text;
         }
      }

      //build text by party:
      var textByParty = {}; // {ALP:"", FF:"", ...}
      for(var s = 0; s < speeches.length; s++) {
         if(!speeches[s].speaker) continue;
         if(textBySpeaker[speeches[s].speaker.name] === undefined) {
            textByParty[speeches[s].speaker.party] = "";
         } else {
            textByParty[speeches[s].speaker.party] += " "+speeches[s].text;
         }
      }

      //build full text
      var fullText = "";
      for(var s = 0; s < speeches.length; s++) {
         fullText += speeches[s].text + " ";
      }

      console.log('successfully built text groups',{textBySpeaker:textBySpeaker, textByParty:textByParty, fullText:fullText});

      //create individual party histograms
      var keys = Object.keys(textByParty);
      var histogramsByParty = [];
      for(var p = 0; p < keys.length; p++) {
         var histogram = TEXTAN.getPhraseFrequencies(textByParty[keys[p]]);
         histogramsByParty.push({
            histogram : histogram,
            party : keys[p]
         });
      }

      //get shouts per party
      var keys = Object.keys(textByParty);
      var shoutsByParty = [];
      for(var p = 0; p < keys.length; p++) {
         var shoutCount = TEXTAN.getShoutPhraseCount(textByParty[keys[p]]);
         shoutsByParty.push({
            shoutCount : shoutCount,
            party : keys[p]
         });
      }
      exportThis = shoutsByParty;

      //get questions per party
      var keys = Object.keys(textByParty);
      var questionsByParty = [];
      for(var p = 0; p < keys.length; p++) {
         var questionCount = TEXTAN.getQuestionCount(textByParty[keys[p]]);
         questionsByParty.push({
            questionCount : questionCount,
            party : keys[p]
         });
      }

      //get value words per party
      var keys = Object.keys(textByParty);
      var valueWordsByParty = [];
      for(var p = 0; p < keys.length; p++) {
         var valueWordsCounts = TEXTAN.getValueWordCounts(textByParty[keys[p]]);
         valueWordsByParty.push({
            valueWordsCounts : valueWordsCounts,
            party : keys[p]
         });
      }

      //create/assign party shouting vis data structure
      vis.shoutRatios.data = [];
      var colours = ['#F7464A','#46BFBD','#FDB45C','rgb(71, 173, 71)'];
      var coloursHighlight = ['#FF5A5E','#5AD3D1','#FFC870','rgb(85, 197, 85)'];
      for(var i = 0; i < shoutsByParty.length && i < colours.length; i++) {
         vis.shoutRatios.data.push({
            value: shoutsByParty[i].shoutCount,
            color: colours[i],
            highlight: coloursHighlight[i],
            label: acronym2Name(shoutsByParty[i].party)
         });
      }

      //create party questions vis data structure
      vis.questionRatios.data = [];
      var colours = ['#F7464A','#46BFBD','#FDB45C','rgb(71, 173, 71)'];
      var coloursHighlight = ['#FF5A5E','#5AD3D1','#FFC870','rgb(85, 197, 85)'];
      for(var i = 0; i < questionsByParty.length && i < colours.length; i++) {
         vis.questionRatios.data.push({
            value: questionsByParty[i].questionCount,
            color: colours[i],
            highlight: coloursHighlight[i],
            label: acronym2Name(questionsByParty[i].party)
         });
      }

      //create party pronoun vis data structure


      //create party 'values' vis data structure

      updateVisualisations();
      //callback();
   });
}

function acronym2Name(acronym) {
   if(acronym === "AG") return "Australian Greens";
   if(acronym === "ALP") return "Australian Labour Party";
   if(acronym === "LP") return "Liberal Party";

   return "Acrynym error.";
}


//returns an array of speech objects: {talker, date, speech}
function getSpeeches(doneCallback, options) {
   var options = options || {};
   var dateStart = options.dateStart || moment().subtract(999, 'months').format('DD/MM/YYYY');
   var dateEnd = options.dateEnd || moment().add(1, 'days').format('DD/MM/YYYY');
   var limit = options.limit || 500;
   //var talker = options.talker || false;
   var query = "?startDate="+dateStart+"&endDate="+dateEnd+"&limit="+limit;
   //query += talker ? ("&talker="+talker) : "";
   console.log("query string is: ",query);
   $.getJSON('https://owllabs.herokuapp.com/search'+query, doneCallback);
}

   //GET CONTEXTS:
//returns array of {talker, context, date}
//also highlights the phrase with a span
function searchSpeeches(speeches, phrase) {
   var allContexts = [];
   console.log("searching all speeches for: "+phrase);
   for(var s = 0; s < speeches.length; s++) {
      var contexts = TEXTAN.getContextsOfWord(speeches[s].speech, phrase);
      //contexts contains {context, index} pairs - we want to add 'talker' property:
      //also highlight the found phrase
      for(var c = 0; c < contexts.length; c++) {
         contexts[c].talker = speeches.talker;
         contexts[c].context = contexts[c].context.replace(phrase,"<span class='search-highlight'>"+phrase+"</span>")
      }
      if(contexts.length > 0) allContexts = allContexts.concat(contexts);
   }
   return allContexts;
}



//top bar
//  words spoken this year
//  ?

//tables/lists
//  passionate statements
//  loud statements
//

//search
//  speeches mentioning phrase (get all speeches, seach through each one, return a)
