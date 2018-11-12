<template>

<div id="blue-editor">

    <vs-navbar class="nabarx">
      <vs-button class="nav_opener" type="flat" icon="menu"></vs-button>

      <vs-navbar-title>
        OpenVIS 
      </vs-navbar-title>

      <vs-spacer></vs-spacer>

      <vs-navbar-item index="0">
        <a href="#">Home</a>
      </vs-navbar-item>
      <vs-navbar-item index="1">
        <a href="#">News</a>
      </vs-navbar-item>
      <vs-navbar-item index="2">
        <a href="#">Update</a>
      </vs-navbar-item>
    </vs-navbar>
  
     <vs-row vs-h="8">

        <vs-col id='data_list_container' vs-type="flex" vs-justify="left" vs-align="top" vs-w="2" style="max-height:700px;overflow-y:scroll">
             <div id='data_list'>
              <vs-list :key="index" v-for="(data, index) in dataList">
              
              
                  <vs-button v-if="index != indexOfSelectedData" color="dark" type="line" :key="data.index" v-on:click="dataSelected(index)" icon="menu">{{data.name}}</vs-button>
              
                  <vs-button v-if="index === indexOfSelectedData" color="dark" type="filled" :key="data.index" v-on:click="dataSelected(index)" icon="menu">{{data.name}}</vs-button>

                  <vs-divider></vs-divider>
            
                  <div :key="index" v-for="(dim, index) in data.dimensions">
                    <vs-list-item :title="dim.name" :subtitle="dim.type">
                      <template>
                        <vs-avatar :color="dim.color" :text="dim.type[0].toLocaleUpperCase()" v-on:click="dimensionSelected(data.name, dim)"/>
                      </template>
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
                  <div slot="header">
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

  
    </vs-row>

</div>

</template>
<script>
import vegaEmbed from "vega-embed";
import config from "../assets/config.json";
import sample_data from "../assets/data-sample.json";
import $ from "jquery";
import dataHelper from "../Helper/dataHelper";
import BlueComponent from "../commons/BlueComponent";
import * as d3 from 'd3'
import blueComponentTypes from "../assets/blueComponentTypes.json";
import modelConfig from "../assets/modelConfig.json";


let global_data = sample_data;

export default {
  name: "blue-editor",
  data() {
    return {
      active: false,
      indexOfSelectedData:0,
      size: 10,
      globalchartIndex: 0,
      dataList: [],
      number: 10,
      componentTypes:blueComponentTypes,
      container:'',
      colors:{'Data':'#233D4D', 'Chart':'#FE502D', 'Caculator':'#24B473', 'Operator':'#A31BF2'},
      modelConfig: modelConfig,
      selectedData:{},
      dataComponent:{},

    };
  },
  methods: {
    chartInit(container, props) {
      let that = this

      for (let key in props) {
        this.data[key] = props[key];
      }

      this.chartResize(window.innerWidth * 0.7, window.innerHeight * 0.7);
      this.container = d3.select('#editorborad');
     
    },
   
    chartResize(innerWidth, innerHeight) {
      let height = innerHeight > innerWidth * 2 ? innerWidth * 2 : innerHeight;
      let width = innerWidth;
      this.width = width;
      this.height = height;

      d3.select('#editorborad').attr('width', this.width).attr('height', this.height)

    },
    createNewComponent(group, name){

      let properties = this.modelConfig[name]
      properties['fill'] = this.colors[group]
      properties['name'] = name

      let _com = new BlueComponent(this.container, properties)
    },
    dimensionSelected(source, dim){
      dim.checked = !dim.checked;

      if (dim.checked == true) dim.color = 'primary';
      else dim.color = '#333';

      //forced update datalist to re-rendering
      let origin = this.dataList
      this.dataList = []
      this.dataList = origin

      if(this.selectedData[source] != undefined){
        if(this.selectedData[source][dim.name] != undefined){
          this.selectedData[source][dim.name] = '0'
        }
        else{
          this.selectedData[source][dim.name] = '1'
          this.dataComponent[source].addPort('out', {'name': dim.name,'text': dim.name})
        }
      }
      else{
        this.selectedData[source] = {}
        this.selectedData[source][dim.name] = '1'

        let properties = this.modelConfig['Table']
        properties['outPorts'] = [{'name': dim.name,'text': dim.name}]
        properties['name'] = source
        let _com = new BlueComponent(this.container, properties)
        this.dataComponent[source] = _com
      }

    }
  },
  watch: {
    
  },
  mounted() {
    this.chartInit("#preview");

    window.addEventListener("resize", () => {
      this.chartResize(window.innerWidth * 0.7, window.innerHeight * 0.7);
    });

    dataHelper.getDataList().then(response => {
      this.dataList = response.data;
      this.dataList.forEach(function(data){
        data.dimensions.forEach(function(d){
            d['checked'] = false;
        })
      })

    });
  }
};
</script>

<style lang="stylus" scoped>
@import './Styles/editor';
</style>