url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
req = new XMLHttpRequest()

// const root = document.getElementById("root");
// const tooltip = document.createElement("div");
// tooltip.setAttribute("id", "tooltip");
// tooltip.setAttribute("data-year", 0);
// root.appendChild(tooltip)

let dataset
let dataDomainX
let dataDomainY

const width = 800
const height = 600
const padding = 40

let heightScale
let widthScale

let svg


const drawCanvas = () => {
    svg = d3.select('svg')
        .attr('width', width)
        .attr('height', height)
}
const generateScales = () => {
    widthScale = d3.scaleLinear()
        .domain(dataDomainX)
        .range([padding, width - padding])
    heightScale = d3.scaleTime()
        .domain(dataDomainY)
        .range([padding, height - padding])
}
const generateAxes = () => {
    const xAxis = d3.axisBottom(widthScale)
                      .tickFormat(d3.format('d'))
    const yAxis = d3.axisLeft(heightScale)
                      .tickFormat(d3.timeFormat('%M:%S'))

    svg.append('g')
        .call(xAxis)
        .attr('id', 'x-axis')
        .attr('transform', `translate(0, ${height - padding})`)
    svg.append('g')
        .call(yAxis)
        .attr('id', 'y-axis')
        .attr('transform', `translate(${padding}, 0)`)
}
const drawPoints = () => {
    svg.selectAll('.dot')
        .data(dataset)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('data-xvalue', data => data['Year'])
        .attr('data-yvalue', data => secondsToDate(data['Seconds']))
        .attr('width', data => widthScale(data['Year']))
        .attr('height', data => heightScale(secondsToDate(data['Seconds'])))
        .attr('cx', data => widthScale(data['Year']))
        .attr('cy', data => heightScale(secondsToDate(data['Seconds'])))
        .attr('r', 5)
        .attr('fill', data => data['Doping'] ? 'orange' : 'blue')
}
const drawLegend = () => {
    let legend = svg.append('g')
        .attr('id', 'legend')
        .selectAll('#legend')
        .data(['orange', 'blue'])
        .enter()
        .append('g')
        .attr('class', 'legend-label')
        .attr('transform', (color, index) => `translate(0, ${height/2 - index * 20})`)
    legend.append('rect')
        .attr('x', width - 18 - padding)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', color => color)
    legend.append('text')
        .attr('x', width - 24 - padding)
        .attr('y', 9)
        .attr('dy', '.35em') // center text
        .style('text-anchor', 'end') // right aligned text
        .text(color => color === 'orange' ? 'Doping allegations' : 'No doping allegations')
}

const drawTooltip = () => {
    // lent from http://bl.ocks.org/eesur/4e0a69d57d3bfc8a82c2
    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            const child = this
            const parent = child.parentNode
            // append each child node element (circle tag) to its parent node (svg tag)
            parent.appendChild(child);
            // this.parentNode.appendChild(this) // equivalent
        });
    };
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .attr('id', 'tooltip')
        .style('position', 'absolute')
    const tooltipContent = (data) => {
        const content = [
            `${data["Name"]} (${data["Nationality"]})`,
            `Year: ${data["Year"]}`,
            `Time: ${data["Time"]}`,
            `Place: ${data["Place"]}`,
            `Doping: ${data["Doping"]}`,
            `URL: ${data["URL"]}`
        ]
        return content.join('<br>')
    }
    const mouseover = function(event, data) {
        tooltip.style("opacity", 0.9)
            .attr('data-year', data['Year'])
        d3.select(this).moveToFront()
            .style("order", 10)
            .style("stroke-width", 2)
            .style("opacity", 1)
    }
    const mousemove = function(event, data) {
        tooltip.html(tooltipContent(data))
            .style("left", (event.x + 10) + "px")
            .style("top", event.y + "px")
    }
    const mouseleave = function () {
        tooltip.style("opacity", 0)
        d3.select(this)
            .style("order", 1)
            .style("stroke-width", 1)
            .style("opacity", 0.7)
    }

    svg.selectAll('circle')
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
}

const secondsToDate = (seconds) => new Date(seconds * 1000)
const dataDomain = (dataArr, offset) => {
    if (offset) {
        return [d3.min(dataArr) - offset, d3.max(dataArr) + offset]
    } else {
        return [d3.min(dataArr), d3.max(dataArr)]
    }

}

req.open('GET', url, true)
req.onload = () => {
    dataset = JSON.parse(req.responseText)
    dataDomainX = dataDomain(dataset.map(data => data['Year']), 1)
    dataDomainY = dataDomain(dataset.map(data => secondsToDate(data['Seconds'])))
    drawCanvas()
    generateScales()
    generateAxes()
    drawPoints()
    drawLegend()
    drawTooltip()
}
req.send()
