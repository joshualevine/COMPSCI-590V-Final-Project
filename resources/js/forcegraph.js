function makeForceGraph(data, variables){
    let svg = d3.select(".misc-container")
                .select("svg");

    const svgWidth = +svg.attr('viewBox').split(" ")[2];
    const svgHeight = +svg.attr('viewBox').split(" ")[3];

    let radius = svgWidth/(3*variables.length);

    let nodes = Array.from(variables, function(x){return {name: x};});
    console.log(nodes);
    let links = [];
    let variableList = variables.slice();
    for(let i=0; i<correlations.length; i++){
        variableList = variableList.filter(function(d){
                                return d !== variables[i];
                            });
        for(let variable of variableList){
            if(correlations[i][variable] > 0.5){
                links.push({source: i, 
                            target: variables.indexOf(variable)});
            }
        }
    }
    console.log(links);
    

    let edges = svg.selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .style("stroke", "#ccc")
        .style("stroke-width", 1);
    
    let nodesDisp = svg.selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("r", radius)     
        .call(d3.drag()
            .on("start", dragStarted)
            .on("drag", dragging)
            .on("end", dragEnded));
    nodesDisp.append("title")
        .text(function(d) {
            return variableData[d.name]["Variable Name"];
        });


    let force = d3.forceSimulation(nodes)
                    .force("charge", d3.forceManyBody()
                        .strength(-50))
                    .force("link", d3.forceLink(links)
                        .distance(radius*3.5))
                    .force("center", d3.forceCenter()
                        .x(svgWidth/2)
                        .y(svgHeight/2));

    force.on("tick", function() {
        edges.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
        nodesDisp.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
    });

    function dragStarted(d) {
        if (!d3.event.active) force.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragging(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragEnded(d) {
        if (!d3.event.active) force.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

function updateForceGraph(data, variables){
    return;
}