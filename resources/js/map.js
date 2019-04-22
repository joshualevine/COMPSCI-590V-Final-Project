let mouseDownPoint;
let countyPoints = [];
let selectedCounties = [];
let currentMapTransform;

let mode = 'select'; // select or zoom
let selectType = 'reset'; // reset, merge or remove

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
      .on('click', (d, i) => {
        if (mode === 'select') {
          d3.select('.county-map')
            .selectAll('.county-path')
            .attr('fill', (d, k) => {
              if (selectType === 'reset') {
                if (i === k) {
                  return colorCounty(k, 1);
                } else {
                  return colorCounty(k, 0);
                }
              } else if (selectType === 'merge') {
                if (i === k) {
                  return colorCounty(k, 1);
                } else {
                  if (selectedCounties[k] === 1) {
                    return colorCounty(k, 1);
                  } else {
                    return colorCounty(k, 0);
                  }
                }
              } else { // remove
                if (i === k) {
                  return colorCounty(k, 0);
                } else {
                  if (selectedCounties[k] === 1) {
                    return colorCounty(k, 1);
                  } else {
                    return colorCounty(k, 0);
                  }
                }
              }
            });
          setTimeout(() => {
            updateGlobalSelectedData();
          }, 100);
        }
      });

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
    let zoom_handler = d3
      .zoom()
      .scaleExtent([0.5, 3])
      .translateExtent([[-100, -100], [960, 600]])
      .on('end', () => {
        if (d3.event.type == 'end') mapMouseUp();
      })
      .on('zoom', () => {
        if (mode === 'zoom') {
          currentMapTransform = d3.event.transform;
          container.attr('transform', currentMapTransform);
          scaleCircles();
        } else {
          mapMouseMove();
        }
      });
    zoom_handler(svgMap);

    renderCircles();
  });
}

function renderCircles() {
  updateGlobalSelectedData();
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
      return r / ((currentMapTransform || {}).k || 1);
    });
}

function mapMouseDown() {
  let point = d3.mouse(d3.select('.county-map').node());
  point = transformZoomPoint(point);
  mouseDownPoint = point;
}

function mapMouseMove() {
  if (mouseDownPoint && mode === 'select') {
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
          if (selectType === 'merge' && selectedCounties[i] === 1) {
            return colorCounty(i, 1);
          }
          let xCheck = (p[0] >= x) && (p[0] <= (x + w));
          let yCheck = (p[1] >= y) && (p[1] <= (y + h));
          if (xCheck && yCheck) {
            if (selectType === 'remove') {
              return colorCounty(i, 0);
            } else {
              return colorCounty(i, 1);
            }
          }
        }
        if (selectType !== 'remove') {
          return colorCounty(i, 0);
        } else {
          if (selectedCounties[i] === 1) {
            return colorCounty(i, 1);
          } else {
            return colorCounty(i, 0);
          }
        }
      });
    setTimeout(() => {
      updateGlobalSelectedData();
    }, 100);
  }
}

function mapMouseUp() {
  mouseDownPoint = null;
  d3
    .select('.selection-rect')
    .attr('width', 0)
    .attr('height', 0)
  setTimeout(() => {
    updateGlobalSelectedData();
  }, 100);
}

function selectMapButton(cls) {
  let select = document.getElementsByClassName('options-select')[0];
  let zoom = document.getElementsByClassName('options-zoom')[0];
  let reset = document.getElementsByClassName('options-reset')[0];
  let merge = document.getElementsByClassName('options-merge')[0];
  let remove = document.getElementsByClassName('options-remove')[0];
  if (cls === 'select') {
    mode = 'select';
    select.style.backgroundColor = 'rgb(135, 142, 202)';
    zoom.style.backgroundColor = 'white';
  } else if (cls === 'zoom') {
    mode = 'zoom';
    select.style.backgroundColor = 'white';
    zoom.style.backgroundColor = 'rgb(135, 142, 202)';
  } else if (cls === 'reset') {
    selectType = 'reset';
    reset.style.backgroundColor = 'rgb(135, 142, 202)';
    merge.style.backgroundColor = 'white';
    remove.style.backgroundColor = 'white';
    mode = 'select';
    select.style.backgroundColor = 'rgb(135, 142, 202)';
    zoom.style.backgroundColor = 'white';
  } else if (cls === 'merge') {
    selectType = 'merge';
    reset.style.backgroundColor = 'white';
    merge.style.backgroundColor = 'rgb(135, 142, 202)';
    remove.style.backgroundColor = 'white';
    mode = 'select';
    select.style.backgroundColor = 'rgb(135, 142, 202)';
    zoom.style.backgroundColor = 'white';
  } else if (cls === 'remove') {
    selectType = 'remove';
    reset.style.backgroundColor = 'white';
    merge.style.backgroundColor = 'white';
    remove.style.backgroundColor = 'rgb(135, 142, 202)';
    mode = 'select';
    select.style.backgroundColor = 'rgb(135, 142, 202)';
    zoom.style.backgroundColor = 'white';
  } else { // reset map!
    var container = d3.select('.county-map').select('g');
    container.attr('transform', d3.zoomIdentity);
    currentMapTransform = d3.zoomIdentity;
    scaleCircles();
    d3.select('.county-map')
      .selectAll('.county-path')
      .attr('fill', (d, i) => {
        return colorCounty(i, 0);
      });
    setTimeout(() => {
      updateGlobalSelectedData();
    }, 100);
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

function colorCounty(index, type) {
  if (type === 0) {
    selectedCounties[index] = 0;
    return 'white';
  } else {
    selectedCounties[index] = 1;
    return 'rgb(189,41,0)';
  }
}

function updateGlobalSelectedData() {
  // update selected counties in global data structure
  let xSelected = [],
    ySelected = [];
  for (let i = 0; i < data[selection.x].length; i++) {
    if (selectedCounties[i] === 1) {
      xSelected.push(data[selection.x][i]);
      ySelected.push(data[selection.y][i]);
    }
  }
  data.xSelected = xSelected;
  data.ySelected = ySelected;
  updateMiscGraph();
}

function scaleCircles() {
  let size = data[selection.x];
  let color = data[selection.y];
  let minS = Math.min(...size);
  let maxS = Math.max(...size);
  let minC = Math.min(...color);
  let maxC = Math.max(...color);
  d3.select('.county-map')
    .selectAll('circle')
    .attr('r', (d, i) => {
      if (isNaN(d.x) || isNaN(d.y)) return 0;
      let r = 7 * ((size[i] - minS) / (maxS - minS)) + 1;
      return r / ((currentMapTransform || {}).k || 1);
    });
}