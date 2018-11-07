<template>
    <div id = "bodymiddle">
        <vs-card style="height:770px">
        <tool-bar/>
        </vs-card>
    </div>
</template>
<script>
import ToolBar from './ToolBar'

export default{
    name: 'BodyMiddle',
    components: {ToolBar}
}
</script>
<style scoped>
    #bodymiddle{
        float: left;
        width: 85%;
        height: 780px;
        border: 2px solid #000;
    }
</style>