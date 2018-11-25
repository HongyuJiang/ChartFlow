
import * as d3 from 'd3'

export default class BlueprintLine {
    constructor(container, parent, point, source) {

        //points [x,y]
        this.sourcePoint = point
        this.sourcePort = source
        this.targetPort = ''
        this.points = [point, point] //用于存储预览曲线时的两点
        this.storePoints = [point, point] //初始点和预览点
        this.isWaitPath = false //false -> path正在移动 true -> path已经确定
        this.circleCoordinatesX = '' //预览路径时末端端点X
        this.circleCoordinatesY = '' //预览路径时末端端点Y
        this.pathCount = 0
        this.container = container
        this.existingPort = []
        this.toUpdateSourcePoint = false // false -> update target point / true -> update source point
        this.count = 10000
        this.animateSpeed = 1
        this.coverLine = ''
        this.baseLine = ''
        this.sourceParent = parent
        this.targetParent = ''
        this.pathCount++
        this.isDeleted = false
    
    }
    parentPosUpdated(dx, dy, inPorts, outPorts) {

        let inPortsNames = {}
        let outPortsNames = {}

        inPorts.forEach(function (port) {
            inPortsNames[port.parent + '_' + port.name] = 1
        })

        outPorts.forEach(function (port) {
            outPortsNames[port.parent + '_' + port.name] = 1
        })

        let sourcePortKey = this.sourcePort.parent + '_' + this.sourcePort.name
        let targetPortKey = this.targetPort.parent + '_' + this.targetPort.name

        if (sourcePortKey in inPortsNames || sourcePortKey in outPortsNames) {

            this.storePoints[0][0] += dx
            this.storePoints[0][1] += dy
            this.dynamicGenerateCurveLine()
            this.updateCoverLine()
        }
        else if (targetPortKey in outPortsNames || targetPortKey in inPortsNames) {

            this.storePoints[1][0] += dx
            this.storePoints[1][1] += dy
            this.dynamicGenerateCurveLine()
            this.updateCoverLine()
       
        }
    }
    setExstingPorts(ports) {

        this.existingPort = ports;
    }
    findNearestPoint(point) {

        let that = this
        if (this.existingPort.length > 0) {

            let nearPoints = []
            this.existingPort.forEach(function (port) {

                let x = port.x + port.parentX
                let y = port.y + port.parentY

                let dis = (x - point[0]) * (x - point[0]) +
                    (y - point[1]) * (y - point[1])

                if (dis < 400) {
                    nearPoints.push({ 'dis': dis, 'port': port, 'pos': [x, y]})
                }
            })

            nearPoints = nearPoints.sort(function (a, b) {
                return a.dis - b.dis
            })

            if (nearPoints[0] != undefined && nearPoints[0] != null) {

                that.container.on('mousemove.circle', null)
              
                that.targetPort = nearPoints[0].port
                that.targetParent = nearPoints[0].port.parent
                that.storePoints[1] = nearPoints[0].pos

                that.generateAnimateCoverCurveLine()
                that.dynamicGenerateCurveLine()
            
                that.isWaitPath == false
                
            }

        }

    }
    calculateCurvePointInterpolation(points) {
        //description 通过两点计算出中间曲线路径两个锚点
        //input [[xa,ya],[xb,yb]]
        //output [[xa,ya],[x1,y1],[x2,y2],[xb,yb]]
        let xa = points[0][0],
            ya = points[0][1],
            xb = points[1][0],
            yb = points[1][1];

        //[[xa,ya],[x1,y1],[x2,y2],[xb,yb]]
        let xabs = Math.abs(xa - xb),
            yabs = Math.abs(ya - yb),
            pControl = 0.3,
            x1, y1, x2, y2;

        //[xb,yb]相对于[xa,ya]的位置
        if ((xa == xb && ya > yb) || (xa == xb && ya < yb)) {
            //位于y轴负向 y轴正向
            x1 = xa;
            y1 = ya;
            x2 = xb - yabs * pControl;
            y2 = yb;
        }
        else if ((xa < xb && ya == yb) || (xa > xb && ya == yb)) {
            //位于x轴正向 位于x轴负向
            x2 = xa;
            y2 = ya;
            x1 = xb;
            y1 = yb;
        }
        else if ((xa < xb && ya > yb) || (xa < xb && ya < yb)) {
            //位于右上右下
            x2 = xb - xabs * pControl;
            y2 = yb;
            x1 = xa + xabs * pControl;
            y1 = ya;
        }
        else if ((xa > xb && ya < yb) || (xa > xb && ya > yb)) {
            //位于左上左下
            x2 = xb + xabs * pControl;
            y2 = yb;
            x1 = xa - xabs * pControl;
            y1 = ya;
        }
        else{

            x2 = xb;
            y2 = yb;
            x1 = xa;
            y1 = ya;
        }
        points = [[xa, ya], [x1, y1], [x2, y2], [xb, yb]]
        return points
    }
    generateCurveLine(points) {
        //description 根据d3.curveBasis生成曲线
        //input [[xa,ya],[x1,y1],[x2,y2],[xb,yb]]
        //曲线生成器

        //console.log(points)

        let lineGenerator = d3.line().curve(d3.curveBasis),
            pathData = lineGenerator(points),
            curveWidth = '3px';

        if (this.baseLine == '') {

            //没有待绘制路径,路径第一次绘制
            this.isWaitPath = true
            this.baseLine = this.container.append('path')
                .attr('d', pathData)
                .style('fill', 'none')
                .style('stroke', '#808080')
                .attr('stroke-width', curveWidth)
        } 
        else {
            //存在待绘制路径,反复绘制实现路径预览
            this.baseLine
                .attr('d', pathData)

        }
    }

