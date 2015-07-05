var vis = {};
var ctx;

/* Holder Data */
var doughnutHolderData = [
   {
      value: 300,
      color:"#F7464A",
      highlight: "#FF5A5E",
      label: "Australian Labour Party"
   },
   {
      value: 50,
      color: "#46BFBD",
      highlight: "#5AD3D1",
      label: "The Greens"
   },
   {
      value: 100,
      color: "#FDB45C",
      highlight: "#FFC870",
      label: "The Coalition"
   },
   {
      value: 101,
      color: "rgb(71, 173, 71)",
      highlight: "#FFC870",
      label: "Family First"
   }
];

var lineHolderData = {
   labels: ["January", "February", "March", "April", "May", "June", "July"],
   datasets: [
      {
         label: "Shouting in parliment",
         fillColor: "rgba(220,220,220,0.2)",
         strokeColor: "rgba(220,220,220,1)",
         pointColor: "rgba(220,220,220,1)",
         pointStrokeColor: "#fff",
         pointHighlightFill: "#fff",
         pointHighlightStroke: "rgba(220,220,220,1)",
         data: [65, 59, 80, 81, 56, 55, 40]
      },
      {
         label: "Questions in parliment",
         fillColor: "rgba(151,187,205,0.2)",
         strokeColor: "rgba(151,187,205,1)",
         pointColor: "rgba(151,187,205,1)",
         pointStrokeColor: "#fff",
         pointHighlightFill: "#fff",
         pointHighlightStroke: "rgba(151,187,205,1)",
         data: [28, 48, 40, 19, 86, 27, 90]
      }
   ]
};

var radarHolderData = {
   labels: ["Money", "Health", "Nation", "Happy", "Proud", "Trust", "Hate"],
   datasets: [
      {
         label: "My First dataset",
         fillColor: "rgba(220,220,220,0.2)",
         strokeColor: "rgba(220,220,220,1)",
         pointColor: "rgba(220,220,220,1)",
         pointStrokeColor: "#fff",
         pointHighlightFill: "#fff",
         pointHighlightStroke: "rgba(220,220,220,1)",
         data: [65, 59, 90, 81, 56, 55, 40]
      },
      {
         label: "My Second dataset",
         fillColor: "rgba(151,187,205,0.2)",
         strokeColor: "rgba(151,187,205,1)",
         pointColor: "rgba(151,187,205,1)",
         pointStrokeColor: "#fff",
         pointHighlightFill: "#fff",
         pointHighlightStroke: "rgba(151,187,205,1)",
         data: [28, 48, 40, 19, 96, 27, 100]
      }
   ]
};






/* SHOUTING DOUGHNUT */
ctx = document.getElementById("shouts-vis").getContext("2d");
vis.shoutRatios = {
   ctx   : ctx,
   chart : new Chart(ctx).Doughnut(doughnutHolderData),
   data  : doughnutHolderData
};

/* QUESTIONS DOUGHNUT */
ctx = document.getElementById("questions-vis").getContext("2d");
vis.questionRatios = {
   ctx   : ctx,
   chart : new Chart(ctx).Doughnut(doughnutHolderData),
   data  : doughnutHolderData
};

/* SHOUT/QUESTION TIMESERIES */
ctx = document.getElementById("shout-questions-timeseries-vis").getContext("2d");
vis.shoutQuestionTimeSeries = {
   ctx   : ctx,
   chart : new Chart(ctx).Line(lineHolderData),
   data  : lineHolderData
};

/* WORDS FREQUENCY RADIAL */
ctx = document.getElementById("radar-frequency-vis").getContext("2d");
vis.radarFrequency = {
   ctx   : ctx,
   chart : new Chart(ctx).Radar(radarHolderData),
   data  : radarHolderData
};



/* UPDATE ALL VISUALISATIONS */
function updateVisualisations() {
   //shouting ratios
   vis.shoutRatios.chart.destroy();
   vis.shoutRatios.ctx = document.getElementById("shouts-vis").getContext("2d");
   vis.shoutRatios.chart = new Chart(vis.shoutRatios.ctx).Doughnut(vis.shoutRatios.data);

   //question ratios
   vis.questionRatios.chart.destroy();
   vis.questionRatios.ctx = document.getElementById("questions-vis").getContext("2d");
   vis.questionRatios.chart = new Chart(vis.questionRatios.ctx).Doughnut(vis.questionRatios.data);

   //shotuing time series
   vis.shoutQuestionTimeSeries.chart.destroy();
   vis.shoutQuestionTimeSeries.ctx = document.getElementById("shout-questions-timeseries-vis").getContext("2d");
   vis.shoutQuestionTimeSeries.chart = new Chart(vis.shoutQuestionTimeSeries.ctx).Line(vis.shoutQuestionTimeSeries.data);

   //radar frequency by party
   vis.radarFrequency.chart.destroy();
   vis.radarFrequency.ctx = document.getElementById("radar-frequency-vis").getContext("2d");
   vis.radarFrequency.chart = new Chart(vis.radarFrequency.ctx).Radar(vis.radarFrequency.data);
}
