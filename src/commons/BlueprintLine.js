
import * as d3 from 'd3'

export default class BlueprintLine {
    constructor(container, point) {

        //points [x,y]
        let that = this
        this.sourcePoint = point
        this.points = [point, point] //用于存储预览曲线时的两点
        this.storePoints = [point, point] //初始点和预览点
        this.isWaitPath = false //false -> path正在移动 true -> path已经确定
        this.circleCoordinatesX = '' //预览路径时末端端点X
        this.circleCoordinatesY = '' //预览路径时末端端点Y
        this.pathCount = 0
        this.container = container
        this.existingPort = []

        this.container.on('mousemove.circle', function (d) {
            //监听鼠标移动更新计算预览点 生成预览曲线
            let coordinates = d3.mouse(this)
            that.circleCoordinatesX = coordinates[0]
            that.circleCoordinatesY = coordinates[1]

            if (that.storePoints.length == 2) {
                that.storePoints.pop()
                that.storePoints.push([that.circleCoordinatesX, that.circleCoordinatesY])
            }

            let p = that.calculateCurvePointInterpolation(that.storePoints)
            that.generateCurveLine(p)
            that.findNearestPoint(coordinates)
        })

    }
    setExstingPorts(ports){

        this.existingPort = ports;
    }
    findNearestPoint(point){

        let that = this

        if(this.existingPort.length > 0){
            
            let nearPoints = []

            this.existingPort.forEach(function(d){
    
                let dis = (d.x - point[0]) * (d.x - point[0]) +
                 (d.y - point[1]) * (d.y - point[1])
                
                if(dis < 400){
    
                    nearPoints.push({'dis':dis,'name':d.name})
                }
            })
    
            nearPoints = nearPoints.sort(function(a,b){
                return a.dis - b.dis
            })

            if(nearPoints[0] != undefined && nearPoints[0] != null){

                that.container.on('mousemove.circle', null)
                that.generateCurveLineAnimate()
                that.isWaitPath == false
            }
    
            //return nearPoints[0]

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
        points = [[xa, ya], [x1, y1], [x2, y2], [xb, yb]]
        return points
    }
    generateCurveLine(points) {
        //description 根据d3.curveBasis生成曲线
        //input [[xa,ya],[x1,y1],[x2,y2],[xb,yb]]
        //曲线生成器
        let lineGenerator = d3.line().curve(d3.curveBasis),
            pathData = lineGenerator(points),
            curveWidth = '2px';

        let pathId = ''
        let circlesId = '';

        if (this.isWaitPath == false) {
            //没有待绘制路径,路径第一次绘制
            pathId = 'myPath_' + this.pathCount;
            circlesId = 'myCircles_' + this.pathCount;
            this.pathCount++;

            this.isWaitPath = !this.isWaitPath
            let path = this.container.append('path')
                .attr('d', pathData)
                .style('fill', 'none')
                .style('stroke', '#999')
                .attr('id', pathId)
                .attr('stroke-width', curveWidth)
        } else {
            //存在待绘制路径,反复绘制实现路径预览
            this.pathCount--;
            pathId = 'myPath_' + this.pathCount;
            circlesId = 'myCircles_' + this.pathCount;
            this.pathCount++;

            d3.select('#' + pathId)
                .attr('d', pathData)
                .style('fill', 'none')
                .style('stroke', '#999')
                .attr('stroke-width', curveWidth)

            let myPath = d3.select('#' + pathId).node();
        }
    }
    generateCurveLineAnimate() {
        //找到线的id与圆的id
        this.pathCount--;
        let pathId = 'myPath_' + this.pathCount,
            circlesId = 'myCircles_' + this.pathCount;
        this.pathCount++;

        let myPath = d3.select('#' + pathId).node()
        let totalLength = myPath.getTotalLength(),
            gap = 5,
            numberOfDots = Math.floor(totalLength / gap),
            count = 0,
            r = 2,
            circleBackColor = "white",
            circleColor = "blue";


        let essentialSpeed = totalLength / numberOfDots * 7, //计算动画速度
            speed = 4 //动画拖尾效果

        let duration = essentialSpeed,
            updateDuration = essentialSpeed * speed

        //通过path生成点数据
        let dotsData = d3.range(numberOfDots).map(function (d, i) {
            let length = myPath.getTotalLength() * (i / numberOfDots);
            let point = myPath.getPointAtLength(length);
            //return point.x; 
            return [point.x, point.y];
        });

        //生成点
        let dots = this.container.selectAll(".ddot")
            .data(dotsData)
            .enter()
            .append("circle")
            .attr('id', circlesId)
            .attr("cx", function (d, i) { return d[0]; })
            .attr("cy", function (d, i) { return d[1]; })
            .attr("r", r);

        //点动画
        let tid = setInterval(updateDots, duration);

        function updateDots() {
            d3.selectAll('#' + circlesId)
                .transition()
                .duration(updateDuration)
                .style("fill", function (d, i) {
                    let colour = circleBackColor
                    //if at the end or near the end of the path, start from the beginning
                    if (count == numberOfDots) {
                        if (i == numberOfDots || i == 0 || i == 1) {
                            colour = circleColor;
                        } else {
                            colour = circleBackColor;
                        };
                    } else if (count == (numberOfDots - 1)) {
                        if (i == numberOfDots || i == (numberOfDots - 1) || i == 0) {
                            colour = circleColor;
                        } else {
                            colour = circleBackColor;
                        };
                        //else shade the 3 dots from the count onwards
                    } else {
                        if (i == count || i == (count + 1) || i == (count + 2)) {
                            colour = circleColor;
                        } else {
                            colour = circleBackColor;
                        };
                    };
                    return colour
                });
            count = count == numberOfDots ? 0 : count + 1;
        };
    }
}