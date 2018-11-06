<template>

<div id="online-editor">

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

        <vs-col vs-type="flex" vs-justify="left" vs-align="top" vs-w="2">
             <div id='data_list'>

              <vs-list>
                <vs-list-header title="Sample Data" color="dark"></vs-list-header>
                <vs-list-item title="A" subtitle="Ordinal">
                  <template>
                    <vs-avatar text="O"/>
                  </template>
                </vs-list-item>
                <vs-list-item title="B" subtitle="Numerical">
                  <template>
                    <vs-avatar text="N"/>
                  </template>
                </vs-list-item>
          
              </vs-list>

             </div>
        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="top" vs-w="8">
             <div id='preview'></div>
        </vs-col>

        <vs-col vs-type="flex" vs-justify="center" vs-align="top" vs-w="2">
            <div id='editor'>

                <vs-button color="dark" type="filled" style="margin-left:10px">Add a layer</vs-button>

                <vs-button v-on:click="addChart" color="steelblue" type="filled" style="margin-left:10px">Add a chart</vs-button>

                <vs-list>
                    <vs-list-header class="dark" icon="settings" title="Configration - Global"></vs-list-header>
                    <vs-list-item icon="create">

                         <vs-select
                          class="selectExample"
                          label="Chart Type"
                          v-model="select3"
                          icon="arrow_downward"
                          >
                          <vs-select-item :key="index" :value="item.value" :text="item.text" v-for="item,index in options3" />
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
                        <vs-select-item :key="index" :value="item.value" :text="item.text" v-for="item,index in fields" />
                      </vs-select>
                      <vs-select v-model="types['x']" >
                        <vs-select-item :key="index" :value="item.value" :text="item.text" v-for="item,index in typesPrefab" />
                      </vs-select>
      
                    </vs-list-item>
                     <vs-list-item title="Y" subtitle="Dim">
                      <vs-select v-model="dimensions['y']" >
                        <vs-select-item :key="index" :value="item.value" :text="item.text" v-for="item,index in fields" />
                      </vs-select>
                      <vs-select v-model="types['y']">
                        <vs-select-item :key="index" :value="item.value" :text="item.text" v-for="item,index in typesPrefab" />
                      </vs-select>
                    </vs-list-item>

                    <vs-list-header class="dark" icon="settings" title="Configration - Style"></vs-list-header>
                    <vs-list-item title="Makersize">
                      <vs-slider v-model="size" max='20' width='50'/>
                    </vs-list-item>
                    
                </vs-list>
            </div>
        </vs-col>
    </vs-row>

    <vs-row vs-h="4">
      <vs-col vs-type="flex" vs-justify="left" vs-align="top" vs-w="12">
        <div id='thumbnail' style='overflow-x: auto; max-height:300px'>
          <vs-card :key="index" v-for="_chart in chartStore" style="display:inline; float:left; margin:10px">
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
        </vs-card>
        </div>
      </vs-col>
  
    </vs-row>

</div>

</template>
<script>

import vegaEmbed from 'vega-embed';
import config from '../assets/config.json'
import sample_data from '../assets/data-sample.json'
import $ from "jquery";
import * as fs from 'browserify-fs';

let global_data = sample_data

export default {
  name:'online-editor',
  data () {
    return {
        data: global_data,
        active:false,
        options3: config.chartType,
        select3:'bar',
        fillColor:'#664433',
        colorOptions:[
          {text: 'Black', value: '#333333'},
          {text: 'Red', value: '#993333'},
        ],
        fields:{},
        dimensions: {'x':'a','y':'b'},
        types: {'x':'ordinal','y':'quantitative'},
        typesPrefab: config.typesPrefab,
        encoding:{'x':{},'y':{}},
        size:10,
        chartStore:[
          { name:'Chart I', dimx:'a', dimy:'b', imgDara:'123', source:'sampleData'},
        
        ],
        globalchartIndex:0

    }
  },
  methods:{

      saveCanvas2Local(canvasContainer){

        $(canvasContainer + ' canvas').attr('id','myCanvas')

        let myCanvas = document.getElementById("myCanvas");

        let source = myCanvas.toDataURL("image/png");

        this.chartStore[this.globalchartIndex].imgData = source;

      },

      updateProp(prop, value){

          this.data[prop] = value
          vegaEmbed("#preview", this.data);
      },
      fieldsExtraction(dimensions){

        let rets = []

        let meta_x = {'text': dimensions[0], 'value': dimensions[0]}
        let meta_y = {'text': dimensions[1], 'value': dimensions[1]}
       
        rets.push(meta_x, meta_y)

        return rets;

      },
      chartInit(container, props){

        for (let key in props){

            this.data[key] = props[key]
        }

        vegaEmbed(container,this.data);

        this.fields = this.fieldsExtraction(global_data.dimensions)

        this.chartResize(window.innerWidth * 0.5, window.innerHeight * 0.5)

        this.saveCanvas2Local('#preview')
      },
      chartUpdate(container, props){

          for (let key in props){

              this.data[key] = props[key]
          }

        vegaEmbed(container,this.data);

        this.saveCanvas2Local('#preview')
      },
      chartEncodingUpdate(container, props){

          for (let key in props){

              this.data['encoding'][key] = props[key]
          }

        vegaEmbed(container,this.data);

        this.saveCanvas2Local('#preview')
      },
      chartResize(innerWidth, innerHeight){

        let height = innerHeight > innerWidth * 2 ? innerWidth * 2 : innerHeight;
        let width = innerWidth;
        this.data['width'] = width
        this.data['height'] = height

        vegaEmbed("#preview", this.data);
      },
      addChart(){

        let test_data = { name:'Chart I', dimx:'a', dimy:'b', imgDara:null, source:'sampleData'};

        this.chartStore.push(test_data)

        this.globalchartIndex += 1
      }

  },
  watch:{

    select3(curVal, oldVal){

      if(curVal != oldVal){

        this.chartUpdate("#preview", {'mark':curVal})
      }
    },
    fillColor(curVal, oldVal){

      if(curVal != oldVal){

        this.chartEncodingUpdate("#preview", {'color':{'value': curVal}})
      }
    },
    dimensions: {
      handler: function(newVal){
          this.encoding.x['field'] = newVal.x
          if(this.encoding.x['type'] != undefined && this.encoding.x['field'] != undefined){

             this.chartEncodingUpdate('#preview', this.encoding)
          }
    
          this.encoding.y['field'] = newVal.y
          if(this.encoding.y['type'] != undefined && this.encoding.y['field'] != undefined){
             
             this.chartEncodingUpdate('#preview', this.encoding)
          }
      
      },
      deep: true
    },
    types: {
      handler: function(newVal){
          this.encoding.x['type'] = newVal.x
          if(this.encoding.x['type'] != undefined && this.encoding.x['field'] != undefined){
             this.chartEncodingUpdate('#preview', this.encoding)
          }

          this.encoding.y['type'] = newVal.y
          if(this.encoding.y['type'] != undefined && this.encoding.y['field'] != undefined){
             
             this.chartEncodingUpdate('#preview', this.encoding)
          }
      },
      deep: true
    }
  },
  mounted(){

      this.chartInit("#preview");

      window.addEventListener('resize', () => {

        this.chartResize(window.innerWidth * 0.5, window.innerHeight * 0.5)
      });

  },
}
</script>

<style lang="stylus" scoped>

@import "./Styles/editor"

</style>