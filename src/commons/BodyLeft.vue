<template>
    <div id = "bodyleft" class="sidebar">
        <div class="sponsor-sidebar">
            <vs-row vs-justify="center">
                <vs-col vs-type="flex" vs-justify="center" vs-align="center">
                    <vs-card>
                    <vs-upload action="http://localhost:3000/api/changeavatar" @on-success="successUpload"/>
                    <div slot="footer">
                        <vs-row vs-justify="flex-end">
                            <vs-button vs-type="gradient" color="danger" vs-icon="favorite"></vs-button>
                            <vs-button color="primary" vs-icon="turned_in_not"></vs-button>
                            <vs-button color="rgb(230,230,230)" color-text="rgb(50,50,50)" vs-icon="settings"></vs-button>
                        </vs-row>
                    </div>
                    </vs-card>
                </vs-col>
            </vs-row>

            <vs-row vs-justify="center">
                <vs-col vs-type="flex" vs-justify="center" vs-align="center">
                    <vs-card style="height:900px">
                    <div slot="header">
                        <h3> 数据表 </h3>
                    </div>

                    <div>
                        <vs-list>
                            <vs-list-item title="Snickerdoodle">
                            <vs-checkbox color="danger"/>
                            </vs-list-item>
                            <vs-list-item title="Sapporo Haru">
                            <vs-checkbox color="danger"/>
                            </vs-list-item>
                        </vs-list>
                    </div>
                    </vs-card>
                </vs-col>
            </vs-row>
        </div>
    </div>
</template>
<script>

export default {
  methods:{
    successUpload(event){
      console.log(event)
      let img = event.target.files[0];
      let size = img.size;
      let Form = new FormData();
      Form.append('avatar', img, this.avatar_name);
      API.successUpload(Form)
        .then((response) => {
            console.log('this is response' + response)
        })
        .catch((error) => {
            console.log('this is the:' + error)
        })
      this.$vs.notify({color:'success',title:'Upload Success',text:'Lorem ipsum dolor sit amet, consectetur'})
    }
  }
}
</script>
<style scoped>
    #bodyleft{
        float: left;
        width: 15%;
        height: 1042px;
        border: 2px solid #000;
    }

    .sidebar{
        font-size: 14px;
        background-color: #f5f7fb;
        width: 15rem;
        z-index: 1010;
        margin: 0;
        top: 3rem;
        left: 0;
        bottom: 0;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        overflow-y: auto;
    }

    .vs-list .vs-list-item .list-title{
        float: left
    }

    .vs-list .vs-list-item .list-subtitle{
        float: left
    }
</style>