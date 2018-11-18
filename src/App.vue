<template>
  <div id="app">
   <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'App',
  
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  height: 100%;
  min-height:800px;
  
}

body{

  position: relative;
  width: 100%;
  height: 100%;
  min-height:800px;
  background: #202020
}

</style>
