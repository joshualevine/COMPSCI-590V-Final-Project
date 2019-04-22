function makeHistogram(){
  // set the dimensions and margins of the graph
  let margin = {top: 30, right: 30, bottom: 30, left: 30};
  let width = 500 - margin.right - margin.left;
  let height = 500 - margin.bottom - margin.top;

  // append the svg object to the body of the page
  var svg = d3.select(".histogram")
    .select("svg")
    .append("g")
    .attr("class", "histogram-container")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // X axis: scale and draw:
  var x = d3.scaleLinear()
      .domain([dataInfo[selection.x].min, dataInfo[selection.x].max])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
      .range([0, width]);
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // set the parameters for the histogram
  var histogram = d3.histogram()
      .domain(x.domain())  // then the domain of the graphic
      .thresholds(x.ticks(70)); // then the numbers of bins

  // And apply this function to data to get the bins
  var bins = histogram(data[selection.x]);

  // Y axis: scale and draw:
  var y = d3.scaleLinear()
      .range([height, 0]);
      y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
  svg.append("g")
      .call(d3.axisLeft(y));

  // append the bar rectangles to the svg element
  svg.selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
        .attr("x", 1)
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
        .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
        .attr("height", function(d) { return height - y(d.length); })
        .style("fill", "#69b3a2")
}

function updateHistogram(){
  
}