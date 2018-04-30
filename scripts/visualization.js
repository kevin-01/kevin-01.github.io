var svg = d3.select(".svg_first"),
    width = +svg.attr("width"),
    height = +svg.attr("height");
active = d3.select(null);

var format = d3.format(",d");
var avg = "";

var color = d3.scaleOrdinal(d3.schemeCategory20c);

var pack1 = d3.pack()
    .size([width, height])
    .padding(1.5);

var user_research = "1666394";
var dico_avg_movies = {};
var dico_circle_movies = {};
var prev_movie = "";
var note_movie = 0;
var count = 0;
var add_movie = 0;

function do_svg() {

    d3.csv("/data/data_vis.csv", function(d) {
        var user = d.id.split(".")[1];
        var movie = d.id.split(".")[0];
        d.value = +d.value;

        if(!d.value){
            prev_movie = movie;
            if(add_movie > 3) {
                dico_avg_movies[movie] = note_movie / count;
                count = 0;
                note_movie = 0;
            }
        }else{
            count = count + 1;
            note_movie = note_movie + d.value;
        }
        add_movie = add_movie + 1;

        create_list_user(user);

        if (d.value && user == user_research){
            return d;
        }

    }, function(error, classes) {
        if (error) throw error;

        //export_data_vis();
        var root = d3.hierarchy({children: classes})
            .sum(function(d) { return d.value; })
            .each(function(d) {
                if (id = d.data.id) {
                    var id, i = id.lastIndexOf(".");
                    d.id = id;
                    d.package = id.slice(0, i);
                    d.class = id.slice(i + 1);
                }
            });

        var node = svg.selectAll(".node")
            .data(pack1(root).leaves())
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

        node.append("circle")
            .attr("id", function(d) { return d.id; })
            .attr("r", function(d) { return d.r; })
            .style("fill", function(d) {

                //var linearScale = d3.scaleLinear().domain([0,100]).range([75,255]);
                var red = "#8d0a15";
                var orange = "#f46500";
                var yellow = "#ffce00";
                var y_g = "#ADFF2F";
                var green = "#4d7701";
                var red_orange = d3.scaleLinear().domain([0, 100]).range([red, orange]);
                var orange_yellow = d3.scaleLinear().domain([0, 100]).range([orange, yellow]);
                var yellow_blue = d3.scaleLinear().domain([0, 100]).range([yellow, y_g]);
                var blue_green = d3.scaleLinear().domain([0, 100]).range([y_g, green]);
                var new_elem = 0;
                if(d.value <= 200){
                    if(d.value < 100){
                        return red;
                    }else{
                        new_elem = d.value - 100;
                        return red_orange(new_elem)
                    }
                    //return "rgb("+linearScale(new_elem) + "," +linearScale(100-new_elem) +"," + 0 + ")";
                }else if(d.value > 200 && d.value <= 300){
                    new_elem = d.value - 200;
                    return orange_yellow(new_elem)
                    //return "rgb("+0 + "," +linearScale(new_elem) +"," + linearScale(100-new_elem) + ")";
                }else if(d.value > 300 && d.value <= 400){
                    new_elem = d.value - 300;
                    return yellow_blue(new_elem)
                    //return "rgb("+linearScale(new_elem) + "," +linearScale(new_elem) +"," + linearScale(100-new_elem) + ")";
                }else {
                    if(d.value > 500){
                        return green;
                    }else{
                        new_elem = d.value - 400;
                        return blue_green(new_elem)
                    }
                }

            })
            .on("click", function(d) {
                avg = d3.select(".avg");
                var movie_name = d.class;
                var movie_value = d.value / 100.0;
                var movie_avg = dico_avg_movies[movie_name] / 100.0;
                console.log(movie_avg)
                if(isNaN(movie_avg)){
                    movie_avg = 3.02;
                }
                var movie_name_splitted = movie_name.split(" ");
                if(movie_name_splitted.length > 3){
                    movie_name = movie_name_splitted[0]+" " + movie_name_splitted[1]+" " + movie_name_splitted[2];
                }

                if(movie_name in dico_circle_movies){
                    delete dico_circle_movies[movie_name];
                    d3.selectAll(".movie_avg").remove();

                    var keys = Object.keys(dico_circle_movies);
                    for (var i = 0; i < keys.length; i++) {
                        avg.append("g").attr("class", "movie_avg").attr("style","font: 11px arial, sans-serif").html(keys[i]  + " {Note: " + dico_circle_movies[keys[i]][0].toFixed(2) + " AVG: " +  dico_circle_movies[keys[i]][1].toFixed(2) + "}<br>");
                    }
                }else{
                    dico_circle_movies[movie_name] = [];
                    dico_circle_movies[movie_name].push(movie_value);
                    dico_circle_movies[movie_name].push(movie_avg);

                    avg.append("g").attr("class", "movie_avg").attr("style","font: 11px arial, sans-serif").html(movie_name  + " {Note: " + movie_value.toFixed(2) + ", AVG: " + movie_avg.toFixed(2) + "}<br>");
                }
            });

        node.append("clipPath")
            .attr("id", function(d) { return "clip-" + d.id; })
            .append("use")
            .attr("xlink:href", function(d) { return "#" + d.id; });

        node.append("text")
            .attr("clip-path", function(d) { return "url(#clip-" + d.id + ")"; })
            .selectAll("tspan")
            .data(function(d) { return d.class.split(/(?=[A-Z][^A-Z])/g); })
            .enter().append("tspan")
            .attr("x", 0)
            .attr("y", function(d, i, nodes) { return 13 + (i - nodes.length / 2 - 0.5) * 10; })
            .text(function(d) { return d; });

        node.append("title")
            .text(function(d) {
                var list_elem = d.id.split(".");
                return "Movie: " + list_elem[0] + "\n" + "User: " + list_elem[1] + "\n" +"Value: " + format(d.value) / 100.0; });

    });

    d3.selectAll(".movie_avg").remove();

}

