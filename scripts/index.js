var recommender = new jsrecommender.Recommender();
var table = new jsrecommender.Table();
var new_user = "";
var predicted_table = "";

d3.csv("/data/useful_data1.csv", function(error, data) {
    console.log(data[0]);


    var i; // ok pour 200
    for (i = 0; i < 100; i++) {
        table.setCell(data[i].movie, data[i].user_id, data[i].rating);
    }
    console.log("OK")

    recommend();

});

function recommend(){
    var model = recommender.fit(table);
    console.log(model);

    predicted_table = recommender.transform(table);
    console.log(predicted_table);

    //export_data_vis1(predicted_table);
    //export_data_vis2(predicted_table);

    create_options_user(predicted_table);
    create_options_movie(predicted_table);
    create_options_rating(predicted_table);
}

function export_data_vis1(predicted_table){

    var csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "id,value" + "\r\n";

    for(var i = 0; i < predicted_table.rowNames.length; ++i){
        var movie = predicted_table.rowNames[i];
        csvContent += movie + "\r\n";
        for(var j = 0; j < predicted_table.columnNames.length; ++j){
            var user = predicted_table.columnNames[j];
            var prediction = predicted_table.getCell(movie, user);

            csvContent += movie + "." + user + "." + movie + "," + prediction*100 + "\r\n";

        }
    }

    var encodedUri = encodeURI(csvContent);
    window.open(encodedUri);

    console.log("Exported");

}

function export_data_vis2(predicted_table){ // a faire en json mais comment faire XD et après fini

    var csvContent = "/data:text/csv;charset=utf-8,";
    csvContent += "id,value" + "\r\n";

    for(var i = 0; i < predicted_table.columnNames.length; ++i){
        var user = predicted_table.columnNames[i];
        csvContent += user + "\r\n";
        for(var j = 0; j < predicted_table.rowNames.length; ++j){
            var movie = predicted_table.rowNames[j];
            var prediction = predicted_table.getCell(movie, user);

            csvContent += user + "." + movie + "," + prediction*100 + "\r\n";

        }
    }

    var encodedUri = encodeURI(csvContent);
    window.open(encodedUri);

    console.log("Exported");

}

function show_recommendation() {
    var variable = document.getElementById("btn_field");
    var rec =  document.getElementById("recommender");
    var in_ = false;
    var result = {1: [],
        2: [],
        3: [],
        4: [],
        5: []};

    if(variable != "" || variable != undefined || variable != null) {
        for (var i = 0; i < predicted_table.columnNames.length; ++i) {
            var user = predicted_table.columnNames[i];
            if (user == variable.value) {
                in_ = true
                for (var j = 0; j < predicted_table.rowNames.length; ++j) {
                    var movie = predicted_table.rowNames[j];
                    var prediction = Math.round(predicted_table.getCell(movie, user));
                    if(prediction < 1){
                        prediction = 1;
                    }else if(prediction > 5){
                        prediction = 5;
                    }

                    if(prediction != undefined || prediction != null){
                        result[prediction].push(movie);
                    }
                }
            }
        }
    }
    if(!in_){
        rec.innerHTML = '';
        alert("Missing User_ID oder User_ID is Wrong");
    }else{
        rec.innerHTML = 'For user: ' + variable.value + "<br> <br>";
        for (var i = 5; i > 0; --i){
            var list_movie = result[i].sort()
            if(list_movie.length > 0) {
                for (var j = 0; j < list_movie.length; ++j){
                    var movie = list_movie[j];
                    if(j == 0){
                        rec.innerHTML += '<span style="text-decoration:underline">Movie with prediction = ' + i + ":</span><br>";
                    }
                    rec.innerHTML += movie + "<br>";
                }
                rec.innerHTML += "<br>";
            }
        }
    }
}


function displayNextImage() {
    x = (x === images.length - 1) ? 0 : x + 1;
    document.getElementById("img").src = images[x];
}

function displayPreviousImage() {
    x = (x <= 0) ? images.length - 1 : x - 1;
    document.getElementById("img").src = images[x];
}

