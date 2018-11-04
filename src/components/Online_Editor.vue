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

     <vs-button @click="active=!active" color="primary" type="filled" style="float:left">Open Sidebar</vs-button>
    <vs-sidebar parent="body" default-index="1"  color="primary" class="sidebarx" spacer v-model="active">

      <div class="header-sidebar" slot="header">
        <vs-avatar  size="70px" src="https://randomuser.me/api/portraits/men/85.jpg"/>

        <h4>
          My Name
          <vs-button color="primary" icon="more_horiz" type="flat"></vs-button>
        </h4>

      </div>

      <vs-sidebar-item index="1" icon="question_answer">
        Dashboard
      </vs-sidebar-item>

      <vs-sidebar-item index="2" icon="gavel">
        History
      </vs-sidebar-item>

      <vs-divider icon="person" position="left">
        User
      </vs-divider>

      <vs-sidebar-item index="3" icon="verified_user">
        Configurations
      </vs-sidebar-item>
      <vs-sidebar-item index="4" icon="account_box">
        Perfile
      </vs-sidebar-item>
      <vs-sidebar-item index="5" >
        Card
      </vs-sidebar-item>

      <div class="footer-sidebar" slot="footer">
        <vs-button icon="reply" color="danger" type="flat">log out</vs-button>
        <vs-button icon="settings" color="primary" type="border"></vs-button>
      </div>

    </vs-sidebar>

  
    <vs-row>
        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="8">
             <div id='preview'></div>

        </vs-col>
        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="4">
            <div id='editor'>

                <vs-list>
                    <vs-list-header icon="supervisor_account" title="Group 1"></vs-list-header>
                    <vs-list-item icon="check" title="Snickerdoodle" subtitle="An excellent companion"></vs-list-item>
                    <vs-list-item icon="check" title="Sapporo Haru" subtitle="An excellent polish"></vs-list-item>
                    
                    <vs-list-header icon="supervisor_account" title="Group 1"></vs-list-header>
                    <vs-list-item icon="check" title="Snickerdoodle" subtitle="An excellent companion"></vs-list-item>
                    <vs-list-item icon="check" title="Sapporo Haru" subtitle="An excellent polish"></vs-list-item>
                    
                </vs-list>
            </div>
        </vs-col>
    </vs-row>

  
  
</div>

</template>
<script>

import vegaEmbed from 'vega-embed';
import $ from "jquery";

let data = {
    "width": 120,
    "height": 120,
      "description": "A simple bar chart with embedded data.",
      "data": {
        "values": [
          {"a": "A","b": 28}, {"a": "B","b": 55}, {"a": "C","b": 43},
          {"a": "D","b": 91}, {"a": "E","b": 81}, {"a": "F","b": 53},
          {"a": "G","b": 19}, {"a": "H","b": 87}, {"a": "I","b": 52}
        ]
      },
      "mark": "bar",
      "encoding": {
        "x": {"field": "a", "type": "ordinal"},
        "y": {"field": "b", "type": "quantitative"}
      }
    }



export default {
  name:'online-editor',
  data () {
    return {
        data: data,
        active:false,
    }
  },
  methods:{

      updateProp(prop, value){

          this.data[prop] = value
          vegaEmbed("#preview", this.data);
      },

      chartInit(container, props){

          for (let key in props){

              this.data[key] = props[key]
          }

        vegaEmbed(container,this.data);

        this.chartResize($('#preview').width(), $('body').height() * 0.8)
      },
      chartResize(innerWidth, innerHeight){

        let height = innerHeight > innerWidth * 2 ? innerWidth * 2 : innerHeight;

        let width = innerWidth;

        this.data['width'] = width
        
        this.data['height'] = height

        vegaEmbed("#preview", this.data);
      }

  },
  mounted(){

      this.chartInit("#preview");

      window.addEventListener('resize', () => {

        this.chartResize($('#preview').width(), $('body').height() * 0.8)
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


</style>