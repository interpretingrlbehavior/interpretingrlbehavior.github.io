// Adapted from:
//  - https://elliotbentley.com/blog/a-better-way-to-structure-d3-code/

const d3 = require("d3");

module.exports = class PCAScatterplot {

  constructor(element, baseData, sampleData, options) {
    this.element = element

    this.width = 300;
    this.height = 300;
    this.margin = {top: 25, right: 20, bottom: 35, left: 40};

    this.num_base_points = 1000;
    this.baseData = baseData.slice(0, this.num_base_points);
    this.sampleData = sampleData;

    this.draw()
  }


  draw() {    
    this.svg = d3.select(this.element)
      .append('svg')
      .attr("width", this.width)
      .attr("height", this.height);

    this._createScales();
    this._drawAxes();
    this._drawBase();
    this._drawSample();
  }


  update(sampleData) {
    this.sampleData = sampleData;
    this.svg.selectAll(".sample-point")
      .attr("cx", d => this.x(d.hx_loadings[0]))
      .attr("cy", d => this.y(d.hx_loadings[1]))
      .attr("fill", d => d["is_selected"] ? "red" : "blue")
  }


  _createScales() {

    var dim_extents = dim => {
      const baseExtents = d3.extent(this.baseData, d => d[dim]);
      const sampleExtents = d3.extent(this.sampleData, d => d.hx_loadings[dim]);

      return [
        Math.min(baseExtents[0], sampleExtents[0]),
        Math.max(baseExtents[1], sampleExtents[1])
      ]
    }

    m = this.margin

    this.x = d3.scaleLinear()
      .domain(dim_extents(0)).nice()
      .range([m.left, this.width - m.right])
    
    this.y = d3.scaleLinear()
      .domain(dim_extents(1)).nice()
      .range([this.height - m.bottom, m.top])
  }


  _drawAxes() {
    m = this.margin;

    const xAxis = g => g
      .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
      .call(d3.axisBottom(this.x).ticks(this.width / 80))
      .call(g => g.append("text")
        .attr("x", this.width)
        .attr("y", this.margin.bottom - 4)
        .attr("fill", "black")
        .attr("text-anchor", "end")
        .text("0th pca dimension"));
    
    const yAxis = g => g
      .attr("transform", `translate(${this.margin.left},0)`)
      .call(d3.axisLeft(this.y))
      .call(g => g.append("text")
        .attr("x", - this.margin.left)
        .attr("y", 10)
        .attr("fill", "black")
        .attr("text-anchor", "start")
        .text("1st pca dimension"))

    this.svg.append("g")
        .call(xAxis);

    this.svg.append("g")
        .call(yAxis);
  }


  _drawBase() {
    this.svg.append("g")
    .selectAll("circle")
    .data(this.baseData)
    .join("circle")
      .attr("cx", d => this.x(d[0]))
      .attr("cy", d => this.y(d[1]))
      .attr("fill", "black")
      .attr("fill-opacity", .2)
      .attr("r", 1);
  }


  _drawSample() {
    this.svg.append("g")
      .selectAll("circle")
      .data(this.sampleData)
      .join("circle")
        .attr("class", "sample-point")
        .attr("cx", d => this.x(d.hx_loadings[0]))
        .attr("cy", d => this.y(d.hx_loadings[1]))
        .attr("fill", d => d["is_selected"] ? "red" : "blue")
        .attr("r", 3);
  }

}
