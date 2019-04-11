// load county data
var counties = {};
d3.csv('/data/county.csv', (data) => {
  for (let row of data) {
    while (row.FIPS.length < 5) row.FIPS = '0' + row.FIPS;
    counties[row.FIPS] = row;
  }
});

// create map
var svgMap = d3.select('.county-map');
var mapPath = d3.geoPath();
d3.json('https://d3js.org/us-10m.v1.json', (error, us) => {
  if (error) throw error;

  svgMap.append('g')
    .attr('class', 'counties')
    .selectAll('path')
    .data(topojson.feature(us, us.objects.counties).features)
    .enter().append('path')
    .attr('d', mapPath)
    .on('mouseover', (d) => {
      let loc = counties[d.id].County + ', ' + counties[d.id].State;
      console.log(loc);
      document.getElementById('my-text').innerHTML = loc;
    });

    svgMap.append('path')
    .attr('class', 'county-borders')
    .attr('d', mapPath(topojson.mesh(us, us.objects.counties, function (a, b) { return a !== b; })));
});