function export_data_vis(){ // a faire en json mais comment faire XD et après fini

    var csvContent = "data:text/csv;charset=utf-8,";

    var keys = Object.keys(dico_avg_movies);
    for(var i = 0; i < keys.length; ++i){
        var movie = keys[i];
        var rate = dico_avg_movies[movie] / 10.0;
        var rate_check = Math.round(dico_avg_movies[movie] / 100.0);
        if(isNaN(rate)){
            rate = 3.01
            rate_check = 3.01
        }
        var cluster_movie = 0;

        if(rate_check <= 1){
            cluster_movie = 1;
        }else if(rate_check <= 2){
            cluster_movie = 2;
        }else if(rate_check <= 3){
            cluster_movie = 3;
        }else if(rate_check <= 4){
            cluster_movie = 4;
        }else{
            cluster_movie = 5;
        }

        csvContent += movie + "," + rate + "," + cluster_movie + "\r\n";
    }

    var encodedUri = encodeURI(csvContent);
    window.open(encodedUri);

    console.log("Exported");

}

function choose_user(){
    var usr = document.getElementById("choose_usr").value;

    if(usr != "" && usr!=null){
        d3.select(".svg_first").remove();
        svg = d3.select("#svg_user").append("svg");
        svg.attr("class", "svg_first").attr("width", width).attr("height", height).attr("font-family", "sans-serif").attr("font-size", 10).attr("text-anchor","middle").attr("data-step","5").attr("data-intro","In this section, you will be able to see more precisely the results of the movies found for each user. The different colors tell you the different values ​​found and if you leave your cursor on a circle, you will have all the information about it.");
        user_research = usr;
        do_svg();

    }else{
        alert("No new User")
    }

}

create_legend()
function create_legend(){
    var g_legend = d3.selectAll("#legend");

    g_legend.append("span").attr("style","text-decoration:underline").append("text").html("Color Legend: <br>");
    g_legend.append("svg").attr("class","svg_legend").append("circle").attr("class","circle_legend").attr("fill","#8d0a15");
    g_legend.append("g").html(" = The user will hate the movie (rating < 1.5) <br>");
    g_legend.append("svg").attr("class","svg_legend").append("circle").attr("class","circle_legend").attr("fill","#f46500");
    g_legend.append("g").html(" = The user won't like the movie (rating < 2.5) <br>");
    g_legend.append("svg").attr("class","svg_legend").append("circle").attr("class","circle_legend").attr("fill","#ffce00");
    g_legend.append("g").html(" = The user will like the movie (rating < 3.5) <br>");
    g_legend.append("svg").attr("class","svg_legend").append("circle").attr("class","circle_legend").attr("fill","#ADFF2F");
    g_legend.append("g").html(" = The user wil enjoy the movie (rating < 4.5) <br>");
    g_legend.append("svg").attr("class","svg_legend").append("circle").attr("class","circle_legend").attr("fill","#4d7701");
    g_legend.append("g").html(" = The user will absolutely love the movie (rating >= 5) <br>");

}

