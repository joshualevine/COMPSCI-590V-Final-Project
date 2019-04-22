let scattermargin;
let scatterwidth;
let scatterheight;
let scattermain;
let scatterg;
let scatterXaxis;
let scatterYaxis;
let scatterXscale;
let scatterYscale;

function makeScatterPlot(){
        // data that you want to plot, I've used separate arrays for x and y values
    let xdata = data[selection.x];
    let ydata = data[selection.y];

    // size and margins for the chart
    scattermargin = {top: 15, right: 15, bottom: 60, left: 20};

    scatterwidth = 500 - scattermargin.left - scattermargin.right;
    scatterheight = 500 - scattermargin.top - scattermargin.bottom;

    scatterXscale = d3.scaleLinear()
        .domain([d3.min(xdata)-1, d3.max(xdata)])  // the range of the values to plot
        .range([ 0, scatterwidth ]);        // the pixel range of the x-axis

    scatterYscale = d3.scaleLinear()
        .domain([d3.min(ydata)-1, d3.max(ydata)])
        .range([ scatterheight, 0 ]);

    // the chart object, includes all margins
    let chart = d3.select('.scatterplot')
        .select('svg')
    //.attr('width', width + margin.right + margin.left)
    //.attr('height', height + margin.top + margin.bottom)

    // the main object where the chart and axis will be drawn
    scattermain = chart.append('g')
        .attr('transform', 'translate(' + scattermargin.left + ',' 
                                        + scattermargin.top + ')')
        .attr('width', scatterwidth)
        .attr('height', scatterheight)
        .attr('class', 'main')   

    // draw the x axis
    scatterXaxis = d3.axisBottom()
        .scale(scatterXscale);

    scattermain.append('g')
        .attr('class', 'xaxis')
        .attr('transform', 'translate(0,' + scatterheight + ')')
        .call(scatterXaxis);

    // draw the y axis
    scatterYaxis = d3.axisLeft()
        .scale(scatterYscale);

    scattermain.append('g')
        .attr('class', 'yaxis')
        .call(scatterYaxis);

    // draw the graph object
    scatterg = scattermain.append("svg:g").attr("class", "dots");  

    scatterg.selectAll(".scatter-dots")
        .data(ydata)
        .enter().append("svg:circle") 
        .attr("cy", function (d,i) { return scatterYscale(ydata[i]); } )
        .attr("cx", function (d,i) { return scatterXscale(xdata[i]); } )
        .attr("r", 5) // radius of circle
        .attr("fill", "black")  
        .style("opacity", 0.075);
    
    // text label for the x axis
    scattermain.append("text")
        .attr("class", "xlabel")             
        .attr("transform",
                "translate(" + (scatterwidth/2) + " ," + 
                            (scatterheight + scattermargin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text(variableData[selection.x]['Variable Name']);

    // text label for the y axis
    scattermain.append("text")
        .attr("class", "ylabel")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - scattermargin.left - 30)
        .attr("x",0 - (scatterheight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(variableData[selection.y]['Variable Name']);    
}

function updateSelections(){
    console.log('in here!');
    scattermain.select(".dots")
        .transition("changecolor")
        .selectAll("circle")
        .attr("fill", function(d,i){
            if (selectedCounties[i] && selectedCounties[i] === 1){
                return "red";
            }
            else{
                return "black";
            }
        });
}

function updateScatterPlot(){

    let xdata = data[selection.x];
    let ydata = data[selection.y];

    scatterXscale.domain([d3.min(xdata)-1, d3.max(xdata)]);
    scatterYscale.domain([d3.min(ydata)-1, d3.max(ydata)]);

    scattermain.select(".xaxis")
        .transition()
        .duration(1000)
        .call(scatterXaxis);

    scattermain.select(".yaxis")
        .transition()
        .duration(1000)
        .call(scatterYaxis);

    scattermain.select(".xlabel")
        .text(variableData[selection.x]['Variable Name']);
        
    scattermain.select(".ylabel")
    .text(variableData[selection.y]['Variable Name']);

    scattermain.select(".dots")
        .selectAll("circle")
        .transition("move")
        .duration(1000)
        .attr("cy", function (d,i) { return scatterYscale(ydata[i]); } )
        .attr("cx", function (d,i) { return scatterXscale(xdata[i]); } );

    updateSelections();
}   