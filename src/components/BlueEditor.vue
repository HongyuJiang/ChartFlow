<template>

<div id="blue-editor">

    <vs-navbar class="nabarx" color='#666'>
      <vs-button class="nav_opener" type="flat" icon="menu"></vs-button>

      <vs-navbar-title style="color:white">
        OpenVIS 
      </vs-navbar-title>

      <vs-spacer></vs-spacer>

      <vs-navbar-item index="0" style="color:white">
        <a href="#">Home</a>
      </vs-navbar-item> 
      <vs-navbar-item index="1" style="color:white">
        <a href="#">News</a>
      </vs-navbar-item>
      <vs-navbar-item index="2" style="color:white">
        <a href="#">Update</a>
      </vs-navbar-item>
    </vs-navbar>
  
     <vs-row vs-h="6">

        <vs-col id='data_list_container' vs-type="flex" vs-justify="left" vs-align="top" vs-w="2" style="max-height:700px;overflow-y:scroll">
             <div id='data_list'>
              <vs-list :key="index" v-for="(data, index) in dataList">
              
                  <vs-button color="dark" type="line" :key="data.index" v-on:click="dataSelected(index)" icon="menu">{{data.name}}</vs-button>
              
                  <vs-divider></vs-divider>
            
                  <div :key="index" v-for="(dim, index) in data.dimensions">
                    <vs-list-item>
                      <h3 style="float:left">{{dim.name}}</h3>
                       <vs-select style="float:left;width:170px" v-model="dim.type">
                        <vs-select-item :key="index" :value="item.value" :text="item.text" v-for="item,index in dataTypes" />
                      </vs-select>
                        <vs-avatar style="float:right" :color="dim.color" text="Add" v-on:click="dimensionSelected(data.name, dim)"/>
                    </vs-list-item>
                  </div>
              </vs-list>
             </div>
        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="top" vs-w="8">
             <div id='preview'><svg id ='editorborad'></svg></div>
        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="top" vs-w="2" style="max-height:700px;overflow-y:scroll">
            <div id='editor'>

              <vs-collapse accordion :key="index" v-for="(group, index) in componentTypes">
                <vs-collapse-item>
                  <div slot="header" style="color:white; border-left:white solid 2px; padding-left:10px">
                    {{group.name}}
                  </div>
                  <vs-list :key="index" v-for="(meta, index) in group.childrens">

                    <vs-button style="width:100%" color="rgb(134,4,98)" type="filled" :key="index" v-on:click="createNewComponent(group.name, meta)" icon="insert_chart">{{meta}}</vs-button>
                    <vs-divider></vs-divider>
                  </vs-list>  
                </vs-collapse-item>
              </vs-collapse >
            
            </div>
        </vs-col>
    </vs-row>

    <vs-row vs-h="4">
     <vs-col vs-type="flex" vs-justify="center" vs-align="top" vs-w="12">
             <div id='canvas'>
          
             </div>
        </vs-col>
    </vs-row>

    <vs-row vs-h="4">

  
    </vs-row>

</div>

</template>
<script>
import vegaEmbed from "vega-embed";
import config from "../assets/config.json";
import $ from "jquery";
import dataHelper from "../Helper/dataHelper";
import caculator_modules from "../Helper/caculator_modules";
import BlueComponent from "../commons/BlueComponent";
import * as d3 from "d3";
import blueComponentTypes from "../assets/blueComponentTypes.json";
import modelConfig from "../assets/modelConfig.json";
import BlueprintLine from "../commons/BlueprintLine";
import VegaModel from "../commons/vegaModel";

