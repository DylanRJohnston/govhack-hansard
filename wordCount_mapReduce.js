var map = function() {
    var summary = this.text;

    if (summary) {
        summary = summary.toLowerCase().split(" ");
        for (var i = summary.length -1; i >= 0; i--) {
            if (summary[i]) {
                emit(summary[i], 1);
            }
        }
    }
};

var reduce = function(key, values) {
    var count = 0;
    values.forEach(function(v) {
        count += v;
    })

    return count;
};