var all_users = [];

function create_list_user(user){
    if (all_users.indexOf(user) < 0 && user != undefined) {
        all_users.push(user);
        var dl = document.getElementById("db_users");
        var option = document.createElement('option');
        option.value = user;
        dl.appendChild(option);
    }

}

do_svg();


var svg2 = d3.select(".svg_second"),
    margin = 20,
    diameter = +svg2.attr("width"),
    g = svg2.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

var color = d3.scaleLinear()
    .domain([29, 70])
    //.range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
    .range(["#8d0a15", "#4d7701"])
    .interpolate(d3.interpolateHcl);

var pack2 = d3.pack()
    .size([diameter - margin, diameter - margin])
    .padding(2);

d3.json("/data/bubble.json", function(error, root) {
    if (error) throw error;

    root = d3.hierarchy(root)
        .sum(function(d) { return d.size; })
        .sort(function(a, b) { return b.value - a.value; });

    var focus = root,
        nodes = pack2(root).descendants(),
        view;

    var circle = g.selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("class", function(d) { return d.parent ? d.children ? "node2" : "node2 node2--leaf" : "node2 node2--root"; })
        .style("fill", function(d) {

            if(d.children && d.data.name == "users"){
                return "rgb(117, 220, 205)";
            }else if(d.children && d.r <= 35){
                return "#8d0a15";
            }
            else if(d.children && d.r <= 42){
                return "#f46500";
            }
            else if(d.children && d.r <= 50){
                return "#ffce00";
            }
            else if(d.children && d.r <= 60){
                return "#ADFF2F";
            }
            else if(d.children && d.r <= 70){
                return "#4d7701";
            }
            else{
                return null;
            }

            /*

            if(d.children && d.data.name == "users"){
                return "rgb(117, 220, 205)";
            }else if(d.children && d.r <= 35){
                return "#8d0a15";
            }
            else if(d.children && d.r <= 40){
                return "#4B0082";
            }
            else if(d.children && d.r <= 45){
                return "#f46500";
            }
            else if(d.children && d.r <= 50){
                return "#ffce00";
            }
            else if(d.children && d.r <= 55){
                return "#00BFFF";
            }
            else if(d.children && d.r <= 60){
                return "#FF69B4";
            }
            else if(d.children && d.r <= 65){
                return "#ADFF2F";
            }
            else if(d.children && d.r <= 70){
                return "#4d7701";
            }
            else{
                return null;
            }
            */
        })
        .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

    var text = g.selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("class", "label")
        .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
        .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
        .text(function(d) { return d.data.name; });

    var node = g.selectAll("circle,text");

    svg2
        .on("click", function() { zoom(root); });

    zoomTo([root.x, root.y, root.r * 2 + margin]);

    function zoom(d) {
        if(d.data.name != "users"){
            document.getElementById("choose_usr").value = d.data.name;
            choose_user();
        }
        var focus0 = focus; focus = d;

        var transition = d3.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .tween("zoom", function(d) {
                var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                return function(t) { zoomTo(i(t)); };
            });

        transition.selectAll("text")
            .filter(function(d) { if(typeof d !== 'undefined'){ return d.parent === focus || this.style.display === "inline"; }})
            .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
            .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
            .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
    }

    function zoomTo(v) {
        var k = diameter / v[2]; view = v;
        node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
        circle.attr("r", function(d) { return d.r * k; });
    }
});

var svg3 = d3.select(".svg_third"),
    width = +svg3.attr("width"),
    height = +svg3.attr("height");

var color = [ "#8d0a15", "#f46500","#ffce00", "#ADFF2F", "#4d7701"]

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody().strength(-50))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX().strength(0.1))
    .force("y", d3.forceY().strength(0.1));

d3.json("/data/vis2.json", function(error, graph) {
    if (error) throw error;

    var link = svg3.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

    var node = svg3.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("r", 10)
        .attr("fill", function(d) { return color[d.group-1]; })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("title")
        .text(function(d) {return d.id + " {Group: " +d.group + "}"; });

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    }
});

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}