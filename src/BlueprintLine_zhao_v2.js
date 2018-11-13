
import * as d3 from 'd3'
import $ from 'jquery'
export default class BlueprintLine{
    constructor(svgId, point){
        //points [x,y]
        let that = this
        this.points = [point,point] //用于存储预览曲线时的两点
        this.svgWidth = 0
        this.svgHeight = 0
        this.svgId = 'bodymiddle'
        this.storePoints = [point,point] //初始点和预览点
        this.isWaitPath = false //false -> path正在移动 true -> path已经确定
        this.circleCoordinatesX = '' //预览路径时末端端点X
        this.circleCoordinatesY = '' //预览路径时末端端点Y
        this.pathCount = 0
        this.toUpdateSourcePoint = false // false -> update target point / true -> update source point
        this.timer = {}
        }

        init () {
            let that = this
            let svg = d3.select('#' + this.svgId);
            this.svgWidth = svg.attr('width');
            this.svgHeight = svg.attr('height');
            this.pathCount++
            let jqsvg = $('#' + this.svgId)
            svg.on('mousemove.circle', null)
            svg.on('mousemove.circle', function(d){
                //监听鼠标移动更新计算预览点 生成预览曲线
                let coordinates = d3.mouse(this)
                that.dynamicGenerateCurveLine(coordinates)
            })

            jqsvg.one('click.circle', function(d){
                //确认预览曲线 生成动画
                svg.on('mousemove.circle', null)
                //that.generateCurveLineAnimate()
                that.generateAnimateCoverCurveLine()
                that.isWaitPath == false
                that.generateEndPoints()
            })
        }
        
