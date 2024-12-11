import React, { Component } from "react";
import "./Child1.css";
import * as d3 from "d3";

class Child1 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            useSentimentScale: true,
            selectedData: [],
        };
        this.circles = null;
        this.simulation = null;
    }

    initialSim(data, y_scale) {
        this.simulation = d3.forceSimulation(data).force('collision', d3.forceCollide(5.5)).force('y', d3.forceY(d => y_scale(d.Month))).force('x', d3.forceX(d => 200 + Math.random() * 125))
        .on("tick", () => {
            if (this.circles) {
              this.circles.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
            }
        });
        this.simulation.alphaMin(0.1).restart();
        this.simulation.on("end", () => {
            if (this.simulation) this.simulation.stop();
        });
    }

  componentDidUpdate() {
    var data = this.props.json_data;

    const margin = { top: 50, right: 30, bottom: 40, left: 40 },
      width = 700,
      height = 500,
      innerHeight = height - margin.top - margin.bottom;
    
    const svg = d3.select('#mysvg').attr('width', width).attr('height', height);
    const g = svg.select('g').attr('transform', `translate(${margin.left},${margin.top})`);

    var y_data = data.map(item => item.Month);
    y_data = [...new Set(y_data)]

    const y_scale = d3.scaleBand().domain(y_data).range([0, innerHeight]);
    const sentimentColorScale = d3.scaleLinear().domain([-1, 0, 1]).range(["red", "#ECECEC", "green"]);
    const subjectivityColorScale = d3.scaleLinear().domain([0,1]).range(["#ECECEC","#4467C4"]);

    this.sentimentColorScale = sentimentColorScale;
    this.subjectivityColorScale = subjectivityColorScale;

    const circles = g.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("r", 4)
        .attr("fill", (d) => this.state.useSentimentScale ? sentimentColorScale(d.Sentiment) : subjectivityColorScale(d.Subjectivity))
        .on('click', (ev, d) => {
            const { selectedData } = this.state;

            const isSelected = selectedData.some(item => item === d);
            const newSelectedData = isSelected ? selectedData.filter(item => item !== d) : [...selectedData, d];
            d3.select(ev.target).attr("stroke", isSelected ? "none" : "black")
            this.setState({ selectedData: newSelectedData });
        });

    this.circles = circles;

    g.selectAll("text")
        .data(y_data)
        .join("text")
        .attr("class", "month")
        .attr("x", 0)
        .attr("y", d => y_scale(d))
        .text(d => d)

    if (!this.simulation) {
        this.initialSim(data, y_scale);
    }

    const legendSvg = d3.select("#legend")
        .attr("width", 150)
        .attr("height", 500)
        .select("g");

    this.updateLegend(legendSvg);
  }

  updateLegend(legendSvg) {
    const { useSentimentScale } = this.state;

    const colorScale = useSentimentScale ? this.sentimentColorScale : this.subjectivityColorScale;
    const scaleDomain = useSentimentScale ? [1, 0, -1] : [1, 0.5, 0];
    const numSteps = 20;
    const scaleRange = d3.range(scaleDomain[0], scaleDomain[2], (scaleDomain[2] - scaleDomain[0]) / numSteps);

    const legend = legendSvg.selectAll("g.legend-entry1")
        .data(scaleRange)
        .join("g")
        .attr("class", "legend-entry1")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legend.selectAll("rect")
        .data((d) => [d])
        .join("rect")
        .attr("x", 10)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", (d) => colorScale(d));

    legend.selectAll("text")
        .data((d, i) => {
            if (i === 0){
                if (useSentimentScale){
                    return ["Negative"]
                }
                else
                    return["Subjective"]
            } 
            else if(i === scaleRange.length - 1){
                if (useSentimentScale){
                    return ["Positive"]
                }
                else
                    return["Objective"]
            }
            return []; })
        .join("text")
        .attr("x", 40)
        .attr("y", 15)
        .text((d) => d);
  }

  handleDropdownChange = (ev) => {
    const useSentimentScale = ev.target.value === "true";
    const newScale = useSentimentScale ? this.sentimentColorScale : this.subjectivityColorScale;

    if (this.circles) {
        this.circles.attr("fill", (d) =>
        useSentimentScale ? newScale(d.Sentiment) : newScale(d.Subjectivity)
        );
    }

    this.setState({ useSentimentScale });
  }

  render() {
    const { selectedData } = this.state;
    return (
        <div className='child1'>
            <div className="dropdown">
                <p><strong>Color By: </strong></p>
                <select value={this.state.useSentimentScale.toString()} onChange={this.handleDropdownChange}>
                    <option value="true">Sentiment</option>
                    <option value="false">Subjectivity</option>
                </select>
            </div>
            <svg id="mysvg" width="700" height="400">
                <g className="container"></g>
            </svg>
            <svg id="legend" width="100" height="500"><g></g></svg>
            <div>
                {selectedData.length > 0 ? (
                    selectedData.map((d, index) => (
                        <div key={index}>
                            <p>{d.RawTweet}</p>
                        </div>
                    ))
                ) : (
                    <p></p>
                )}
            </div>
        </div>
    );
  }
}

export default Child1;