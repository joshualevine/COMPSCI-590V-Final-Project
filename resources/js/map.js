let mouseDownPoint;
let countyPoints = [];
let selectedCounties = [];
let currentMapTransform;

let mode = 'select'; // select or zoom
let selectType = 'box'; // box or click

function prepareDataForCircles(us) {
  // for each county, compute signed area of all polgyons and select largest one
  let data = topojson.feature(us, us.objects.counties).features;
  let counties = [];
  for (let county of data) {
    selectedCounties.push(0);
    let allPoints = [];
    let points = [];
    let maxArea = 0;
    for (let polygon of county.geometry.coordinates) {
      if (typeof polygon[0][0] === 'object') polygon = polygon[0];
      let area = 0;
      allPoints.push(polygon[0]);
      for (let i = 0; i < polygon.length - 1; i++) {
        let p1 = polygon[i];
        let p2 = polygon[i + 1];
        allPoints.push(p2);
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
    countyPoints.push(allPoints);
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
  var container = svgMap.append('g');
  var mapPath = d3.geoPath();
  d3.json('/data/us-10m.v1.json', (error, us) => {
    if (error) throw error;

    // alphabetize counties for easer sorted rendering later
    let d = us.objects.counties.geometries;
    d.sort((a, b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
    us.objects.counties.geometries = d;

    // create the county paths
    container
      .append('g')
      .attr('class', 'counties')
      .selectAll('path')
      .data(topojson.feature(us, us.objects.counties).features)
      .enter()
      .append('path')
      .attr('class', 'county-path')
      .attr('d', mapPath)

    // create the county borders
    container
      .append('path')
      .attr('class', 'county-borders')
      .attr('d', mapPath(topojson.mesh(us, us.objects.counties, (a, b) => {
        return a !== b;
      })));

    // create each circle per county
    container
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
      });

    // create selection rectange
    container
      .append('rect')
      .attr('class', 'selection-rect');

    // define selection box functions
    svgMap
      .on('mousedown', mapMouseDown)
      .on('mousemove', mapMouseMove)
      .on('mouseup', mapMouseUp);

    // create zoom handler 
    let zoom_handler = d3.zoom()
      .on('end', () => {
        if (d3.event.type == 'end') mapMouseUp();
      })
      .on('zoom', () => {
        if (mode === 'zoom') {
          currentMapTransform = d3.event.transform;
          container.attr('transform', currentMapTransform);
        } else {
          mapMouseMove();
        }
      });
    zoom_handler(svgMap);

    renderCircles();
  });
}

function renderCircles() {
  let size = data[selection.x];
  let color = data[selection.y];
  let minS = Math.min(...size);
  let maxS = Math.max(...size);
  let minC = Math.min(...color);
  let maxC = Math.max(...color);
  d3.select('.county-map')
    .selectAll('circle')
    .transition()
    .duration(1000)
    .attr('fill', (d, i) => {
      let o = 100 - Math.round(80 * ((color[i] - minC) / (maxC - minC))) + 20;
      //return 'rgb(0, 0, ' + o + ')';
      return 'hsl(' + 240 + ',100%,' + o + '%)';
    })
    .attr('r', (d, i) => {
      if (isNaN(d.x) || isNaN(d.y)) return 0;
      let r = 7 * ((size[i] - minS) / (maxS - minS)) + 1;
      return r;
    });
}

function mapMouseDown() {
  let point = d3.mouse(d3.select('.county-map').node());
  point = transformZoomPoint(point);
  mouseDownPoint = point;
}

function mapMouseMove() {
  if (mouseDownPoint && mode === 'select' && selectType === 'box') {
    let point = d3.mouse(d3.select('.county-map').node());
    point = transformZoomPoint(point);
    let x = 0,
      y = 0,
      w = 0,
      h = 0;
    d3.select('.selection-rect')
      .attr('x', () => {
        x = Math.min(mouseDownPoint[0], point[0]);
        return x;
      })
      .attr('y', () => {
        y = Math.min(mouseDownPoint[1], point[1]);
        return y;
      })
      .attr('width', () => {
        w = Math.abs(mouseDownPoint[0] - point[0]);
        return w;
      })
      .attr('height', () => {
        h = Math.abs(mouseDownPoint[1] - point[1]);
        return h;
      });

    d3.select('.county-map')
      .selectAll('.county-path')
      .attr('fill', (d, i) => {
        for (let p of countyPoints[i]) {
          let xCheck = (p[0] >= x) && (p[0] <= (x + w));
          let yCheck = (p[1] >= y) && (p[1] <= (y + h));
          if (xCheck && yCheck) {
            selectedCounties[i] = 1;
            return 'red';
          }
        }
        selectedCounties[i] = 0;
        return 'rgb(88, 145, 88)';
      });
  }
}

function mapMouseUp() {
  mouseDownPoint = null;
  d3
    .select('.selection-rect')
    .attr('width', 0)
    .attr('height', 0)
}

function selectMapButton(cls) {
  let select = document.getElementsByClassName('options-select')[0];
  let zoom = document.getElementsByClassName('options-zoom')[0];
  if (cls === 'select') {
    mode = 'select';
    select.style.backgroundColor = 'rgb(135, 142, 202)';
    zoom.style.backgroundColor = 'white';
  } else {
    mode = 'zoom';
    select.style.backgroundColor = 'white';
    zoom.style.backgroundColor = 'rgb(135, 142, 202)';
  }
}

function transformZoomPoint(point) {
  if (currentMapTransform) {
    let x = currentMapTransform.x,
      y = currentMapTransform.y,
      k = currentMapTransform.k;
    point[0] = (point[0] - x) / k;
    point[1] = (point[1] - y) / k;
  }
  return point;
}