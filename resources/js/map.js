// load county data
const counties = {};
d3.csv('/data/county.csv', (data) => {
  for (let row of data) {
    while (row.FIPS.length < 5) row.FIPS = '0' + row.FIPS;
    counties[row.FIPS] = row;
  }
});

function createMap() {
  var svgMap = d3.select('.county-map');
  var mapPath = d3.geoPath();
  d3.json('/data/us-10m.v1.json', (error, us) => {
    if (error) throw error;

    // alphabetize counties for easer sorted rendering later
    let d = us.objects.counties.geometries;
    d.sort((a, b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
    us.objects.counties.geometries = d;

    // create the county paths
    svgMap
      .append('g')
      .attr('class', 'counties')
      .selectAll('path')
      .data(topojson.feature(us, us.objects.counties).features)
      .enter()
      .append('path')
      .attr('d', mapPath);

    // create the county borders
    svgMap
      .append('path')
      .attr('class', 'county-borders')
      .attr('d', mapPath(topojson.mesh(us, us.objects.counties, (a, b) => { return a !== b; })));

    // create each circle per county
    svgMap
      .append('g')
      .attr('class', 'circles')
      .selectAll('circle')
      .data(topojson.feature(us, us.objects.counties).features)
      .enter()
      .append('circle')
      .attr('cx', (d) => {
        let points = d.geometry.coordinates[0];
        while (typeof points[0][0] !== 'number') points = points[0];
        let C_x = 0;
        let A = 0;
        for (let i in points.slice(0, points.length - 1)) {
          i = parseInt(i);
          let p1 = points[i];
          let p2 = points[i + 1];
          if (p2 === points[0]) break;
          A += (p1[0] * p2[1] - p2[0] * p1[1]);
        }
        A *= 0.5;
        for (let i in points.slice(0, points.length - 1)) {
          i = parseInt(i);
          let p1 = points[i];
          let p2 = points[i + 1];
          if (p2 === points[0]) break;
          C_x += ((p1[0] + p2[0]) * (p1[0] * p2[1] - p2[0] * p1[1]));
        }
        C_x *= (1 / (6 * A));
        return C_x;
      })
      .attr('cy', (d) => {
        let points = d.geometry.coordinates[0];
        while (typeof points[0][0] !== 'number') points = points[0];
        let C_y = 0;
        let A = 0;
        for (let i in points.slice(0, points.length - 1)) {
          i = parseInt(i);
          let p1 = points[i];
          let p2 = points[i + 1];
          if (p2 === points[0]) break;
          A += (p1[0] * p2[1] - p2[0] * p1[1]);
        }
        A *= 0.5;
        for (let i in points.slice(0, points.length - 1)) {
          i = parseInt(i);
          let p1 = points[i];
          let p2 = points[i + 1];
          if (p2 === points[0]) break;
          C_y += ((p1[1] + p2[1]) * (p1[0] * p2[1] - p2[0] * p1[1]));
        }
        C_y *= (1 / (6 * A));
        return C_y;
      })
      .attr('r', 2);
  });
}

createMap();
