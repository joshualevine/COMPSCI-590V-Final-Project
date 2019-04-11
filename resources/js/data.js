const importData = function(csv){
    return new Promise((resolve) => {
        data = {};
        d3.csv(csv, function(d){
            let county = {};
            county["County"] = d["County"];
            county["State"] = d["State"];
            delete d["County"];
            delete d["State"];
            for (let [property, value] of Object.entries(d)){
                county[property] = +value;
            }
        },function(data){
            let properties = Object.keys(data[0]);
            let dataArrays = {};
            for(let property of properties){
                dataArrays[property] = [];
            }
            data.forEach(function(d){
                for(let property of properties){
                    dataArrays[property].push(d[property]);
                }
            });
            resolve(dataArrays);
        });
    });
}