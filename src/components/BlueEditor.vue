<template>

<div id="blue-editor">

    <vs-navbar class="nabarx" color='rgb(50, 60, 90)'>
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

    <div class='toolbar' style='position:absolute;top:45px;right:18%'>
      <vs-button class='tool_button' radius color="#1473e6" type="filled" icon="delete"></vs-button>
      <vs-button class='tool_button' radius color="#1473e6" type="filled" icon="timeline"></vs-button>
      <vs-button class='tool_button' radius color="#1473e6" type="filled" icon="view_quilt"></vs-button>

    </div>
  
     <vs-row vs-h="6">

        <vs-col id='data_list_container' vs-type="flex" vs-justify="left" vs-align="top" vs-w="2" style="max-height:800px;overflow-y:scroll">
             <div id='data_list'>
              <vs-list :key="index" v-for="(data, index) in dataList">
              
                  <vs-button color="dark" type="line" :key="data.index" icon="menu">{{data.name}}</vs-button>
                  <span style="color:rgb(20, 115, 230);padding:10px;float:right;font-size:13px">Length: {{data.length}}</span>
              
                  <vs-divider></vs-divider>
            
                  <div :key="index" v-for="(dim, index) in data.dimensions">
                    <vs-list-item>
                      <h3 style="float:left;color:white">{{dim.name}}</h3>
                       <vs-select style="float:left;width:170px" v-model="dim.type">
                        <vs-select-item :key="index" :value="item.value" :text="item.text" v-for="(item,index) in dataTypes" />
                      </vs-select>
                        <vs-avatar style="float:right;margin:0px;margin-left:10px" :color="dim.color" text="Add" v-on:click="dimensionSelected(data.name, dim)"/>
                    </vs-list-item>
                  </div>
              </vs-list>
             </div>
        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="top" vs-w="8">
             <div id='preview'><svg id ='editorborad'></svg></div>
        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="top" vs-w="2" style="max-height:800px;overflow-y:scroll">
            <div id='editor'>

              <vs-collapse accordion :key="item.name" v-for="item in componentTypes">
                <vs-collapse-item>
                  <div slot="header" style="color:white; border-left:white solid 2px; padding-left:10px">
                    {{item.name}}
                  </div>
                  <vs-list :key="index" v-for="(meta, index) in item.childrens">

                    <vs-button style="width:80%; justify-content: left; margin-left:10%" color="rgb(134,4,98)" type="filled"  v-on:click="createNewComponent(item.name, meta)" icon="add_circle">{{meta}}</vs-button>
                    <vs-divider></vs-divider>
                  </vs-list>  
                </vs-collapse-item>
              </vs-collapse >
            
              <vs-button style="width:50%; justify-content: right; float:right;margin-right:15%" color="#ED3500" type="filled" icon="apps">Find more component</vs-button>
            </div>
        </vs-col>
    </vs-row>

    <vs-row vs-h="4">
      <vs-col vs-type="flex" vs-justify="center" vs-align="top" vs-w="2">
             <div id='infoPanel' style='height:500px'>
                <vs-textarea style='color:white; height:500px' cols="100" rows="25" color='white' v-model="model_config_text" />
             </div>
    </vs-col>
     <vs-col vs-type="flex" vs-justify="center" vs-align="top" vs-w="10">
             <div id='canvas'> </div>
    </vs-col>
    </vs-row>

    <vs-row vs-h="4"></vs-row>

</div>

