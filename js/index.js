'use strict';


(function() {

  let data = "no data";
  let allYearsData = "no data";
  let svgScatterPlot = ""; 
  let svgLineGraph = "";
  let div = '';

  window.onload = function() {
    svgLineGraph = d3.select("body")
      .append('svg')
      .attr('width', 500)
      .attr('height', 500);

      svgScatterPlot = d3.select('body')
      .append('svg')
      .attr('width', 500)
      .attr('height', 500);

    d3.csv("./data/dataEveryYear.csv")
      .then((csvData) => {
        console.log(csvData)
        data = csvData
        allYearsData = csvData;
        makeLineGraph('AUS');
        makeDropDown();
      });
  }

  function makeScatterPlot() {
    let fertility_rate_data = data.map((row) => parseFloat(row["fertility_rate"]));
    let life_expectancy_data = data.map((row) => parseFloat(row["life_expectancy"]));

    let axesLimits = findMinMax(fertility_rate_data, life_expectancy_data);

    let mapFunctions = drawAxes(axesLimits, "fertility_rate", "life_expectancy", svgScatterPlot, {min: 50, max: 450}, {min: 50, max: 450});

    plotData(mapFunctions);

    makeLabels();
  }

  function makeLabels() {
    svgScatterPlot.append('text')
      .attr('x', 20)
      .attr('y', 30)
      .style('font-size', '14pt')
      .text("Life Expectancy vs Fertility Rate");

    svgScatterPlot.append('text')
      .attr('x', 50)
      .attr('y', 490)
      .style('font-size', '10pt')
      .text('Fertility Rates');

    svgScatterPlot.append('text')
      .attr('transform', 'translate(15, 300)rotate(-90)')
      .style('font-size', '10pt')
      .text('Life Expectancy');
  }

  function plotData(map) {
    let xMap = map.x;
    let yMap = map.y;

    svgScatterPlot.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
        .attr('cx', xMap)
        .attr('cy', yMap)
        .attr('r', '5')
        .attr('fill', "#4286f4");
  }

  /////////////////

  function makeDropDown() {
    var location = allYearsData.map((row) => row['location'])

    var distinct = (value, index, self) => {
        return self.indexOf(value) == index;
    }
    var distinctLoc = location.filter(distinct);
        var dropDown = d3.select("body").append("select")
                    .attr("name", "country-list");
        var options = dropDown.selectAll("option")
                    .data(distinctLoc)
                    .enter()
                    .append("option");
                    
        options.text(function(d) {
                    return d
                })
                .attr("value", function(d) {return d});
    
        dropDown.on("change", function() {
            var selected = this.value;
            d3.selectAll("svg > *").remove()
            makeLineGraph(selected);
        })
}

  function makeLineGraph(country) {
    svgLineGraph.html("");
    let countryData = allYearsData.filter((row) => row["location"] == country);
    let timeData = countryData.map((row) => row["time"]);
    let pop_data = countryData.map((row) => +row["pop_mlns"]);

    let minMax = findMinMax(timeData, pop_data);

    let funcs = drawAxes(minMax, "time", "pop_mlns", svgLineGraph, {min: 50, max: 450}, {min: 50, max: 450});
    plotLineGraph(funcs, countryData, country);
    svgScatterPlot = div
    .append('svg')
    .attr('width', 500)
    .attr('height', 500);

  }

  function plotLineGraph(funcs, countryData, country) {
    let line = d3.line()
      .x((d) => funcs.x(d))
      .y((d) => funcs.y(d));
      div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
    svgLineGraph.append('path')
      .datum(countryData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line)
      .on('mouseover', (d) => {
        div.transition()
        .duration(200)
        .style("opacity", .9);
        div.style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY ) + "px")
            .append(makeScatterPlot(div));
      })
      .on("mouseout", (d) => {
        div.transition()
          .duration(500)
          .style("opacity", 0);
      });

    svgLineGraph.append('text')
      .attr('x', 230)
      .attr('y', 490)
      .style('font-size', '10pt')
      .text('Year');

    svgLineGraph.append('text')
      .attr('x', 230)
      .attr('y', 30)
      .style('font-size', '14pt')
      .text(country);

    svgLineGraph.append('text')
      .attr('transform', 'translate(15, 300)rotate(-90)')
      .style('font-size', '10pt')
      .text('Population Size');
  }

  function drawAxes(limits, x, y, svg, rangeX, rangeY) {
    let xValue = function(d) { return +d[x]; }

    let xScale = d3.scaleLinear()
      .domain([limits.xMin, limits.xMax])
      .range([rangeX.min, rangeX.max]);

    let xMap = function(d) { return xScale(xValue(d)); };

    let xAxis = d3.axisBottom().scale(xScale);
    svg.append("g")
      .attr('transform', 'translate(0, ' + rangeY.max + ')')
      .call(xAxis);

    let yValue = function(d) { return +d[y]}

    let yScale = d3.scaleLinear()
      .domain([limits.yMax, limits.yMin])
      .range([rangeY.min, rangeY.max]);

    let yMap = function (d) { return yScale(yValue(d)); };

    let yAxis = d3.axisLeft().scale(yScale);
    svg.append('g')
      .attr('transform', 'translate(' + rangeX.min + ', 0)')
      .call(yAxis);

    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  function findMinMax(x, y) {
    let xMin = d3.min(x);
    let xMax = d3.max(x);
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

})();
