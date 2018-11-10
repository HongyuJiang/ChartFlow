import * as d3 from 'd3'

export default class BlueComponent {

    fill : '#999'
    stroke : '#333'
    name : 'unnamed'
    type : 'default'
    inPorts : []
    outPorts : []
    conenctions : []
    property : {}
    width : 100
    height : 180
    container : ''
    x:0
    y:0
    canvas:0

    constructor(canvas, options) {
        
        let that = this
        this.x = options.x;
        this.y = options.y;
        this.property = options.property
        this.canvas = canvas
        this.container = canvas.append('g')
        this.container.call(d3.drag()
            .on("start", function(d){
                that.dragstarted(this, d)
            })
            .on("drag",function(d){
                that.dragged(this, d)
            })
            .on("end", function(d){
                that.dragended(this, d)
            }));
            
        this.draw()
    }
    updatePosition(x, y){
        this.x = x;
        this.y = y;
    }
    updateProperty(options){

        for(let key in options){
            this.property[key] = options[key]
        }
        this.draw()
    }
    drawBack(){
        d3.select(this.canvas)
        .append('rect')
        .attr('x', this.x)
        .attr('y', this.y)
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('fill', this.fill)
    }
    drawInPorts(){

        let that = this
        d3.select(this.canvas)
        .selectAll('.port')
        .data(this.inPorts)
        .enter()
        .append('circle')
        .attr('fill', '#993')
        .attr('stroke', 'white')
        .attr('cx', this.x + 10)
        .attr('cy', function(d,i){
            return that.height * 0.2 + i * 10
        })
        .attr('r', 3)
    }
    drawOutPorts(){

        let that = this
        d3.select(this.canvas)
        .selectAll('.port')
        .data(this.outPorts)
        .enter()
        .append('circle')
        .attr('fill', '#339')
        .attr('stroke', 'white')
        .attr('cx', this.x + this.width - 10)
        .attr('cy', function(d,i){
            return that.height * 0.2 + i * 10
        })
        .attr('r', 3)
    }
    drawTitle(){
        d3.select(this.canvas)
        .append('text')
        .attr('x', this.x)
        .attr('y', this.y)
        .text(this.name)
    }
    draw(){
        this.drawBack()
        this.drawTitle()
        this.drawInPorts()
        this.drawOutPorts()
        this.drawTitle()
    }
    dragstarted(node, d) {
        d3.select(node).raise().classed("active", true);
    }
    dragged(node, d){ 
        d3.select(node).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
    }
    dragended(node,d) {
        d3.select(node).classed("active", false);
    }

}