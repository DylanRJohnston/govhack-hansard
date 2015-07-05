//var sentiment = require('sentiment');

function Textan() {
}

/*
   Gets the passionate phrases of an array of sentences using sentiment analysis.
   @param sentences array of sentences
   @param options.sentimentThreshold=4 the minimum value of the magnitude of the sentiment of phrases that will be returned
   @param options.lengthThreshold=7 the maximum sentence length to be analysed (higher values may cause slowdown)
   @returns an array of objects which represetn each phrase occurance (including sentence index)
*/
Textan.prototype.getPassionatePhrases = function(sentences, options) {
   var sentimentThreshold = options.sentimentThreshold || 2;
   var lengthThreshold = options.lengthThreshold || 10;
   // Create an object {sentence, withcontext, sentiment}
   var passionate = [];
   for(var s = 0; s < sentences.length; s++) {
      if(sentences[s].length > lengthThreshold) continue;
      var senti = sentiment(sentences[s])
      if(Math.abs(senti.score) < sentimentThreshold) continue;
      passionate.push({
         sentence : sentences[s],
         sentiment : senti,
         context : (sentences[s-1] || "")+sentences[s]+(sentences[s+1] || "")
      });
   }
};

Textan.prototype.getPhraseFrequencies = function(text, options) {
   var options = options || {};
   var maxPhraseLength = options.maxPhraseLength || 3; //units: words

   var words = text.replace(/[^a-zA-Z\-' ]+/g,"").split(" ");
   var result_grams = []; //an array of words/phrases
   var result_frequencies = []; //an array of frequency/counts
   var phrase = []; //the running phrase;
   for(var w = 0; w < words.length; w++) {
      //SINGLE WORD
      var wordLow = words[w].toLowerCase();
      var wordIndex = result_grams.indexOf(wordLow);
      if(wordIndex === -1) {
         //if the single word doesn't exist, add it to the result set
         result_grams.push(wordLow);
         result_frequencies.push(1);
      } else {
         //if the single word does exist, increment the frequency count
         result_frequencies[wordIndex]++;
      }

      //PHRASE
      if(phrase.length < maxPhraseLength) {
         //if the phrase length is less than max, add this word to it and test if exists
         phrase.push(words[w]);
         var phraseLow = phrase.join(" ").toLowerCase();
         var phraseIndex = result_grams.indexOf(phraseLow);
         if(phraseIndex === -1) {
            //if not, add it
            result_grams.push(phraseLow);
            result_frequencies.push(1);
         } else {
            //if so increment it
            result_frequencies[phraseIndex]++;
         }
      } else {
         //if the phrase length is == max empty it and add this single word
         phrase.length = 0;
         phrase.push(words[w]);
      }
   }

   //convert to a single array of object tuple things and sort
   var result = [];
   for(var i=0; i<result_grams.length; i++) { result.push({'phrase': result_grams[i], 'frequency': result_frequencies[i]}); }
   result.sort(function(p1, p2) { return ((p1.frequency > p2.frequency) ? -1 : ((p1.frequency === p2.frequency) ? 0 : 1)); });

   return result;
}

Textan.prototype.getFrequencyOfWord = function(text, word) {
   var regex = new RegExp(" "+word+" ", "gi");
   return (text.match(regex) || []).length;
};

//returns {i, me, myself, mine, my} counts
Textan.prototype.getSelfPronounCounts = function(text) {
   return {
      i : this.getFrequencyOfWord('i'),
      me : this.getFrequencyOfWord('me'),
      myself : this.getFrequencyOfWord('myself'),
      mine : this.getFrequencyOfWord('mine'),
      my : this.getFrequencyOfWord('my')
   }
}

//returns {love, money, hate, trust, proud, angry, happy} counts
Textan.prototype.getValueWordCounts = function(text) {
   return {
      love  : this.getFrequencyOfWord('love'),
      money : this.getFrequencyOfWord('money'),
      hate  : this.getFrequencyOfWord('hate'),
      trust : this.getFrequencyOfWord('trust'),
      proud : this.getFrequencyOfWord('proud'),
      angry : this.getFrequencyOfWord('angry'),
      happy : this.getFrequencyOfWord('happy')
   }
}

Textan.prototype.getShoutPhraseCount = function(text) {
   var regex = new RegExp("!", "gi");
   return (text.match(regex) || []).length;
}

Textan.prototype.getQuestionCount = function(text) {
   var regex = new RegExp("\\?", "gi");
   return (text.match(regex) || []).length;
}

//returns <contextLength> characters on either side of <word> and the string index of that talk unit
Textan.prototype.getContextsOfWord = function(text, word, contextLength) {
   var contextLength = contextLength || 20;
   var splits = text.split(word);
   //grab indexes
   var contexts = [];
   var runningIndex = 0;
   for(var s = 0; s < splits.length-1; s++) {
      runningIndex += splits[s].length;
      var startIndex = runningIndex-contextLength;
      if(startIndex < 0) startIndex = 0;
      var endIndex = runningIndex+contextLength;
      if(endIndex > text.length) endIndex = text.length-1;
      var context = text.substr(startIndex, endIndex);
      contexts.push({
         context : context,
         index : runningIndex
      });
   }
   return contexts;
};

Textan.prototype.getSentences = function(text) {
   return text.match( /[^\.!\?]+[\.!\?]+/g );
};

//array1 will be sorted, array2 will be re-ordered to match
Textan.prototype.sortTogether = function(array1, array2) {
   var merged = [];
   for(var i=0; i<array1.length; i++) { merged.push({'a1': array1[i], 'a2': array2[i]}); }
   merged.sort(function(o1, o2) { return ((o1.a1 < o2.a1) ? -1 : ((o1.a1 == o2.a1) ? 0 : 1)); });
   for(var i=0; i<merged.length; i++) { array1[i] = merged[i].a1; array2[i] = merged[i].a2; }
}
