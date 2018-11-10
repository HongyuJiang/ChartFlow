import * as d3 from 'd3'

export default class BlueComponent {

    constructor(canvas, options) {
        
        let that = this
        this.fill = '#333'
        this.stroke = '#666'
        this.name = 'UNAMED'
        this.type = 'default'
        this.inPorts = [{'name':'Table'}]
        this.outPorts = [{'name':'Fieid1'}, {'name':'Fieid2'}]
        this.conenctions = []
        this.property = {}
        this.width = 180
        this.height = 120

        this.x = options.x;
        this.y = options.y;
        this.property = options.property
        this.canvas = canvas
        this.container = canvas
        .datum({'x': this.x, 'y': this.y})
        .append('g')
        .attr('transform', function(d){

            return 'translate(' + d.x + ',' + d.y + ')'
        })
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
        
        this.container
        .append('rect')
        .attr('x', this.x)
        .attr('y', this.y)
        .attr("rx", 6)
        .attr("ry", 6)
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('fill', this.fill)
        .attr('stroke', this.stroke)
        .attr('stroke-width', 3)
    }
    drawInPorts(){
        let that = this
        this.container
        .selectAll('.port')
        .data(this.inPorts)
        .enter()
        .append('circle')
        .attr('fill', '#993')
        .attr('stroke', 'white')
        .attr('cx', this.x + 20)
        .attr('cy', function(d,i){
            return that.height * 0.2 + (i+1) * 30 + that.y
        })
        .attr('r', 3)

        this.container
        .selectAll('.portName')
        .data(this.inPorts)
        .enter()
        .append('text')
        .attr("text-anchor", "start")
        .attr('alignment-baseline', 'central')
        .attr('x', this.x + 30)
        .attr('y', function(d,i){
            return that.height * 0.2 + (i+1) * 30 + that.y
        })
        .attr('fill','white')
        .text(function(d){
            return d.name
        })
    }
    drawOutPorts(){
        let that = this
        this.container
        .selectAll('.port')
        .data(this.outPorts)
        .enter()
        .append('circle')
        .attr('fill', '#339')
        .attr('stroke', 'white')
        .attr('cx', this.x + this.width - 20)
        .attr('cy', function(d,i){
            return that.height * 0.2 + (i+1) * 30 + that.y
        })
        .attr('r', 3)

        this.container
        .selectAll('.portName')
        .data(this.outPorts)
        .enter()
        .append('text')
        .attr("text-anchor", "end")
        .attr('alignment-baseline', 'central')
        .attr('x', this.x + this.width - 30)
        .attr('y', function(d,i){
            return that.height * 0.2 + (i+1) * 30 + that.y
        })
        .attr('fill','white')
        .text(function(d){
            return d.name
        })
    }
    drawTitle(){
        this.container
        .append('text')
        .attr('x', this.x + this.width/2)
        .attr('y', this.y + 20)
        .attr("text-anchor", "middle")
        .attr('fill','white')
        .text(this.name)

        this.container
        .append('line')
        .attr('x1', this.x)
        .attr('y1', this.y + 30)
        .attr('x2', this.x + this.width)
        .attr('y2', this.y + 30)
        .attr('stroke','white')
       
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

        this.x = d3.event.x
        this.y = d3.event.y

        d3.select(node).attr("transform", function(q){
            d.x = d3.event.x
            d.y = d3.event.y
            return 'translate(' + d.x + ',' + d.y + ')'
        });
    }
    dragended(node,d) {
        d3.select(node).classed("active", false);
    }

}