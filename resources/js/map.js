// load county data
// const counties = {};
// d3.csv('/data/county.csv', (data) => {
//   for (let row of data) {
//     while (row.FIPS.length < 5) row.FIPS = '0' + row.FIPS;
//     counties[row.FIPS] = row;
//   }
// });

function prepareDataForCircles(us) {
  // for each county, compute signed area of all polgyons and select largest one
  let data = topojson.feature(us, us.objects.counties).features;
  let counties = [];
  for (let county of data) {
    let points = [];
    let maxArea = 0;
    for (let polygon of county.geometry.coordinates) {
      if (typeof polygon[0][0] === 'object') polygon = polygon[0];
      let area = 0;
      for (let i = 0; i < polygon.length - 1; i++) {
        let p1 = polygon[i];
        let p2 = polygon[i + 1];
        area += (p1[0] * p2[1] - p2[0] * p1[1]);
      }
      if (area > maxArea) {
        maxArea = area * 0.5;
        points = JSON.parse(JSON.stringify(polygon));
      }
    }
    counties.push({
      area: maxArea,
      points: points
    });
  }

  // for each county, compute x and y position on map of centroid
  for (let county of counties) {
    let x = 0;
    let y = 0;
    for (let i = 0; i < county.points.length - 1; i++) {
      let p1 = county.points[i];
      let p2 = county.points[i + 1];
      x += ((p1[0] + p2[0]) * (p1[0] * p2[1] - p2[0] * p1[1]));
      y += ((p1[1] + p2[1]) * (p1[0] * p2[1] - p2[0] * p1[1]));
    }
    x *= (1 / (6 * county.area));
    y *= (1 / (6 * county.area));
    county.x = x;
    county.y = y;
    delete county.area;
    delete county.points;
  }

  return counties;
}

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
      .data(prepareDataForCircles(us))
      .enter()
      .append('circle')
      .attr('class', 'county-circle')
      .attr('cx', (d) => {
        return d.x;
      })
      .attr('cy', (d) => {
        return d.y;
      })
      .attr('r', (d) => {
        let r = Math.max(1, Math.round(Math.random() * 8));
        return r;
      })
  });
}

function randomizeCircles() {
  d3.select('.county-map')
    .selectAll('circle')
    .transition()
    .duration(1000)
    .attr('r', (d) => {
      let r = Math.max(1, Math.round(Math.random() * 8));
      return r;
    });
}

createMap();

setInterval(() => {
  randomizeCircles();
}, 2000);
