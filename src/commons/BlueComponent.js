import * as d3 from 'd3'

export default class BlueComponent {

    constructor(canvas, options) {
        
        let that = this
        this.fill = '#333'
        this.stroke = '#999'
        this.name = 'UNAMED'
        this.type = 'default'
        this.inPorts = [{'name':'Table','type':'in'}]
        this.outPorts = [{'name':'Fieid1','type':'out'}, {'name':'Fieid2','type':'out'}]
        this.conenctions = []
        this.property = {}
        this.width = 180
        this.dx = 0
        this.dy = 0
        this.x = 300 * Math.random() + 100
        this.y = 100 * Math.random() + 100

        for(let key in options){
            this[key] = options[key]
        }

        this.width = this.name.length > 15 ? this.name.length * 10 : 180
        this.height = this.inPorts.length > this.outPorts.length ? 50 + this.inPorts.length * 30 : 50 + this.outPorts.length * 30

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
    getPos(){

        return {'x':this.x,'y':this.y, 'dx':this.dx, 'dy':this.dy}
    }
    resetDeltaPos(){

        this.dx = 0
        this.dy = 0
    }
    setFieldName(name){

        if(this.outPorts.length == 1){
            console.log(name)
            this.outPorts[0].name = name
            this.outPorts[0].dimension_type = 'quantitative'
        }
    }
    addPort(type, port){

        if(type == 'in'){
            this.inPorts.push(port)
        }
        else{
            this.outPorts.push(port)
        }

        this.redraw()
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
    drawBack(height){
        
        this.container
        .append('rect')
        .attr('class','back')
        .attr("rx", 6)
        .attr("ry", 6)
        .attr('width', this.width)
        .attr('height', height || this.height)
        .attr('fill', this.fill)
        .attr('stroke', this.stroke)
        .attr('stroke-width', 2)
    }
    redraw(){
        
        this.container
        .selectAll('.port').remove()

        this.container
        .selectAll('.portname').remove()

        this.height = this.inPorts.length > this.outPorts.length ? 50 + this.inPorts.length * 30 : 50 + this.outPorts.length * 30
        this.container.selectAll('.back').attr('height', this.height)

        this.drawInPorts()
        this.drawOutPorts()

    }
    drawInPorts(){
        let that = this
        this.container
        .selectAll('port')
        .data(this.inPorts)
        .enter()
        .append('circle')
        .attr('class','port')
        .attr('fill', '#339')
        .attr('stroke', 'white')
        .attr('cx', function(d){
            d.x = 20
            return d.x
        })
        .attr('cy', function(d,i){
            d.y = 30 + (i+1) * 30
            return d.y
        })
        .attr('r', 6)


        this.container
        .selectAll('portname')
        .data(this.inPorts)
        .enter()
        .append('text')
        .attr('class','portname')
        .attr("text-anchor", "start")
        .attr('alignment-baseline', 'central')
        .attr('x', function(d){
            return 30
        })
        .attr('y', function(d,i){
            return d.y 
        })
        .attr('fill','white')
        .text(function(d){
            return d.text
        })
    }
    drawOutPorts(){
        let that = this
        this.container
        .selectAll('port')
        .data(this.outPorts)
        .enter()
        .append('circle')
        .attr('class','port')
        .attr('fill', '#339')
        .attr('stroke', 'white')
        .attr('cx', function(d,i){
            d.x = that.width - 20
            return d.x 
        })
        .attr('cy', function(d,i){
            d.y = 30 + (i+1) * 30
            return d.y
        })
        .attr('r', 6)
        
        this.container
        .selectAll('portname')
        .data(this.outPorts)
        .enter()
        .append('text')
        .attr('class','portname')
        .attr("text-anchor", "end")
        .attr('alignment-baseline', 'central')
        .attr('x', this.width - 30)
        .attr('y', function(d,i){
            return 30 + (i+1) * 30
        })
        .attr('fill','white')
        .text(function(d){
            return d.text
        })
    }
    drawTitle(){
        this.container
        .append('text')
        .attr('x', this.width/2)
        .attr('y', 20)
        .attr("text-anchor", "middle")
        .attr('fill','white')
        .text(this.name)

        this.container
        .append('line')
        .attr('x1', 0)
        .attr('y1', 30)
        .attr('x2', this.width)
        .attr('y2', 30)
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

        let that = this

        d3.select(node).attr("transform", function(q){
            that.dx = d3.event.x - that.x
            that.dy = d3.event.y - that.y
            that.x = d.x = d3.event.x
            that.y = d.y = d3.event.y
            return 'translate(' + d.x + ',' + d.y + ')'
        });

        this.container.selectAll('.port')
        .attr('none', function(d){
            d.parentX = that.x
            d.parentY = that.y
        })

    }
    dragended(node,d) {
        d3.select(node).classed("active", false);
    }

    getAllCircles(){

        return this.container.selectAll('.port')
    }
    getAllPorts(){

        let that = this
        let ret = []

        ret['inPorts'] = this.inPorts
        ret['inPorts'].forEach(function(d){

            d.parentX = that.x
            d.parentY = that.y
            d.parent = that.name
            ret.push(d)
        })

        ret['outPorts'] = this.outPorts
        ret['outPorts'].forEach(function(d){

            d.parentX = that.x
            d.parentY = that.y
            d.parent = that.name
            ret.push(d)
        })
        return ret
    }

}