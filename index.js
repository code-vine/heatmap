let dataUrl = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

let paddings={
    top:80,
    right:60,
    left:60,
    bottom:150
}

let colors = ["SteelBlue","lightblue", "lightgreen","orange","coral"]

let width = 900;
let height = 600;

let baseTemp
let scaleX
let scaleY
let maxYear
let minYear
let numYears

let svg = d3.select("svg")
            .attr("width", width)
            .attr("height", height)
            .style("background-color", "white");

let tooltip = d3.select("#tooltip");

//get data
let xhr = new XMLHttpRequest();
xhr.responseType = 'json';
xhr.open('GET', dataUrl);
xhr.send();

xhr.onload = function(){
    if (xhr.status != 200) { // analyze HTTP status of the response
        alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
    } else { // show the result
        let data = xhr.response;
        console.log(data)
        
        let years = data['monthlyVariance'].map(item=>{
            return item.year;
        })
        baseTemp = data['baseTemperature']
        maxYear = d3.max(years) + 1;
        minYear = d3.min(years);

        numYears = maxYear - minYear;
        let boxWidth = (width - paddings.left - paddings.right) / numYears;
        let boxHeight = (height-paddings.bottom - paddings.top) / 12;
        console.log(boxHeight, boxWidth);
        createXAxis();
        createYAxis();
        createBoxes(data, boxWidth,boxHeight);
        createLegend();
    }
};

function createXAxis(){
    scaleX = d3.scaleLinear()
               .domain([minYear, maxYear])
               .range([paddings.left, width - paddings.right]);
    
    let xAxis = d3.axisBottom(scaleX).tickFormat(d3.format('d'));

    svg.append('g')
       .call(xAxis)
       .attr('id', 'x-axis')
       .attr('transform', `translate(${0}, ${height - paddings.bottom})`)
               
}

function createYAxis(){
    scaleY = d3.scaleTime()
               .domain([new Date(0,0,0,0,0,0,0), new Date(0,12,0,0,0,0,0)])
               .range([paddings.top, height-paddings.bottom]);

    let yAxis = d3.axisLeft(scaleY).tickFormat(d3.timeFormat('%B'));

    svg.append('g')
       .call(yAxis)
       .attr('id', 'y-axis')
       .attr('transform', `translate(${paddings.left}, ${0})`);
}

function createBoxes(data , boxWidth, boxHeight){
    let variances = data['monthlyVariance'].map(item =>{
        return item;
    });

    svg.selectAll("rect")
       .data(variances)
       .enter()
       .append("rect")
       .attr('class', 'cell')
       .attr("x", (d)=> scaleX(d.year))
       .attr("y", (d) => scaleY( new Date(0, d.month -1)))
       .attr("width", boxWidth)
       .attr("height", boxHeight)
       .attr("fill", (d)=>{
        return colorFromVariance(d.variance);
       })
       .attr('data-month', (d)=> d.month -1)
       .attr('data-year', (d)=>d.year)
       .attr('data-temp', (d)=> baseTemp - d.variance)
       .on('mouseover', (event, d)=>{
        event.target.style.fill =  "white";
        tooltip.style("opacity", 0.9)
        tooltip
          .html(
            d.year
          )
          .attr("data-year", d.year)
          .style('left', event.pageX+5 + 'px')
          .style('top', event.pageY - 28 + 'px');
    }).on('mouseout', function (event, d) {
        tooltip.style("opacity", "0");
        event.target.style.fill = colorFromVariance(d.variance);

    });
}

function createLegend(){
    let squareSize = 25;
    svg.append("g")
       .attr("id", "legend")
       .selectAll('rect')
       .data(colors)
       .enter()
       .append('rect')
       .attr('x', (d,i)=> paddings.left + i * squareSize )
       .attr('y', (d)=> height -paddings.top)
       .attr('width', squareSize)
       .attr('height', squareSize)
       .attr('fill', d => d)

       svg.append("g")
       .selectAll("text")
       .data(colors)
       .enter()
       .append("text")
       .style("z-index", 1)
       .style("font-size", 12)
       .attr('x', (d,i) => paddings.left + i * squareSize)
       .attr('y', (d)=> height-paddings.top - 2 )
       .attr("dx", (d,i)=>{
        if(i === 2)return squareSize / 2.5;
        else return squareSize /5;
       } )
       .attr('fill', "black")
       .text((d,i)=>{
          if(i ===0)
            return '< -1';
          else if(i ===1)
            return '< 0';
          else if(i ===2)
            return '0';
          else if(i ===3)
            return '> 0';
          else if(i===4)
            return '> 1';
           
       })
}

function colorFromVariance(variance){
    if(variance <= -1){
        return colors[0];
    }
    else if(variance <= 0){
        return colors[1];
    }
    else if(variance === 0)
    {
        return colors[2];
    }
    else if(variance <= 1){
        return colors[3];
    }
    else{
        return colors[4];
    }
}


            