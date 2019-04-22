let miscGraphs = {
    scatterplot:{make:makeScatterPlot,  update:updateScatterPlot},
    histogram:  {make:makeHistogram,    update:updateHistogram},
    infoview:   {make:makeInfoView,     update:updateInfoView}
};
let currentMisc = "scatterplot";

function makeMiscGraph(){

    for(let graph in miscGraphs){
        miscGraphs[graph].make();
        let div = document.getElementsByClassName(graph)[0];
        if (graph === currentMisc) {
            div.style.visibility = 'visible';
        } else {
            div.style.visibility = 'hidden';
        }
    }
}

function updateMiscGraph(){
    let graph = document.getElementById('mySelect').value;
    console.log(graph);

    for(let g in miscGraphs){
        let div = document.getElementsByClassName(g)[0];
        if (g === graph) {
            div.style.visibility = 'visible';
        } else {
            div.style.visibility = 'hidden';
        }
    }
    miscGraphs[graph].update();
}