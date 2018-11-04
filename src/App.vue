<template>
  <div id="app">
    <OnlineEditor/>
  </div>
</template>

<script>
import OnlineEditor from './components/Online_Editor'

export default {
  name: 'App',
  components: {
    OnlineEditor
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  position: relative;
  width: 100%;
  height: 100%;
  min-height:800px;
  
}

body{

  position: relative;
  width: 100%;
  height: 100%;
  min-height:800px;
}
</style>
