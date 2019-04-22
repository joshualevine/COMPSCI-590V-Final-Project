const heatMinLight = 40; 

function makeHeatmap(data, variables){

    correlations = calcCorrelations(data, variables);
    let heatmapData = makeHeatmapData(correlations);
    const margin = {top: 20, right: 20, bottom: 140, left: 140};
    const padding = 0.02;

    //Get svg for reference
    let svg = d3.select('.heatmap-container')
                .select('svg');

    const svgWidth = +svg.attr('viewBox').split(' ')[2];
    const svgHeight = +svg.attr('viewBox').split(' ')[3];
    const size = Math.min(svgWidth, svgHeight);

    selection = heatmapData[0];
    let selectedCell;

    //Add heatmap to svg
    let heatmap = svg.append('g')
                .attr('transform', 'translate(' + 
                    (margin.left + (svgWidth - size)/2) + ',' + 
                    (margin.top + (svgHeight - size)/2) + ')');

    //Calculate heatmap dimensions
    const heatmapW = size - margin.left - margin.right;
    const heatmapH = size - margin.top - margin.bottom;

    //Add x axis
    let x = d3.scaleBand()
        .range([0, heatmapW])
        .domain(variables)
        .padding(padding);
    heatmap.append('g')
        .attr('transform', 'translate(0,' + heatmapH + ') rotate(-90)')
        .call(d3.axisLeft(x))
        .selectAll('text')
        .attr('class', 'heatmap-axis-text')
        .append('title')
		.text(function(d) {
			return variableData[d]['Variable Name'];
		});

    //Add y axis
    var y = d3.scaleBand()
        .range([ heatmapH, 0 ])
        .domain(variables)
        .padding(padding);
    heatmap.append('g')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .attr('class', 'heatmap-axis-text')
        .append('title')
		.text(function(d) {
			return variableData[d]['Variable Name'];
		});

    //Create heatmap cells
    heatmap.selectAll('rect')
        .data(heatmapData, function(d) {return d.x+':'+d.y;})
        .enter()
        .append('rect')
        .attr('class', 'heatmap-cell')
        .attr('x', function(d) { return x(d.x) })
        .attr('y', function(d) { return y(d.y) })
        .attr('width', x.bandwidth() )
        .attr('height', y.bandwidth() )
        .attr('stroke-width', '1%')
        .attr('fill', function(d) { 
            let lightness = Math.round((1-Math.abs(d.value)) * 
                                        (100 - heatMinLight)) + heatMinLight;
            let hue = 0;
            if(d.value>0){
                hue = 240;
            }
            return 'hsl(' + hue + ',100%,' + lightness + '%)';
        })
        .attr('stroke', function(d) {
            if(d == selection){
                selectedCell = this;
                return 'red';
            }else{
                return 'none';
            }
        })
        .on('mouseover', function(d) {
            d3.select(this)
                .attr('stroke', 'black');
        })
        .on('mouseout', function(d) {
            if(this != selectedCell){
                d3.select(this)
                    .attr('stroke', 'none');
            }else{
                d3.select(this)
                    .attr('stroke', 'red');
            }
        })
        .on('click', function(d) {
            if(this != selectedCell){
                selection = d;
                d3.select(selectedCell)
                    .attr('stroke', 'none');
                selectedCell = this;
            }
            renderCircles();
            updateInfoView(data,variables);
        })
        .append('title')
		.text(function(d) {
            return variableData[d.x]['Variable Name'] + '\n' +
                   variableData[d.y]['Variable Name'] ;
		});
    
    //Add text displaying correlation to heatmap cells
    heatmap.selectAll('text')
        .data(heatmapData, function(d) {return d.x+':'+d.y;})
        .enter()
        .append('text')
        .attr('class', 'heatmap-cell-text')
        .attr('font-size', Math.round(x.bandwidth()/2.5) + 'px')
        .text(function(d) {
            return Math.round(d.value * 100) / 100;
        })
        .attr('x', function(d, i) {
            return x(d.x) + x.bandwidth() / 2;
        })
        .attr('y', function(d) {
            return y(d.y) + y.bandwidth() / 2;
        });
}

function updateHeatmap(data, variables){
    let correlations = calcCorrelations(data, variables);
    let heatmapData = makeHeatmapData(correlations);
    d3.select('.heatmap-container')
        .selectAll('.heatmap-cell')
        .data(heatmapData, function(d) {return d.x+':'+d.y;})
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr('fill', function(d) { 
            let lightness = Math.round((1-Math.abs(d.value)) * 
                                        (100 - heatMinLight)) + heatMinLight;
            let hue = 0;
            if(d.value>0){
                hue = 240;
            }
            return 'hsl(' + hue + ',100%,' + lightness + '%)';
        })
}

function makeHeatmapData(data){
    heatmapData = [];
    for(let elem of data){
        let variable = elem['var'];
        for(let [key, value] of Object.entries(elem)){
            if(key != 'var'){
                heatmapData.push({'x':variable, 'y':key, 'value':value});
            }
        }
    }
    return heatmapData
}