    updateCoverLine(){

        let points = this.calculateCurvePointInterpolation(this.storePoints)
        let lineGenerator = d3.line().curve(d3.curveBasis),
            pathData = lineGenerator(points);

        if(this.coverLine != ''){

            this.coverLine.attr('d', pathData)
        }
    }

    generateAnimateCoverCurveLine() {

        //曲线生成器
        let points = this.calculateCurvePointInterpolation(this.storePoints)
        let lineGenerator = d3.line().curve(d3.curveBasis),
            pathData = lineGenerator(points),
            curveWidth = '3px'

        //生成渐变
        let defs = this.container.append('defs')
        let linearGradient = defs.append('linearGradient')
            .attr('id', 'linearColor')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '0%')

        linearGradient.append("stop")
            .attr("offset", "0%")
            .style("stop-color", '#0DFF9F');

       /* linearGradient.append("stop")
            .attr("offset", "50%")
            .style("stop-color", '#12D2FF');

        linearGradient.append("stop")
            .attr("offset", "100%")
            .style("stop-color", '#1240FF');*/

        linearGradient.append("stop")
            .attr("offset", "100%") 
            .style("stop-color", '#0DFF9F')

        //绘制cover曲线
        this.coverLine = this.container.append('path')
            .attr('d', pathData)
            .style('fill', 'none')
            .style('stroke', "url(#" + linearGradient.attr("id") + ")")
            .attr('class', 'rgbLine')
            .attr('stroke-width', curveWidth)

        //获取生成曲线长度并设定线段间隔为曲线长度
        let totalLength = this.coverLine.node().getTotalLength()
        this.coverLine.style('stroke-dasharray', 8 + "," + 8)

    }

    animate(){
        if(this.targetPort != ''){
            this.count = this.count - this.animateSpeed;
            d3.selectAll('.rgbLine')
                .style('stroke-dashoffset', this.count)
        }
    }

    generateEndPoints() {
        let that = this
        let pathCount = this.pathCount
        let circleSourceId = 'mySourceCircle_' + this.pathCount;
        let circleTargetId = 'myTargetCircle_' + this.pathCount;

        let circleSource = this.container.append('circle')
            .attr('id', circleSourceId)
            .attr('cx', that.storePoints[0][0])
            .attr('cy', that.storePoints[0][1])
            .attr('pathCount', pathCount)
            .attr('pointPosition', '0') // 0 -> source that.toUpdateSourcePoint = true
            .attr('r', 2)
            .style('opacity', 1)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))

        let circleTarget = this.container.append('circle')
            .attr('id', circleTargetId)
            .attr('cx', that.storePoints[1][0])
            .attr('cy', that.storePoints[1][1])
            .attr('pathCount', pathCount)
            .attr('pointPosition', '1') // 1 -> target that.updatePoint = false
            .attr('r', 2)
            .style('opacity', 1)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))

        function dragstarted(d) { }
        function dragged(d) {
            //端点随着鼠标移动
            d3.select(this).attr("cx", d3.event.x).attr("cy", d3.event.y);
            //judge source point / target point
            that.toUpdateSourcePoint = d3.select(this).attr('pointPosition') == '0' ? true : false

            let coverPathId = 'myCoverPath_' + d3.select(this).attr('pathCount'),
                coverPath = d3.select('#' + coverPathId);

            //删除coverPath
            coverPath.remove()

            let coordinates = d3.mouse(this)
            that.dynamicGenerateCurveLine(coordinates)
        }

        function dragended(d) {
            that.generateAnimateCoverCurveLine()
            that.isWaitPath == false
        }
    }

    dynamicGenerateCurveLine(coordinates) {

        if(coordinates){

            this.circleCoordinatesX = coordinates[0]
            this.circleCoordinatesY = coordinates[1]
    
            if (this.toUpdateSourcePoint == false && this.storePoints.length == 2) {
                //update target point [ [] , [to do] ]
                this.storePoints.pop()
                this.storePoints.push([this.circleCoordinatesX, this.circleCoordinatesY])
            }
    
            if (this.toUpdateSourcePoint == true && this.storePoints.length == 2) {
                //update source point [ [to do] , [] ]
                this.storePoints.shift()
                this.storePoints.unshift([this.circleCoordinatesX, this.circleCoordinatesY])
            }
        }
       
        let p = this.calculateCurvePointInterpolation(this.storePoints)
        this.generateCurveLine(p)
    }
    remove(parent){

        console.log(this.targetParent, this.sourceParent, parent)

        if(this.targetParent == parent || this.sourceParent == parent){

            this.baseLine.remove()
            this.coverLine.remove()
            this.isDeleted = true

            return true
        }

        return false
    }

}