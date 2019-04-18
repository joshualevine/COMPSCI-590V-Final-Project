let heatmapTestData = {'a':[1,2,3,4,5,6,7,8,9,10],
				'b':[1,2,3,4,5,6,7,8,9,10], 
				'c':[1,3,4,5,6,5,8,10,8,9], 
				'd':[5,3,8,2,8,4,6,2,1,5],
                'e':[10,8,5,7,5,4,1,2,3,1]};

let heatmapVar = Object.keys(heatmapTestData);

let selection;

let data = importData("/data/insecurity.csv");

data.then(
	function(data){
		let variables = Object.keys(data).slice(3);
		makeHeatmap(data, variables);
	}
);

//makeHeatmap(heatmapTestData, heatmapVar);