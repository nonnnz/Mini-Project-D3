function roundnum(x) {
  return Math.ceil(x/400)*400;
}

function roundnumx(x) {
  return Math.ceil(x/1000)*1000;
}


// Create bar chart
const barChart = {
    margin: { top: 20, right: 20, bottom: 130, left: 100 },
    width: 650,
    height: 400
  };

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

// Create pie chart
const pieChart = {
  width: 300,
  height: 500,
  radius: Math.min(300, 300) / 2
};

const svgPie = d3.select("#pie-chart")
  .append("svg")
  .attr("width", pieChart.width)
  .attr("height", pieChart.height)
  .append("g")
  .attr("transform", "translate(" + pieChart.width / 2 + "," + pieChart.height / 2 + ")");


// pie name
svgPie.append("text")
  .attr("class", "pie-label")
  .attr("x", 0)
  .attr("y", -200)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Gender")
  .attr("fill", "white")

// Create scatter plot
const scatterPlot = {
  width: 800,
  height: 400,
  margin: {
    top: 20,
    right: 20,
    bottom: 70,
    left: 100
  }
};

const svgScatter = d3.select("#scatter-plot").append("svg")
  .attr("width", scatterPlot.width + scatterPlot.margin.left + scatterPlot.margin.right + 100)
  .attr("height", scatterPlot.height + scatterPlot.margin.top + scatterPlot.margin.bottom + 50)
  .append("g")
  .attr("transform", "translate(" + scatterPlot.margin.left + "," + scatterPlot.margin.top + ")");

// X label
svgScatter.append("text")
  .attr("class", "x axis-label")
  .attr("x", scatterPlot.width / 2)
  .attr("y", scatterPlot.height + 110)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Weight (kg)")
  .attr("fill", "white")

// Y label
svgScatter.append("text")
  .attr("class", "y axis-label")
  .attr("x", - (scatterPlot.height / 2))
  .attr("y", -80)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .text("Height (cm)")
  .attr("fill", "white")

