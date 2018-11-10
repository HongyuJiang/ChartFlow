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
                        <vs-avatar v-if="dim.type == 'ordinal'" text="O"/>
                        <vs-avatar v-if="dim.type == 'quantitative'" text="Q"/>
                        <vs-avatar v-if="dim.type == 'nominal'" text="N"/>
                        <vs-avatar v-if="dim.type == 'temporal'" text="T"/>
                      </template>
                    </vs-list-item>
                  </div>
              </vs-list>
             </div>
        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="top" vs-w="8">
             <div id='preview'><svg id ='editorborad'></svg></div>
        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="top" vs-w="2">
            <div id='editor'>

                <vs-button color="dark" type="filled" style="margin-left:10px">Add a layer</vs-button>

                <vs-button color="steelblue" type="filled" style="margin-left:10px">Add a chart</vs-button>

                <vs-list>
                    <vs-list-header class="dark" icon="settings" title="Configration - Global"></vs-list-header>
                    <vs-list-item icon="create">

                         <vs-select
                          class="selectExample"
                          label="Chart Type"
                          v-model="select3"
                          icon="arrow_downward"
                          >
                          <vs-select-item :key="index" :value="item.value" :text="item.text" v-for="(item,index) in options3" />
                        </vs-select>


                    </vs-list-item>
                    <vs-list-item icon="color_lens">

                       <span>
                        <input type="color"  v-model="fillColor">
                        <input type="text" v-bind:style="{ color: fillColor}" v-model="fillColor" placeholder="#000000"/>
                       </span>
                       
                    </vs-list-item>
                    
                    <vs-list-header class="dark" icon="settings" title="Configration - Encoding"></vs-list-header>
                    <vs-list-item title="X" subtitle="Dim">

                      <vs-select v-model="dimensions['x']">
                        <vs-select-item :key="index" :value="item.name" :text="item.name" v-for="(item,index) in fields" />
                      </vs-select>
                      <vs-select v-model="types['x']" >
                        <vs-select-item :key="index" :value="item.value" :text="item.text" v-for="(item,index) in typesPrefab" />
                      </vs-select>
      
                    </vs-list-item>
                     <vs-list-item title="Y" subtitle="Dim">
                      <vs-select v-model="dimensions['y']" >
                        <vs-select-item :key="index" :value="item.name" :text="item.name" v-for="(item,index) in fields" />
                      </vs-select>
                      <vs-select v-model="types['y']">
                        <vs-select-item :key="index" :value="item.value" :text="item.text" v-for="(item,index) in typesPrefab" />
                      </vs-select>
                    </vs-list-item>

                    <vs-list-header class="dark" icon="settings" title="Configration - Style"></vs-list-header>
                    <vs-list-item title="Markersize">
                      <vs-slider v-model="size" max='20' width='50'/>
                    </vs-list-item>
                    <vs-list-item title="Markernumber">
                      <vs-input-number v-model="number"/>
                    </vs-list-item>
                    
                </vs-list>
            </div>
        </vs-col>
    </vs-row>

    <vs-row vs-h="4">
      <vs-col vs-type="flex" vs-justify="left" vs-align="top" vs-w="12">
        <div id='thumbnail' style='overflow-x: auto; max-height:300px'>
          <vs-card :key="index" v-for="(_chart, index) in chartStore" style="display:inline; float:left; margin:10px">
            <div  class='card_container'>
              <div slot="header">
                <vs-chip>
                  <vs-avatar text="LD"/>
                  {{_chart.name}}
                </vs-chip>
              </div>
              <h4> Source: {{_chart.source}} </h4> 
              <h4> Dim: x: {{_chart.dimx}}, y: {{_chart.dimy}} </h4> 
              <div style="margin-top:20px">
                  <img :src="_chart.imgData" width="170">
              </div>
            </div>
        </vs-card>
        </div>
      </vs-col>
  
    </vs-row>

</div>

</template>
<script>
import vegaEmbed from "vega-embed";
import config from "../assets/config.json";
import sample_data from "../assets/data-sample.json";
import $ from "jquery";
import * as fs from "browserify-fs";
import dataHelper from "../Helper/dataHelper";
import BlueComponent from "../commons/BlueComponent";
import * as d3 from 'd3'


let global_data = sample_data;

export default {
  name: "blue-editor",
  data() {
    return {
      data: global_data,
      active: false,
      options3: config.chartType,
      select3: "bar",
      fillColor: "#664433",
      colorOptions: [
        { text: "Black", value: "#333333" },
        { text: "Red", value: "#993333" }
      ],
      fields: global_data.dimensions,
      dimensions: { x: "a", y: "b" },
      types: { x: "ordinal", y: "quantitative" },
      typesPrefab: config.typesPrefab,
      encoding: { x: {}, y: {} },
      size: 10,
      chartStore: [
        {
          name: "Chart I",
          dimx: "a",
          dimy: "b",
          imgDara: "123",
          source: "sampleData"
        }
      ],
      globalchartIndex: 0,
      dataList: [],
      number: 10,
      indexOfSelectedData: 0,
      width:0,
      height:0,

    };
  },
  methods: {
    chartInit(container, props) {
      let that = this

      for (let key in props) {
        this.data[key] = props[key];
      }

      this.chartResize(window.innerWidth * 0.5, window.innerHeight * 0.5);

      let svg = d3.select('#editorborad');

      let _one = new BlueComponent(svg, {'x': 100, 'y': 100})
  
    },
   
    chartResize(innerWidth, innerHeight) {
      let height = innerHeight > innerWidth * 2 ? innerWidth * 2 : innerHeight;
      let width = innerWidth;
      this.width = width;
      this.height = height;

      d3.select('#editorborad').attr('width', this.width).attr('height', this.height)

      //vegaEmbed("#preview", this.data);
    },
    dragstarted(node, d) {

      d3.select(node).raise().classed("active", true);
    },
    dragged(node, d){
    
      d3.select(node).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
    },
    dragended(node,d) {
      d3.select(node).classed("active", false);
    }
  },
  watch: {
    
  },
  mounted() {
    this.chartInit("#preview");

    window.addEventListener("resize", () => {
      this.chartResize(window.innerWidth * 0.5, window.innerHeight * 0.5);
    });

    dataHelper.getDataList().then(response => {
      this.dataList = response.data;
    });
  }
};
</script>

<style lang="stylus" scoped>
@import './Styles/editor';
</style>