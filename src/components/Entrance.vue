<template>
    <div>
        <body-left/>
        <body-middle/>
        <body-bottom/>
    </div> 
</template>
<script>
import BodyLeft from '../commons/BodyLeft'
import BodyMiddle from '../commons/BodyMiddle'
import BodyBottom from '../commons/BodyBottom'
export default{
    name: 'entrance',
    components: {
        BodyLeft,
        BodyMiddle,
        BodyBottom
    }
}
</script>

<style>
</style>