// Create tooltip
const tooltip = d3.select("body").append("div")
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

  // Add the X and Y
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
    .attr("height", d => barChart.height - yBar(d.frequency) )
    .attr("fill", "#69b3a2")
    .on("mouseover", function(d, publisherData) {  // Add tooltip on mouseover
      // console.log(publisherData);
      // console.log(d);
      d3.select(this)
        .attr("fill", "#8dd3c7");
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip
        .html(
          `<div>Publisher: ${publisherData.publisher}</div><div>Characters: ${publisherData.frequency}</div>`
        )
    })
    .on('mousemove', function (event) {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 30) + "px");
    })
    .on("mouseout", function(d) {  // Remove tooltip on mouseout
      d3.select(this)
        .attr("fill", "#69b3a2");
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

  // ---------------------- Chart 2: Pie Chart ----------------------

  // Compute the frequency of each gender
  const genderFreq = d3.rollup(data, v => v.length, d => d.Gender);

  // Convert the frequency object to an array of objects
  const genderData = Array.from(genderFreq, ([key, value]) => ({ gender: key, frequency: value }));

  // Compute the total number of superheroes
  const total = d3.sum(genderData, d => d.frequency);

  // Set the color scale
  const colorPie = d3.scaleOrdinal()
    .domain(genderData.map(d => d.gender))
    .range(d3.schemeSet2);

  // Compute the pie chart data
  const pie = d3.pie()
    .value(d => d.frequency)
    .sort(null);

  const pieData = pie(genderData);

  // Add the slices
  svgPie.selectAll("path")
    .data(pieData)
    .enter()
    .append("path")
    .attr("d", d3.arc()
      .innerRadius(0)
      .outerRadius(pieChart.radius)
    )
    .attr("fill", d => colorPie(d.data.gender))
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .style("opacity", 0.7)
    .on("mouseover", function(d, genderData) {  // Add tooltip on mouseover
      const percent = d3.format(".2f")(genderData.data.frequency / total * 100);
      // console.log(genderData);
      d3.select(this)
        .style("opacity", 1);
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip
        .html(
          `<div>Gender: ${genderData.data.gender}</div><div>Frequency: ${genderData.data.frequency}</div><div>Percent: ${percent}%</div>`
        )
    })
    .on('mousemove', function (event) {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 30) + "px");
    })
    .on("mouseout", function(d) {  // Remove tooltip on mouseout
      d3.select(this)
        .style("opacity", 0.7);
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

  // Add the legend
  const legend = svgPie.selectAll(".legend")
  .data(pieData)
  .enter()
  .append("g")
  .attr("class", "legend")
  .attr("transform", (d, i) => `translate(${pieChart.width/2 * -1},${180+(i * 25)})`);

  legend.append("circle")
  .attr("cx", 6)
  .attr("cy", 5)
  .attr("r", 6)
  .style("fill", d => colorPie(d.data.gender));

  legend.append("text")
  .attr("x", 20)
  .attr("y", 10)
  .style("font-size", "14px")
  .text(d => d.data.gender)
  .attr("fill", "white");

  // ---------------------- Chart 3: Scatter Plot ----------------------
  // Filter out negative values 
  const filteredData = data.filter(d => d.Height >= 0 && d.Weight >= 0);

  // Set the X and Y scales
  const xScatter = d3.scaleLinear()
    .range([0, scatterPlot.width ])
    .domain([0, roundnumx(d3.max(filteredData, d => d.Weight))]);

  const yScatter = d3.scaleLinear()
    .range([scatterPlot.height, 0])
    .domain([0, roundnumx(d3.max(filteredData, d => d.Height))]);

  // Add the X and Y 
  svgScatter.append("g")
    .attr("transform", "translate(0," + scatterPlot.height + ")")
    .call(d3.axisBottom(xScatter))
    .style('color', '#88898d')
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end")
    .attr("fill", "#f0f6fc");

  svgScatter.append("g")
    .call(d3.axisLeft(yScatter))
    .style('color', '#88898d');

  // set a color scale for the alignment categories
  const colorScale = d3.scaleOrdinal()
    .domain(["good", "bad", "neutral", "-"])
    .range(d3.schemeSet2);

  // Add the scatter plot points
  svgScatter.selectAll("circle")
    .data(filteredData)
    .enter()
    .append("circle")
    .attr("cx", d => xScatter(d.Weight))
    .attr("cy", d => yScatter(d.Height))
    .attr("r", 5)
    .attr("fill", d => colorScale(d.Alignment))
    .style("opacity", 0.9)
    .style("z-index", "1")
    .on("mouseover", function(d, filteredData) {  // Add tooltip on mouseover
      // console.log(filteredData);
      d3.select(this)
        .attr("r", 7)
        .style("stroke", "#ffff")
        .style("stroke-width", 2);
      svgScatter.selectAll("circle")
        .filter(function(e) {
          return e.Alignment !== filteredData.Alignment && e !== filteredData.Alignment;
        })
        .style("opacity", 0.2);
      // console.log(svgScatter.selectAll("circle").filter(function(e) {
      //   return e.Alignment !== filteredData.Alignment && e !== filteredData.Alignment;
      // }));
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip
        .html(
          `<div>Name: ${filteredData.name}</div><div>Alignment: ${filteredData.Alignment}</div><div>Height: ${filteredData.Height} cm</div><div>Weight: ${filteredData.Weight} kg</div><div>Publisher: ${filteredData.Publisher}</div>`
        )
    })
    .on('mousemove', function (event) {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 30) + "px");
    })
    .on("mouseout", function(d) {  // Remove tooltip on mouseout
      d3.select(this)
        .attr("r", 5)
        .style("stroke-width", 0);
      svgScatter.selectAll("circle")
        .style("opacity", 0.9);
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

  // Add the legend
  const legend2 = svgScatter.selectAll(".legend")
  .data(colorScale.domain())
  .enter()
  .append("g")
  .attr("class", "legend")
  .attr("transform", function(d, i) { return "translate("+ (scatterPlot.width) + "," + i * 20 + ")"; });

  // console.log(colorScale.domain());
  // Add colored squares to legend
  legend2.append("circle")
  .attr("cx", 6)
  .attr("cy", 5)
  .attr("r", 6)
  .style("fill", d => colorScale(d));

  // Add legend text
  legend2.append("text")
  .attr("x", 24)
  .attr("y", 9)
  .style("font-size", "14px")
  .text(d => d)
  .attr("fill", "white");

});
