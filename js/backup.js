function roundnum(x) {
  return Math.ceil(x/400)*400;
}

// Set the dimensions and margins of the chart
const barChart = {
    margin: { top: 20, right: 20, bottom: 130, left: 100 },
    width: 800,
    height: 400
  };
  
// Append the SVG object to the body of the page
const svgBar = d3.select("#bar-chart")
  .append("svg")
  .attr("width", barChart.width + barChart.margin.left + barChart.margin.right)
  .attr("height", barChart.height + barChart.margin.top + barChart.margin.bottom)
  .append("g")
  .attr("transform", "translate(" + barChart.margin.left + "," + barChart.margin.top + ")");
  
// X label
svgBar.append("text")
  .attr("class", "x axis-label")
  .attr("x", barChart.width / 2)
  .attr("y", barChart.height + 110)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Publisher")
  .attr("fill", "white")

// Y label
svgBar.append("text")
  .attr("class", "y axis-label")
  .attr("x", - (barChart.height / 2))
  .attr("y", -80)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .text("Characters")
  .attr("fill", "white")

  // Create tooltip
  const tooltip = svgBar.append("text")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Import data from a CSV file
d3.csv("data/superhero_data_analysis.csv").then(data => {

  // ---------------------- Chart 1: Bar Chart ----------------------

  // Compute the frequency of each publisher
  const publisherFreq = d3.rollup(data, v => v.length, d => d.Publisher);

  // Convert the frequency object to an array of objects
  const publisherData = Array.from(publisherFreq, ([key, value]) => ({ publisher: key, frequency: value }));

  // Sort the data by frequency in descending order
  publisherData.sort((a, b) => b.frequency - a.frequency);

  // Set the X and Y scales
  const xBar = d3.scaleBand()
    .range([0, barChart.width])
    .domain(publisherData.map(d => d.publisher))
    .padding(0.2);

  const yBar = d3.scaleLinear()
    .range([barChart.height, 0])
    .domain([0, roundnum(d3.max(publisherData, d => d.frequency))]);

  // Add the X and Y axes
  svgBar.append("g")
    .attr("transform", "translate(0," + barChart.height + ")")
    .call(d3.axisBottom(xBar))
    .style('color', '#88898d')
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end")
    .attr("fill", "#f0f6fc");

  svgBar.append("g")
    .call(d3.axisLeft(yBar))
    .style('color', '#88898d');

  // Add the bars
  svgBar.selectAll("rect")
    .data(publisherData)
    .enter()
    .append("rect")
    .attr("x", d => xBar(d.publisher))
    .attr("y", d => yBar(d.frequency))
    .attr("width", xBar.bandwidth())
    .attr("height", d => barChart.height - yBar(d.frequency))
    .attr("fill", "#69b3a2")
    .on("mouseover", function(d) {  // Add tooltip on mouseover
      d3.select(this)
        .attr("fill", "#8dd3c7");
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.attr("x", xBar(d.publisher) + xBar.bandwidth() / 2)
        .attr("y", yBar(d.frequency) - 10)
        .attr("text-anchor", "middle")
        .text(d.publisher + ": " + d.frequency);
    })
    .on("mouseout", function(d) {  // Remove tooltip on mouseout
      d3.select(this)
        .attr("fill", "#69b3a2");
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

});
