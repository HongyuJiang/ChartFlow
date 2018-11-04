<template>

<div id="online-editor">
  <div id='preview'></div>
   <div id='editor'></div>
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
        data: data
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

        this.chartResize($('#preview').width(), $('#preview').height())
      },
      chartResize(innerWidth, innerHeight){

        let height = innerHeight > innerWidth * 2 ? innerWidth * 2 : innerHeight;

        let width = innerWidth/2;

        this.data['width'] = width
        
        this.data['height'] = height

        vegaEmbed("#preview", this.data);
      }

  },
  mounted(){

      this.chartInit("#preview");

      window.addEventListener('resize', () => {

        this.chartResize($('#preview').width(), $('#preview').height())
      });

  },
}
</script>

<style scoped>

#preview{

    height: 90%;
    width: 50%;
    right:0px;
}

#editor{

    height: 90%;
    width: 50%;
    left:0px;
}

#online-editor{

    position: relative;
    height: 100%;
    width: 100%;

}


</style>