function startTimer() {
    setInterval(displayNextImage, 40000);
}

var images = [], x = -1;
images[0] = "/data/mf2.png";
images[1] = "/data/mf1.png";
images[2] = "/data/cat_matrix.gif";
images[3] = "/data/computer_angry.gif";
images[4] = "/data/Matrix_facto.png";



function create_new_user(){
    var variable = document.getElementById("new_usr").value;
    var user_exist = false;

    for(var i = 0; i < predicted_table.columnNames.length; i++){
        var user = predicted_table.columnNames[i];
        if(variable == user){
            user_exist = true;
        }
    }
    if(!user_exist && variable != "" && variable!=null){
        new_user = variable;
        console.log(new_user);
        create_options_user(predicted_table);
    }else{
        alert("!!! User already exists")
    }
}

function create_new_rating(){
    var movie = document.getElementById("add_movie").value;
    var rate = document.getElementById("rate").value;

    create_new_user();

    if(movie != "" && movie!=null&& rate != "" && rate!=null && new_user != "" && new_user != null){
        if(rate < 0){
            rate = 0;
        }else if(rate > 5){
            rate = 5;
        }else{
            Math.round(rate);
        }
        table.setCell(movie, new_user, rate);
        console.log("Rating added");
    }else{
        alert("No new User")
    }

}

function create_options_user(predicted_table){
    /*
    var options = '';
    for(var i = 0; i < predicted_table.columnNames.length; i++){
        var user = predicted_table.columnNames[i];
        options += '<option value="'+user+'" ></option>';
    }
    document.getElementById('db_user_id').innerHTML = options;
    */
    for (i = 0; i < predicted_table.columnNames.length; i++) {
        var dl = document.getElementById("db_user_id");
        var option = document.createElement('option');
        var user = predicted_table.columnNames[i];
        option.value = user;
        dl.appendChild(option);
    }
}
function create_options_movie(predicted_table){
    /*
    var options = '';
    for(var i = 0; i < predicted_table.rowNames.length; i++){
        var movie = predicted_table.rowNames[i];
        options += '<option value="'+movie+'" />';
    }
    document.getElementById('db_movie_id').innerHTML = options;
    */
    for (i = 0; i < predicted_table.rowNames.length; i++) {
        var dl = document.getElementById("db_movie_id");
        var option = document.createElement('option');
        var movie = predicted_table.rowNames[i];
        option.value = movie;
        dl.appendChild(option);
    }

}
function create_options_rating(predicted_table){
    /*
    var options = '';
    for(var i = 0; i < 6; i++){
        options += '<option value="'+i+'" />';
    }
    document.getElementById('db_rating').innerHTML = options;
    */
    for (i = 0; i < 6; i++) {
        var dl = document.getElementById("db_rating");
        var option = document.createElement('option');
        option.value = i;
        dl.appendChild(option);
    }

}



d3.csv("/data/user_movie_matrix.csv", function(error, data) {
    if (error) throw error;

    var sortAscending = true;
    var table = d3.select('#matrix').append('table').attr('class',"table table-hover table-stripped");
    var titles = d3.keys(data[0]);
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
    var elem = rows.selectAll('td')
        .data(function (d) {
            return titles.map(function (k) {
                return { 'value': d[k], 'name': k};
            });
        }).enter()

    elem.append('td')
        .attr('data-th', function (d) {
            return d.name;
        })
        .text(function (d) {
            return d.value;
        }).on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

    function handleMouseOver(d, i) {  // Add interactivity

        coordinates = d3.mouse(d3.select('body').node());
        //console.log(coordinates)

        if(i != 0){
            if(d.value == 0){
                d3.select(this).style("background-color", "#990000").style("color", "white");
            }else{
                d3.select(this).style("background-color", "#33CC33").style("color", "white");
            }
            console.log("Movie Name: " + d.name);
        }

    }
    function handleMouseOut(d, i) {  // Add interactivity

        coordinates = d3.mouse(d3.select('body').node());
        //console.log(coordinates)

        if(i != 0){
            d3.select(this).style("background-color", "").style("color", "black");
        }

    }
});