export default {
  name: "blue-editor",
  data() {
    return {
      active: false,
      indexOfSelectedData: 0,
      globalchartIndex: 0,
      dataList: [],
      componentTypes: blueComponentTypes,
      container: "",
      colors: {
        Data: "#F6BB42",
        Chart: "#967ADC",
        Caculator: "#37BC9B",
        Processer: "#ffa824",
        Connector: "#704cff",
        
      },
      modelConfig: modelConfig,
      selectedData: {},
      dataComponent: {},
      blueComponents: [],
      blueLines: [],
      connections: [],
      mouseAction: "",
      drawingLine: "",
      vegaObject:"",
      contextData:"",
      dataTypes:config.typesPrefab
    };
  },
  methods: {
    chartInit(container, props) {
      let that = this;

      for (let key in props) {
        this.data[key] = props[key];
      }
      this.container = d3.select("#editorborad");
      this.container.append('g').attr('id','grid_layer')
      this.chartResize(window.innerWidth * 0.65, window.innerHeight * 0.6);
    
    },
    drawGrids(){

      let lineData = []

      for(let i = 10;i<this.width;i+=20){

          lineData.push({'x1':i,'y1':0,'x2':i,'y2':this.height})
      }

      for(let i = 10;i<this.height;i+=20){

          lineData.push({'x1':0,'y1':i,'x2':this.width,'y2':i})
      }

      if(this.container != ''){

        this.container.select('#grid_layer').selectAll('*')
        .remove()

        this.container.select('#grid_layer').selectAll('.grid_lines')
        .data(lineData)
        .enter()
        .append('line')
        .attr('x1', function(d){
          return d.x1
        })
        .attr('x2', function(d){
          return d.x2
        })
        .attr('y1', function(d){
          return d.y1
        })
        .attr('y2', function(d){
          return d.y2
        })
        .attr('stroke','#666')
      }

    },
    chartResize(innerWidth, innerHeight) {
      let height = innerHeight > innerWidth * 2 ? innerWidth * 2 : innerHeight;
      let width = innerWidth;
      this.width = width;
      this.height = height;

      d3.select("#editorborad")
        .attr("width", this.width)
        .attr("height", this.height);

      this.drawGrids()
    },
    createNewComponent(group, name) {
      let properties = this.modelConfig[name];
      properties["fill"] = this.colors[group];
      properties["name"] = name;

      let _com = new BlueComponent(this.container, properties);
      this.addClickEvent2Circle(_com);
      this.blueComponents.push(_com);
    },
    getComponentByName(name){
      for(let i=0;i<this.blueComponents.length;i++){

        if(name == this.blueComponents[i].name){

          return this.blueComponents[i]
        }
      }
    },
    addClickEvent2Circle(com) {
      let that = this;

      this.container.on("mousemove", function(d) {
        if (
          that.mouseAction == "drawing_line" &&
          that.drawingLine.targetPort == ""
        ) {
          let coordinates = d3.mouse(this);
          that.drawingLine.dynamicGenerateCurveLine(coordinates);
          that.drawingLine.findNearestPoint(coordinates);
        }
      });

      com.getAllCircles().on("click", function(d) {
        let x = d.parentX + d.x;
        let y = d.parentY + d.y;

        let line = (that.drawingLine = new BlueprintLine(
          that.container,
          [x, y],
          d
        ));
        that.blueLines.push(line);

        that.mouseAction = "drawing_line";

        let allPorts = [];

        that.blueComponents.forEach(function(component) {
          let ports = component.getAllPorts();
          if (d.type == "in") {
            ports["outPorts"].forEach(function(d) {
              allPorts.push(d);
            });
          } else {
            ports["inPorts"].forEach(function(d) {
              allPorts.push(d);
            });
          }
        });
        line.setExstingPorts(allPorts);
      });
    },
    dimensionSelected(source, dim) {
      dim.checked = !dim.checked;

      if (dim.checked == true) dim.color = "primary";
      else dim.color = "#333";

      //forced update datalist to re-rendering
      let origin = this.dataList;
      this.dataList = [];
      this.dataList = origin;

      if (this.selectedData[source] != undefined) {
        if (this.selectedData[source][dim.name] != undefined) {
          this.selectedData[source][dim.name] = "0";
        } else {
          this.selectedData[source][dim.name] = "1";
          this.dataComponent[source].addPort("out", {
            name: dim.name,
            text: dim.name,
            dimension_type: dim.type,
            type: "out",
            attr: "field"
          });
          this.addClickEvent2Circle(this.dataComponent[source]);
        }
      } else {
        this.selectedData[source] = {};
        this.selectedData[source][dim.name] = "1";

        let properties = this.modelConfig["Table"];
        properties["outPorts"] = 
        [
          { 
            name: dim.name, 
            text: dim.name, 
            dimension_type: dim.type,
            type: "out", 
            attr: "field" 
          }
        ];
        properties["name"] = source;
        let _com = new BlueComponent(this.container, properties);
        this.dataComponent[source] = _com;
        this.addClickEvent2Circle(_com);
        this.blueComponents.push(_com);
      }
    },
    setVegaConfig(source, target){

      let that = this

      if (source.attr == "field" && target.attr == "encoding") {
        
        let meta = { 
          name: source.name, 
          key: target.name, 
          type: source.dimension_type 
        };

        let maker = that.modelConfig[target.parent].maker

        that.vegaObject.setEncoding(target.parent, meta);
        that.vegaObject.setMark(target.parent, maker);
        

      } 

      if(source.attr == 'field' && target.attr == "operator"){

          caculator_modules.setOperator(source.name)
          
          if(caculator_modules.operatorsSetted()){

            let result = {}

            if(target.parent == 'Sum'){

              result = caculator_modules.sum(that.vegaObject.getData())

            }

            if(target.parent == 'Reduce'){

              result = caculator_modules.reduce(that.vegaObject.getData())

            }

            let newData = result.data, newName = result.name

            that.vegaObject.setData(newData)

            caculator_modules.resetOperators()

            let _com = that.getComponentByName(target.parent)

            _com.setFieldName(newName)
            
          }
      }
    },

    connectionParse(connect) {

      let that = this

      if(this.vegaObject == '') this.vegaObject = new VegaModel(300,this.width,'Test');

      let source = connect.source;
      let target = connect.target;

    
      let dataNameDict = {}
      that.dataList.forEach(function(d){

        dataNameDict[d.name] = 1
      })

      if(source.parent in dataNameDict && source.parent != this.contextData){

        this.contextData = source.parent

        dataHelper.getDataDetail(source.parent).then(function(response) {

          that.vegaObject.setData(response.data.data.values);
          that.setVegaConfig(source, target)
        });
      }
      else{

        that.setVegaConfig(source, target)
      }

      let result = this.vegaObject.getOutputForced();

      vegaEmbed("#canvas", result, {theme: 'dark'});

      console.log(result);
    },
    changeDataType(name, dim){

      console.log(name, dim)
    }
  },
  watch: {
    blueComponents: {
      handler(curVal, oldVal) {
        if (curVal.length == oldVal.length) {
          for (let i = 0; i < curVal.length; i++) {
            let curEle = curVal[i];
            let preEle = oldVal[i];

            let curPos = curEle.getPos();
            let prePos = preEle.getPos();

            this.blueLines.forEach(function(line) {
              line.parentPosUpdated(
                curPos.dx,
                curPos.dy,
                curEle.inPorts,
                curEle.outPorts
              );

              curEle.resetDeltaPos();
              preEle.resetDeltaPos();
            });
          }
        }
      },
      deep: true
    },
    blueLines: {
      handler(curVal, oldVal) {
        if (this.connections.length < curVal.length) { 

          let tailNo = curVal.length - 1
          if (curVal[tailNo].targetPort != "") {

            this.connections.push({
              source: curVal[tailNo].sourcePort,
              target: curVal[tailNo].targetPort
            });

            this.connectionParse({
              source: curVal[tailNo].sourcePort,
              target: curVal[tailNo].targetPort
            });
          }
        }
      },
      deep: true
    }
  },
  mounted() {
    let that = this;
    this.chartInit("#preview");

    window.addEventListener("resize", () => {
      this.chartResize(window.innerWidth * 0.65, window.innerHeight * 0.6);
    });

    dataHelper.getDataList().then(response => {
      this.dataList = response.data;
      this.dataList.forEach(function(data) {
        data.dimensions.forEach(function(d) {
          d["checked"] = false;
        });
      });
    });

    setInterval(function() {
      that.blueLines.forEach(function(line) {
        line.animate();
      });
    }, 20);
  }
};
</script>

<style lang="stylus" scoped>
@import './Styles/editor';
</style>