        calculateCurvePointInterpolation (points) {
            //description 通过两点计算出中间曲线路径两个锚点
            //input [[xa,ya],[xb,yb]]
            //output [[xa,ya],[x1,y1],[x2,y2],[xb,yb]]
            let xa = points[0][0],
                ya = points[0][1],
                xb = points[1][0],
                yb = points[1][1];
            
            //[[xa,ya],[x1,y1],[x2,y2],[xb,yb]]
            let xabs = Math.abs(xa-xb),
                yabs = Math.abs(ya-yb),
                pControl = 0.3,
                x1,y1,x2,y2;
            
            //[xb,yb]相对于[xa,ya]的位置
            if((xa == xb && ya > yb) || (xa == xb && ya < yb)) {
                //位于y轴负向 y轴正向
                x1 = xa;
                y1 = ya;
                x2 = xb - yabs * pControl;
                y2 = yb;
            }
            else if((xa < xb && ya == yb) || (xa >xb && ya == yb)) {
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
            else if((xa > xb && ya < yb) || (xa > xb && ya > yb)) {
                //位于左上左下
                x2 = xb + xabs * pControl;
                y2 = yb;
                x1 = xa - xabs * pControl;
                y1 = ya;
            }
            points = [[xa,ya],[x1,y1],[x2,y2],[xb,yb]]
            return points
        }
        generateCurveLine (points) {
            //description 根据d3.curveBasis生成曲线
            //input [[xa,ya],[x1,y1],[x2,y2],[xb,yb]]

            let svg = d3.select('#' + this.svgId);
            //曲线生成器
            let lineGenerator = d3.line().curve(d3.curveBasis),
                pathData = lineGenerator(points),
                curveWidth = '2px',
                pathId = '';
            
            if(this.isWaitPath == false){
                //没有待绘制路径,路径第一次绘制
                pathId = 'myPath_' + this.pathCount;
                
                this.isWaitPath = !this.isWaitPath
                let path = svg.append('path')
                        .attr('d', pathData)
                        .style('fill', 'none')
                        .style('stroke', '#999')
                        .attr('id', pathId)
                        .attr('stroke-width', curveWidth)
            } else {
                //存在待绘制路径,反复绘制实现路径预览
                pathId = 'myPath_' + this.pathCount;

                d3.select('#' + pathId)
                    .attr('d', pathData)
                    .style('fill', 'none')
                    .style('stroke', '#999')
                    .attr('stroke-width', curveWidth)
            }
        }
        generateAnimateCoverCurveLine () {
            let svg = d3.select('#' + this.svgId);
            //曲线生成器
            let points = this.calculateCurvePointInterpolation(this.storePoints)
            let lineGenerator = d3.line().curve(d3.curveBasis),
                pathData = lineGenerator(points),
                curveWidth = '2px',
                pathId = 'myCoverPath_' + this.pathCount,
                timerId = 'myCoverPathTimer_' + this.pathCount,
                timer = null,
                count = 10000,
                animateSpeed = 5,
                totalLength = 0
            
            //生成渐变
            let defs = svg.append('defs')
            let linearGradient = defs.append('linearGradient')
                    .attr('id', 'linearColor')
                    .attr('x1', '0%')
                    .attr('y1', '0%')
                    .attr('x2', '100%')
                    .attr('y2', '0%')

            let stop1 = linearGradient.append("stop")
					.attr("offset","0%")
                    .style("stop-color",'blue');
                    
            let stop2 = linearGradient.append("stop")
					.attr("offset","100%")
					.style("stop-color",'green'); 

            //绘制cover曲线
            let path = svg.append('path')
                        .attr('d', pathData)
                        .style('fill', 'none')
                        .style('stroke', "url(#" + linearGradient.attr("id") + ")")
                        .attr('id', pathId)
                        .attr('stroke-width', curveWidth)
            
            //获取生成曲线长度并设定线段间隔为曲线长度
            totalLength = d3.select('#' + pathId).node().getTotalLength()
            path.style('stroke-dasharray', totalLength + "," + totalLength)
            
            //生成计时器 通过变化位移实现动画
            timer = setInterval(function(){
                count = count - animateSpeed;
                d3.select('#' + pathId)
                    .style('stroke-dashoffset', count)
            },20);
            
            //存储timerId
            if(!(timerId in this.timer)){
                this.timer[timerId] = timer
            }
        }

        generateEndPoints () {
            let that = this
            let svg = d3.select('#' + this.svgId);
            let pathCount = this.pathCount
            let circleSourceId = 'mySourceCircle_' + this.pathCount;
            let circleTargetId = 'myTargetCircle_' + this.pathCount;

            let circleSource = svg.append('circle')
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
            
            let circleTarget = svg.append('circle')
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

            function dragstarted(d){}
            function dragged(d){
                //端点随着鼠标移动
                d3.select(this).attr("cx", d3.event.x).attr("cy", d3.event.y);
                //judge source point / target point
                that.toUpdateSourcePoint = d3.select(this).attr('pointPosition') == '0' ? true : false

                let coverPathId = 'myCoverPath_' + d3.select(this).attr('pathCount'),
                    timerId = 'myCoverPathTimer_' + d3.select(this).attr('pathCount'),
                    coverPath = d3.select('#' + coverPathId); 
                
                //删除coverPath
                coverPath.remove()
                
                //清楚计时器
                if(timerId in that.timer){
                    clearInterval(that.timer[timerId])
                    delete that.timer[timerId]
                }

                let coordinates = d3.mouse(this)
                that.dynamicGenerateCurveLine(coordinates)
            }
            
            function dragended(d){
                that.generateAnimateCoverCurveLine()
                that.isWaitPath == false
            }
        }

        dynamicGenerateCurveLine (coordinates) {

            this.circleCoordinatesX = coordinates[0]
            this.circleCoordinatesY = coordinates[1]

            if(this.toUpdateSourcePoint == false && this.storePoints.length == 2){
                    //update target point [ [] , [to do] ]
                this.storePoints.pop()
                this.storePoints.push([this.circleCoordinatesX, this.circleCoordinatesY])
            }

            if(this.toUpdateSourcePoint == true && this.storePoints.length == 2){
                //update source point [ [to do] , [] ]
                this.storePoints.shift()
                this.storePoints.unshift([this.circleCoordinatesX, this.circleCoordinatesY])
            }
            let p = this.calculateCurvePointInterpolation(this.storePoints)
            this.generateCurveLine(p)
        }
    }