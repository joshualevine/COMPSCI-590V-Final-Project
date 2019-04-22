let heatmapTestData = {'a':[1,2,3,4,5,6,7,8,9,10],
				'b':[1,2,3,4,5,6,7,8,9,10], 
				'c':[1,3,4,5,6,5,8,10,8,9], 
				'd':[5,3,8,2,8,4,6,2,1,5],
                'e':[10,8,5,7,5,4,1,2,3,1]};

let heatmapVar = Object.keys(heatmapTestData);

let selection;
let variableData;
let data;
let correlations;
let dataInfo = {};
let variables;

let dataImport = importData('data/final_dataset.csv');

let variableDataImport = importVariables('data/variables.csv');

Promise.all([dataImport, variableDataImport]).then(
	function(results) {
		data = results[0];
		variableData = results[1];
		variables = Object.keys(data).slice(3);
		for(let variable of variables){
            dataInfo[variable] = {
                max: d3.max(data[variable]),
                min: d3.min(data[variable]),
                mean: Math.round(d3.mean(data[variable]) * 100)/100,
                median: d3.median(data[variable]),
                stdv: Math.round(Math.sqrt(
                        d3.variance(data[variable])) * 100)/100
            };
        }
		makeHeatmap();
		createMap();
		//makeForceGraph(correlations, variables);
		makeMiscGraph();
	});