</template>
<script>
import vegaEmbed from "vega-embed";
import config from "../assets/config.json";
import $ from "jquery";
import dataHelper from "../Helper/dataHelper";
import caculator_modules from "../Helper/caculator_modules";
import processor_modules from "../Helper/processer_modules";
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
      dataList: [], //data candidates list
      componentTypes: blueComponentTypes, // components' types of blueprint
      container: "", //canvas to drawing blueprint
      modelConfig: modelConfig, //configuration detail of each component model
      selectedData: {}, //The dimensions in dataset which been selected by user
      dataComponent: {}, //The exsiting components in canvas (used to check the exsiting)
      blueComponents: [], //The exsiting components in canvas (used to store the exsiting)
      blueLines: [], //The exsiting line in canvas which connected to any component
      connections: [], //Store the connections between component which connected by curve
      mouseAction: "", //mouse action label which used to change the mouse action state
      drawingLine: "", //The line which is being darwing by user
      vegaObject: '', //The vege model configuration
      contextData: "", //Shows which dataset which is using in blueprint
      dataTypes: config.typesPrefab, //Store all the data type which supported by vega-lite
      model_config_text: "", //The text which translated by vega-lite model
      dataConnection:{},
      loadedDatasets:{}
    };
  },
  methods: {

    //Intialized the blueprint canvas
    chartInit(container, props) {
      let that = this;

      for (let key in props) {
        this.data[key] = props[key];
      }
      this.container = d3.select("#editorborad");
      this.container.append("g").attr("id", "grid_layer");
      this.chartResize(window.innerWidth * 0.65, window.innerHeight * 0.6);

      this.vegaObject = new VegaModel(parseInt(this.height / 2), parseInt(this.width * 1.1), "Test")
    },

    //Darwing the grids line in canvas which help user the recognize the canvas and components
    drawGrids() {
      let lineData = [];

      for (let i = 10; i < this.width; i += 20) {
        lineData.push({ x1: i, y1: 0, x2: i, y2: this.height });
      }

      for (let i = 10; i < this.height; i += 20) {
        lineData.push({ x1: 0, y1: i, x2: this.width, y2: i });
      }

      if (this.container != "") {
        this.container
          .select("#grid_layer")
          .selectAll("*")
          .remove();

        this.container
          .select("#grid_layer")
          .selectAll(".grid_lines")
          .data(lineData)
          .enter()
          .append("line")
          .attr("x1", d => d.x1)
          .attr("x2", d => d.x2)
          .attr("y1", d => d.y1)
          .attr("y2", d => d.y2)
          .attr("stroke", "#555");
      }
    },

    //Resize the canvas after window's size has been updated
    chartResize(innerWidth, innerHeight) {
      let height = innerHeight > innerWidth * 2 ? innerWidth * 2 : innerHeight;
      let width = innerWidth;
      this.width = width;
      this.height = height;

      d3.select("#editorborad")
        .attr("width", this.width)
        .attr("height", this.height);

      this.drawGrids();
    },

    //create a new component to canvas which need a component type and a unique name
    createNewComponent(group, name) {
      let properties = this.modelConfig[name];
      properties["fill"] = this.componentTypes[group].color;
      properties["name"] = name;

      let _com = new BlueComponent(this.container, properties);
      this.addClickEvent2Circle(_com);
      this.blueComponents.push(_com);

    },

    //find the component by the component's name
    getComponentByName(name) {
      for (let i = 0; i < this.blueComponents.length; i++) {
        if (name == this.blueComponents[i].name) {
          return this.blueComponents[i];
        }
      }
    },

    //boundind the click event to the circles which represent the ports in component
    addClickEvent2Circle(com) {
      let that = this;

      //darwing the connection line accroding to the mouse real-time position
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

      //after click the circle, there will new a line in canvas
      com.getAllCircles().on("click", function(d) {
        let x = d.parentX + d.x;
        let y = d.parentY + d.y;

        let line = (that.drawingLine = new BlueprintLine(
          that.container,
          com.name,
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
              d.parent = component.name
              allPorts.push(d);
            });
          } else {
            ports["inPorts"].forEach(function(d) {
              d.parent = component.name
              allPorts.push(d);
            });
          }
        });
        line.setExstingPorts(allPorts);
      });
    },

    ///////////////////////////////
    // Add dimension to context data from candicate dataset
    // IF the component is exsit:
    //     Add a port to the component
    // ELSE
    //     Add a new component contain this port
    ////////////////////////////////

    dimensionSelected(source, dim) {
      dim.checked = !dim.checked;

      let that = this

      if (dim.checked == true) dim.color = "#808080";
      else dim.color = "#202020";

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
        properties["outPorts"] = [
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
  
        if (!(source in this.loadedDatasets)){

          dataHelper.getDataDetail(source).then(function(response) {
            that.vegaObject.setData(response.data.data.values);
            //console.log('response', response)
            that.loadedDatasets[source] = response.data.data.values
          });
        }
      }
    },

    //The configurariton change rules
    async setVegaConfig(source, target) {
      let that = this;

      // The case of source attribution is 「FIELD」 and target is 「ENCODING」
      if (source.attr == "field" && target.attr == "encoding") {
        let meta = {
          name: source.name,
          key: target.name,
          type: source.dimension_type
        };

        let maker = that.modelConfig[target.parent].maker;

        that.vegaObject.setEncoding(target.parent, meta);
        that.vegaObject.setMark(target.parent, maker);
      }

      // The case of source attribution is 「FIELD」 and target is 「OPERATOR」
      if (source.attr == "field" && target.attr == "operator") {
        caculator_modules.setOperator(source.name);

        if (caculator_modules.operatorsSetted()) {
          let result = {};

          if (target.parent == "Sum")
            result = caculator_modules.sum(this.vegaObject.getData());
          else if (target.parent == "Reduce")
            result = caculator_modules.reduce(this.vegaObject.getData());
          else if (target.parent == "Multi")
            result = caculator_modules.multiple(this.vegaObject.getData());

          let newData = result.data,
            newName = result.name;
          this.vegaObject.setData(newData);
          caculator_modules.resetOperators();
          let _com = this.getComponentByName(target.parent);
          _com.setFieldName(newName);
        }
      }

      // The case of source attribution is 「FIELD」 and target is 「CONNECTOR」

      if (source.attr == "field" && target.attr == "connector") {

        if(this.loadedDatasets[source.parent] == undefined){
          
          await dataHelper.getDataDetail(source.parent).then(function(response) {

            that.loadedDatasets[source.parent] = response.data.data.values
          });
          
        }

        if (this.dataConnection[source.parent] == undefined){

          this.dataConnection[source.parent] = {'data': this.loadedDatasets[source.parent], 'dataName':source.parent, 'dim':source.name}

          let connectionNames = d3.keys(this.dataConnection);

          if (connectionNames.length == 2){

            let data1 = this.dataConnection[connectionNames[0]];
            let data2 = this.dataConnection[connectionNames[1]];

            if(target.parent == 'Left Join'){
              let newData = dataHelper.leftJoin(data1, data2)
              this.vegaObject.setData(newData)

              let _com1 = this.getComponentByName(connectionNames[0])
              let _com2 = this.getComponentByName(connectionNames[1])

              _com1.addDataName2Ports()
              _com2.addDataName2Ports()

              this.contextData = this.contextData + '.' + source.parent

            }
            else if (target.parent == 'Right Join'){

              let newData = dataHelper.rightJoin(data1, data2)
              this.vegaObject.setData(newData)

              let _com1 = this.getComponentByName(connectionNames[0])
              let _com2 = this.getComponentByName(connectionNames[1])

              _com1.addDataName2Ports()
              _com2.addDataName2Ports()

              this.contextData = this.contextData + '.' + source.parent

            }
            else if (target.parent == 'Inner Join'){

              let newData = dataHelper.innerJoin(data1, data2)
              this.vegaObject.setData(newData)

              let _com1 = this.getComponentByName(connectionNames[0])
              let _com2 = this.getComponentByName(connectionNames[1])

              _com1.addDataName2Ports()
              _com2.addDataName2Ports()

              this.contextData = this.contextData + '.' + source.parent

            }
            else{

              let newData = dataHelper.outerJoin(data1, data2)
              this.vegaObject.setData(newData)

              let _com1 = this.getComponentByName(connectionNames[0])
              let _com2 = this.getComponentByName(connectionNames[1])

              _com1.addDataName2Ports()
              _com2.addDataName2Ports()

              this.contextData = this.contextData + '.' + source.parent
          
            }
          }
          else if(d3.keys(this.dataConnection).length > 2){
            
            this.dataConnection[source.parent] = {}
            this.dataConnection[source.parent] = {'data': this.loadedDatasets[source.parent], 'dataName':source.parent, 'dim':source.name}
          }
         
        }

      }

      // The case of source attribution is 「FIELD」 and target is PROCESSOR
      if (source.attr == "field" && target.attr == "processor") {
        let sourcePortName = source.name;

       // console.log(this.loadedDatasets, this.contextData)

        if (target.parent == "Filter") {
          this.getComponentByName(target.parent).showDataPreview(

            this.loadedDatasets[this.contextData],
            sourcePortName
          );

          let _com = this.getComponentByName(target.parent);

          _com.setFieldName(source.name);
        } else if (target.parent == "Log") {
          let result = caculator_modules.log(
            this.vegaObject.getData(),
            sourcePortName,
            "e"
          );

          this.vegaObject.setData(result.data);
          let _com = this.getComponentByName(target.parent);
          _com.setFieldName(result.name);
        }
      }

      // The case of source attribution is 「PROCESSOR」 and target is 「ENCODING」
      if (source.attr == "processor" && target.attr == "encoding") {
        if (source.parent == "Filter") {
          let meta = {
            name: source.name,
            key: target.name,
            type: source.dimension_type
          };

          let ret = this.getComponentByName(
            source.parent
          ).getFilterRangeAndDim();

          let range = ret.range;
          let dimPreview = ret.dim;
          let result = processor_modules.filter(
            this.vegaObject.getData(),
            range,
            dimPreview
          );

          this.vegaObject.setData(result.data);
          let maker = this.modelConfig[target.parent].maker;

          this.vegaObject.setEncoding(target.parent, meta);
          this.vegaObject.setMark(target.parent, maker);
        }
      }
    },

    //If a new connection is built, the vega-lite configuration will be update
    connectionParse(connect) {
      let that = this;

      //If there is none vegaObject created, new one
    
      let source = connect.source;
      let target = connect.target;

      let dataNameDict = {};
      that.dataList.forEach(function(d) {
        dataNameDict[d.name] = 1;
      });

      if (source.parent in dataNameDict 
      && source.parent != this.contextData 
      && this.contextData.split('.').length < 2) {

        this.contextData = source.parent;
        that.setVegaConfig(source, target);
    
      } else {
        that.setVegaConfig(source, target);
      }

      let result = this.vegaObject.getOutputForced();

      //Show the result in bottom canvas via vage compilier
      vegaEmbed("#canvas", result, { theme: "dark" });
    },
    connectionRemove(connect){
      
    }
  
  },
  watch: {
    //Monitor the positon's change of component
    blueComponents: {
      handler(curVal, oldVal) {

        let that = this

        if (curVal.length == oldVal.length) {
          for (let i = 0; i < this.blueComponents.length; i++) {
            if(this.blueComponents[i].isDelete){

              //console.log(this.blueLines)

              let filterID = this.blueLines.filter(function(line, j){

                if(line.remove(that.blueComponents[i].name)){

                  that.connections.splice(j,1)

                  return true
                }

                return false
              })

              filterID.forEach(d => {

                this.blueLines.splice(d,1)
              })

              //console.log(this.blueLines)

              this.blueComponents.splice(i,1)
              break;
            }

            let curEle = curVal[i];
            let preEle = oldVal[i];

            //Obtain the newest postion of each component
            let curPos = curEle.getPos();
            let prePos = preEle.getPos();

            //Update all the line postion via the above positions
            this.blueLines.forEach(function(line) {
              line.parentPosUpdated(
                curPos.dx, //delta of horizon postion
                curPos.dy, //delta of vertical position
                curEle.inPorts,
                curEle.outPorts
              );

              //Reset all the delta postion
              curEle.resetDeltaPos();
              preEle.resetDeltaPos();
            });
          }
        }
      },
      deep: true
    },

    //Monitor the bluelines' length, if length increased, the new connection will be parsed
    blueLines: {
      handler(curVal, oldVal) {
        if (this.connections.length < curVal.length) {
          let tailNo = curVal.length - 1;
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

        /*if(this.connections.length == curVal.length){
          for (let i = 0; i < this.blueLines.length; i++) {
             if(this.blueLines[i].isDelete){
              this.blueLines.splice(i,1)

              break;
            }
          }
        }*/
      },
      deep: true
    },

    //Monitor the connections' change
    connections: {

      handler(curVal, oldVal) {

        //if (oldVal.length != curVal.length) {'
        
        let that = this

          this.vegaObject.reset()

          this.connections.forEach(function(conn){

            that.connectionParse(conn)
          })

          //let result = this.vegaObject.getOutputForced();
          //vegaEmbed("#canvas", result, { theme: "dark" });

        //}
      },
      deep:false
    },

    //Monitor the vegaObject, if it updated, the model configuration text will be updated
    vegaObject: {
      handler(curVal, oldVal) {
        this.model_config_text = JSON.stringify(
          this.vegaObject.getConfig(),
          null,
          4
        );
      },
      deep: true
    }
  },
  mounted() {
    let that = this;
    this.chartInit("#preview");

    //Set the init setting of textarea
    d3.selectAll("textarea")
      .style("color", "white")
      .style("font-size", "16px");

    //Add a listener for window's resize
    window.addEventListener("resize", () => {
      this.chartResize(window.innerWidth * 0.65, window.innerHeight * 0.6);
    });

    //Get the data candidates from server
    dataHelper.getDataList().then(response => {
      this.dataList = response.data;

      this.dataList.forEach(function(data) {
        data.dimensions.forEach(function(d) {
          d["checked"] = false;
          d["color"] = "#202020";
        });
      });
    });

    //Global control the animation of line or others
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