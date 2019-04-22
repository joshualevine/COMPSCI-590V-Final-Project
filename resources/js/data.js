function importData(csv){
    return new Promise((resolve) => {
        d3.csv(csv, function(d){
            let county = {};
            county["County"] = d["County"];
            county["State"] = d["State"];
            delete d["County"];
            delete d["State"];
            for (let [property, value] of Object.entries(d)){
                county[property] = +value;
            }
            return county;
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

function importVariables(csv){
    return new Promise((resolve) => {
        d3.csv(csv, function(data){
            let variables = {};
            data.forEach(function(d){
                variables[d["Variable Code"]] = d;
            });
            resolve(variables);
        });
    });
}