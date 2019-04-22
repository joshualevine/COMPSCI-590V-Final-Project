function makeInfoView(){

    let div = d3.select('.infoview');
    let totalSelected = d3.sum(selectedCounties);

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

        let selectedCounty;
        for(let i=0; i<selectedCounties.length; i++){
            if(selectedCounties[i]){
                selectedCounty = i;
                break;
            }
        }

        div.html(null);

        div.append('div')
            .attr('class', 'infotitle')
            .text(data['County'][selectedCounty]);

        div.append('div')
            .attr('class', 'infosubtitle')
            .text(data['State'][selectedCounty]);

        div.selectAll('.infotext')
            .data(variables)
            .enter()
            .append('div')
            .attr('class', 'infotext')
            .text(function(d){
                return d + ': ' + data[d][selectedCounty]
            })
            .style('color', function(d){
                let std = (data[d][selectedCounty] - dataInfo[d].mean)/
                            dataInfo[d].stdv;
                let lightness = 50 - 50*(Math.abs(Math.tanh(std)));
                let hue = 0;
                if(std > 0){
                    hue = 240;
                }
                return 'hsl(' + hue + ',100%,' + lightness + '%)';
            });
    }else{
        div.html(null);

        selectionInfo = {};
        selectionInfo[selection.x] = {
            max: d3.max(data.xSelected),
            min: d3.min(data.xSelected),
            mean: Math.round(d3.mean(data.xSelected) * 100)/100,
            median: d3.median(data.xSelected),
            stdv: Math.round(Math.sqrt(d3.variance(data.xSelected) * 100))/100
        };

        selectionInfo[selection.y] = {
            max: d3.max(data.ySelected),
            min: d3.min(data.ySelected),
            mean: Math.round(d3.mean(data.ySelected) * 100)/100,
            median: d3.median(data.ySelected),
            stdv: Math.round(Math.sqrt(d3.variance(data.ySelected) * 100))/100
        };

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
                .data(Object.entries(selectionInfo[d]))
                .enter()
                .append('div')
                .attr('class', 'infotext')
                .text(function(d){
                    return d[0] + ': ' + d[1];
                });
                /*.attr('color', function(d){
                    let std = (data[d][selectedCounty] - dataInfo[d].mean)/
                                dataInfo[d].stdv;
                    let lightness = 50 - 50*(Math.abs(Math.tanh(std)));
                    let hue = 0;
                    if(std > 0){
                        hue = 240;
                    }
                    return 'hsl(' + hue + ',100%,' + lightness + '%)';
                });*/
        });

    }
}

function updateInfoView(){
    makeInfoView();
}