let margin;
let width;
let height;
let main;
let g;

function makeScatterPlot(){
        // data that you want to plot, I've used separate arrays for x and y values
    let xdata = [];
    let ydata = [];

    var xaxis = selection["x"];
    var yaxis = selection["y"];

    for(let i = 0; i < data[xaxis].length; i++){
        xdata.push(data[xaxis][i]);
    }

    for(let i = 0; i < data[yaxis].length; i++){
        ydata.push(data[yaxis][i]);
    }

    // size and margins for the chart
    margin = {top: 15, right: 15, bottom: 10, left: 60};

    width = 500 - margin.left - margin.right;
    height = 500 - margin.top - margin.bottom;

    var x = d3.scaleLinear()
        .domain([d3.min(xdata)-1, d3.max(xdata)])  // the range of the values to plot
        .range([ 0, width ]);        // the pixel range of the x-axis

    var y = d3.scaleLinear()
        .domain([d3.min(ydata)-1, d3.max(ydata)])
        .range([ height, 0 ]);

    // the chart object, includes all margins
    var chart = d3.select('.misc')
    .attr('width', width + margin.right + margin.left)
    .attr('height', height + margin.top + margin.bottom)

    // the main object where the chart and axis will be drawn
    main = chart.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'main')   

    // draw the x axis
    var xAxis = d3.axisBottom()
    .scale(x);

    main.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .attr('class', 'yaxis')
    .call(xAxis);

    // draw the y axis
    var yAxis = d3.axisLeft()
    .scale(y);

    main.append('g')
    .attr('transform', 'translate(0,0)')
    .attr('class', 'xaxis')
    .call(yAxis);

    // draw the graph object
    g = main.append("svg:g").attr("class", "dots");  

    g.selectAll(".scatter-dots")
    .data(ydata)
    .enter().append("svg:circle") 
    .attr("cy", function (d,i) { return y(ydata[i]); } )
    .attr("cx", function (d,i) { return x(xdata[i]); } )
    .attr("r", 5) // radius of circle
    .attr("fill", function(d,i){
        if(i < 1500){
            return "red";
        }
        else{
            return "blue";
        }
    })  
    .style("opacity", 0.025);
}

function updateScatterPlot(){
    let xdata = [];
    let ydata = [];

    var xaxis = selection["x"];
    var yaxis = selection["y"];


    for(let i = 0; i < data[xaxis].length; i++){
        xdata.push(data[xaxis][i]);
    }
    
    for(let i = 0; i < data[yaxis].length; i++){
        ydata.push(data[yaxis][i]);
    }

    var x = d3.scaleLinear()
        .domain([d3.min(xdata)-1, d3.max(xdata)])  // the range of the values to plot
        .range([ 0, width ]);        // the pixel range of the x-axis

    var y = d3.scaleLinear()
        .domain([d3.min(ydata)-1, d3.max(ydata)])
        .range([ height, 0 ]);
    var xAxis = d3.axisBottom()
        .scale(x);

    var yAxis = d3.axisLeft()
        .scale(y);

    main.select(".xaxis")
        .transition()
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);
    main.select(".yaxis")
        .transition()
        .attr('transform', 'translate(0,0)')
        .call(yAxis);

    main.select(".dots")
        .selectAll("circle")
        .transition()
        .duration(300)
        .attr("cy", function (d,i) { return y(ydata[i]); } )
        .attr("cx", function (d,i) { return x(xdata[i]); } );
}   