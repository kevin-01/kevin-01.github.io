d3.csv("/data/movie_titles.csv", function(error, data) {

    if (error) throw error;

    var sortAscending = true;
    var table = d3.select('#page-wrap').append('table');
    var titles =d3.keys(data[0]);
    var headers = table.append('thead').append('tr')
        .selectAll('th')
        .data(titles).enter()
        .append('th')
        .text(function (d) {
            return d;
        })
    var rows = table.append('tbody').selectAll('tr')
        .data(data).enter()
        .append('tr');
    rows.selectAll('td')
        .data(function (d) {
            return titles.map(function (k) {
                return { 'value': d[k], 'name': k};
            });
        }).enter()
        .append('td')
        .attr('data-th', function (d) {
            return d.name;
        })
        .text(function (d) {
            if(d.name === "Number" || d.name === "Year"){
                return parseInt(d.value)
            }else{
                return d.value
            }
        });
});