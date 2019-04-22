let miscGraphs = {
    scatterplot:{make:makeScatterPlot,  update:updateScatterPlot},
    histogram:  {make:makeHistogram,    update:updateHistogram},
    infoview:   {make:makeInfoView,     update:updateInfoView}
};
let currentMisc = "scatterplot";

function makeMiscGraph(){

    for(let graph in miscGraphs){
        miscGraphs[graph].make();
    }
    d3.select('.misc-container')
        .selectAll('div')
        .attr('visibility', function(){
            if(d3.select(this).classed(currentMisc)){
                return 'visible';
            }else{
                return 'hidden';
            }
        });
}

function updateMiscGraph(){
    let graph = document.getElementById('mySelect').value;
    console.log(graph);

    d3.select('.misc-container')
        .selectAll('div')
        .attr('visibility', function(){
            if(d3.select(this).classed(graph)){
                return 'visible'
            }else{
                return 'hidden'
            }
        });
    miscGraphs[graph].update();
}