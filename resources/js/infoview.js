let dataInfo = {};

function makeInfoView(data, variables){
    if(dataInfo.size !== 0){
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
    }

    let div = d3.select('.infoview-div');
    let totalSelected = 0;//d3.sum(selectedCounties);

    let selectedVariables;
    if(selection.x == selection.y){
        selectedVariables = [selection.x];
    }else{
        selectedVariables = [selection.x, selection.y];
    }

    if(totalSelected == 0){
        div.html(null);
        let text = div.selectAll('div')
            .data(selectedVariables)
            .enter()
            .append('div');
        text.append('div')
            .attr('class', 'infotitle')
            .text(d => d);
        text.append('div')
            .attr('class', 'infosubtitle')
            .text(d => variableData[d]['Variable Name']);
        text.each(function(d){
            d3.select(this)
                .append('div')
                .selectAll('div')
                .data(Object.entries(dataInfo[d]))
                .enter()
                .append('div')
                .attr('class', 'infotext')
                .text(function(d){
                    return d[0] + ': ' + d[1];
                });
        });
    }else if(totalSelected == 1){
        div.html(null);
        let text = div.selectAll('div')
            .data(selectedVariables)
            .enter()
            .append('div');
        text.append('div')
            .attr('class', 'infotitle')
            .text(d => d);
        text.append('div')
            .attr('class', 'infosubtitle')
            .text(d => variableData[d]['Variable Name']);
        text.each(function(d){
            d3.select(this)
                .append('div')
                .selectAll('div')
                .data(Object.entries(dataInfo[d]))
                .enter()
                .append('div')
                .attr('class', 'infotext')
                .text(function(d){
                    return d[0] + ': ' + d[1];
                })
                .append('span')
                .attr('color', function(d){
                    //standard deviations from mean
                    let lightness = 10;
                    let hue = 0;
                    if(d.value>0){
                        hue = 240;
                    }
                    return 'hsl(' + hue + ',100%,' + lightness + '%)';
                });
        });
    }else{
        div.html(null);
    }
}

function updateInfoView(data,variables){
    makeInfoView(data,variables);
}