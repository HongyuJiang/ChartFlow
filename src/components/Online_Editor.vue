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
  
    <vs-row>

        <vs-col vs-type="flex" vs-justify="left" vs-align="top" vs-w="2">
             <div id='data_list'>

              <vs-list>
                <vs-list-header title="Sample Data" color="dark"></vs-list-header>
                <vs-list-item title="A" subtitle="Ordinal">
                  <template vs-text="O">
                    <vs-avatar />
                  </template>
                </vs-list-item>
                <vs-list-item title="B" subtitle="Numerical">
                  <template vs-text="N">
                    <vs-avatar />
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

                <vs-button color="dark" type="filled">Add a layer</vs-button>

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
    </vs-row vs-h="4">
      <vs-col vs-type="flex" vs-justify="left" vs-align="top" vs-w="12">
        <div id='thumbnail'>
          <vs-card>
          <div slot="header">
       
            <vs-chip>
              <vs-avatar text="LD"/>
              Chart I
            </vs-chip>
            
          </div>
        
          <h4> Source: sample </h4> 
          <h4> Dim: x: a, y: b </h4> 
        
          <div id='imgContainer' style="margin-top:20px"></div>
  
        </vs-card>
        </div>
      </vs-col>
    <vs-row>

    </vs-row>

</div>

</template>
<script>

import vegaEmbed from 'vega-embed';
import config from '../assets/config.json'
import sample_data from '../assets/data-sample.json'
import $ from "jquery";
import * as fs from 'browserify-fs';
import canvasToImage from 'canvas-to-image';

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

    }
  },
  methods:{

      saveCanvas2Local(canvasContainer){

        $(canvasContainer + ' canvas').attr('id','myCanvas')

        let myCanvas = document.getElementById("myCanvas");

        let image = new Image()

        let source = myCanvas.toDataURL("image/png");

        image.src = source
        image.width = 170
     
        document.getElementById("imgContainer").appendChild(image);

        //var data = source.replace(/^data:image\/\w+;base64,/, "");

        //var buf = new Buffer(data, 'base64');

        //fs.writeFile('./test.jpg', buf)

        console.log(image)

	      return image;

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

        this.chartResize($('#app').width() * 0.5, $('body').height() * 0.8)

        this.saveCanvas2Local('#preview')
      },
      chartUpdate(container, props){

          for (let key in props){

              this.data[key] = props[key]
          }

        vegaEmbed(container,this.data);
      },
      chartEncodingUpdate(container, props){

          for (let key in props){

              this.data['encoding'][key] = props[key]
          }

        vegaEmbed(container,this.data);
      },
      chartResize(innerWidth, innerHeight){

        let height = innerHeight > innerWidth * 2 ? innerWidth * 2 : innerHeight;
        let width = innerWidth;
        this.data['width'] = width
        this.data['height'] = height

        vegaEmbed("#preview", this.data);
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

        console.log($('#preview').width())

        this.chartResize($('#app').width() * 0.5, $('body').height() * 0.8)
      });

  },
}
</script>

<style lang="stylus">

#online-editor
  width: 100%;

.header-sidebar
  display flex
  align-items center
  justify-content center
  flex-direction column
  width 100%
  h4
    display flex
    align-items center
    justify-content center
    width 100%
    > button
      margin-left 10px
      
.footer-sidebar
  display flex
  align-items center
  justify-content space-between
  width 100%
  > button
      border 0px solid rgba(0,0,0,0) !important
      border-left 1px solid rgba(0,0,0,.07) !important
      border-radius 0px !important

.vs-sidebar--background{

  background: none !important;
}

#preview
  padding-top:50px

#editor
  border-left 1px solid black
  padding-top:50px

#data_list
  border-right 1px solid black
  padding-top:50px

.con-vs-slider
  min-width:150px

.con-vs-card
  width:200px;

#thumbnail
  padding:30px;

.con-vs-chip
  float:none;

#data_list
  padding:30px
  min-width:300px

</style>