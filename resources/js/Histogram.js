let histogramCurSelection;
let histogram;
let histogramX;
let histogramY;
let histogramHeight;

function makeHistogram(){
  // set the dimensions and margins of the graph
  let margin = {top: 30, right: 30, bottom: 50, left: 30};
  let width = 500 - margin.right - margin.left;
  let height = 500 - margin.bottom - margin.top;
  histogramHeight = height;

  histogramCurSelection = selection;
  // append the svg object to the body of the page
  d3.select(".histogram")
    .select("svg")
    .html(null);

  let svg = d3.select(".histogram")
    .select("svg")
    .append("g")
    .attr("class", "histogram-container")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  
  // X axis: scale and draw:
  let x = d3.scaleLinear()
      .domain([dataInfo[selection.x].min - 0.5*dataInfo[selection.x].stdv, 
               dataInfo[selection.x].max + 0.5*dataInfo[selection.x].stdv])
      .range([0, width]);
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  histogramX = x;
  // set the parameters for the histogram
  histogram = d3.histogram()
      .domain(x.domain())  // then the domain of the graphic
      .thresholds(x.ticks(20)); // then the numbers of bins

  // And apply this function to data to get the bins
  let bins = histogram(data[selection.x]);

  // Y axis: scale and draw:
  let y = d3.scaleLinear()
      .range([height, 0]);
      y.domain([0, d3.max(bins, function(d) { return d.length; })]);
  svg.append("g")
      .call(d3.axisLeft(y));

  histogramY = y;
  // append the bar rectangles to the svg element
  if(data.xSelected && data.xSelected.length > 0){
    bins = histogram(data.xSelected);
  }
  svg.selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
        .attr("x", 1)
        .attr("transform", function(d) { 
          return "translate(" + x(d.x0) + "," + y(d.length) + ")"; 
        })
        .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
        .attr("height", function(d) { return height - y(d.length); })
        .style("fill", "#69b3a2");

  svg.append("text")
    .attr("class", "xlabel")             
    .attr("transform",
            "translate(" + (width/2) + " ," + 
                        (height + margin.top) + ")")
    .style("text-anchor", "middle")
    .text(variableData[selection.x]['Variable Name']);
}

function updateHistogram(){
  if(selection != histogramCurSelection){;
    makeHistogram();
  }else{
    console.log((data.xSelected && (data.xSelected.length > 0)));
    d3.select(".histogram")
      .select("svg")
      .selectAll("rect")
      .data(histogram(data.xSelected && data.xSelected.length > 0 ? 
                                data.xSelected : data[selection.x]))
      .transition()
      .duration(1000)
      .attr("transform", function(d){ 
        return "translate(" + histogramX(d.x0) 
                   + "," + histogramY(d.length) + ")"; })
      .attr("height", function(d){ 
        return histogramHeight - histogramY(d.length); 
      })
  }
}