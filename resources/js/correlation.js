function correlation(x, y){
    let xVar = d3.variance(x);
    let yVar = d3.variance(y);
    let xy = [];
    for(let i=0; i<x.length; i++){
        xy.push(x[i] + y[i]);
    }
    let xyVar = d3.variance(xy);
    let cov = (xyVar - xVar - yVar)/2;
    return cov / (Math.sqrt(xVar * yVar));
}

function calcCorrelations(data, variables){
    let correlations = [];
    for(let variable of variables){
        correlations.push({'var':variable});
    }
    
    for(let i=0; i<variables.length; i++){
        //Replace with correlations[i][variables[i]] = 1 after testing
        correlations[i][variables[i]] = correlation(data[variables[i]],
                                                    data[variables[i]]);
        for(let j=i+1; j<variables.length; j++){
            let corr = correlation(data[variables[i]],
                                   data[variables[j]]);
            correlations[i][variables[j]] = corr;
            correlations[j][variables[i]] = corr;
        }
    }
    return correlations;
}