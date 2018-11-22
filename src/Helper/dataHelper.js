import axios from 'axios';

export default class dataHelper {
    static getDataList() {

        return axios.post('http://localhost:3000/api/getDataList');
    }
    static getDataDetail(dataname) {

        return axios.post('http://localhost:3000/api/getData?dataname=' + dataname);
    }

    static fakeDataBaseProcess = {

        // innerJoin = _inner
        // leftJoin = _inner + _part(left)
        // rightJoin = _inner+ _part(right)
        // outerJoin = _inner + _part(left) + _part(right)

        _inner: function(data1, dataName1, data2, dataName2, column1, column2){

            //首先根据this.getSameColumns生成相同属性列
            //根据相同属性this.constructToJoinData生成待处理数据格式(便于后续操作)
            //两个数据表根据findSameKeyinTwoTableColumn找到对应列相同值
            //最后根据相同值生成合成数据
            //重复值处理 n*n
            
            let redata_1 = this.constructToJoinData(data1, column1, dataName1),
                redata_2 = this.constructToJoinData(data2, column2, dataName2),
                sameKey = this.findSameKeyinTwoTableColumn(data1, data2, column1, column2),
                resList = []

            //console.log(redata_1, redata_2, sameKey)
            
            //根据相同Key填充
            sameKey.forEach(function(d,i){
                let key = d,
                    table_1 = redata_1[d],
                    table_2 = redata_2[d]
                for(let i=0; i< table_1.length; i++){
                    let table_1_value = table_1[i],
                        obj = null
                    for(let j=0; j < table_2.length; j++){
                        let table_2_value = table_2[j]
                        obj = Object.assign(table_1_value, table_2_value)
                    }
                    resList.push(obj)
                }
            })

            //console.log(resList)
            
            return resList
            //根据sameKey生成合成数据
        },
        _part: function(data1, dataName1, data2, dataName2, column1, column2){
            //用于生成每个数据独有部分
            //left data_1 right data_2
            let diffKey = this.findDiffKeyinTwoTable(data1, data2, column1, column2),
                redata_1 = this.constructToJoinData(data1, column1, dataName1),
                redata = [],
                redata_2_dataNamelist = this.getDataNameColoumnsList(data2,dataName2)
            
            let addObj = {}
            //填充null
            redata_2_dataNamelist.forEach(function(d){
                if(!addObj.hasOwnProperty(d)){
                    addObj[d] = null
                }
            })
            //根据不同Key填充
            diffKey.forEach(function(d){
                let objList = redata_1[d]
                for(let i = 0; i< objList.length; i++){
                    let obj = objList[i]
                    redata.push(Object.assign(obj, addObj))
                }
            })
           
            return redata
        },
        getSameColumns: function(data1, data2){
            //查找相同列 查找两个数据表相同列
            let redata = []
            
            data1.forEach(function(d){
                if(data2.indexOf(d) != -1)
                    redata.push(d)
            })
            return redata
        },
        constructToJoinData: function(data, column, name){
            //根据将要处理的列 改变数据到预处理格式 便于后续搜索操作
            /*
                {'key':{},'key':{}}
            */
            let redata = {},
                tempdata = [],
                col = name + '&' + column

            let objectKeys = Object.keys(data[0])
            //改变键值 'key' -> 'dataName.key'
            data.forEach(function(d,i){
                let obj = {}

                for(let j=0; j<objectKeys.length; j++){
                    let key = objectKeys[j],
                        addKey = name + '&' + objectKeys[j]
                    if(!obj.hasOwnProperty(addKey) && key != 'StoreId' && key != 'isDelete'){
                        obj[addKey] = d[key]
                    }
                }
                tempdata.push(obj)
            })
            
            tempdata.forEach(function(d,i){
                let key = d[col]
                if(redata.hasOwnProperty(key)){
                    //如果已有该key 则追加数据
                    redata[key].push(d)
                } else {
                    //如果没有该key 则新建
                    redata[key] = []
                    redata[key].push(d)
                }
            })
            return redata
        },
        findSameKeyinTwoTableColumn: function(data1, data2, column1, column2){
            
            //在两个表指定列找到相同值
            let data_1_list = this.getColumnAttrUnrepeat(data1, column1),
                data_2_list = this.getColumnAttrUnrepeat(data2, column2),
                sameKey = []
    
            //A -> C
            data_1_list.forEach(function(d,i){
                if(data_2_list.indexOf(d) != -1 && sameKey.indexOf(d) == -1){
                    //元素如果在表2存在并且未加入sameKey
                    sameKey.push(d)
                }
            })

            //B -> C
            data_2_list.forEach(function(d,i){
                if(data_1_list.indexOf(d) != -1 && sameKey.indexOf(d) == -1){
                    //元素如果在表1存在并且没有加入到sameKey中
                    sameKey.push(d)
                }
            })
            return sameKey
        },
        findDiffKeyinTwoTable : function(data1, data2, column1, column2){
            ////在两个表指定列找到不同值 (table1 相对于 table2)
            let data_1_list = this.getColumnAttrUnrepeat(data1, column1),
                data_2_list = this.getColumnAttrUnrepeat(data2, column2),
                diffKey = data_1_list.filter( x => !data_2_list.includes(x))

            //console.log(diffKey)
            let redata = [...new Set(diffKey)]
           // console.log(redata)

            return redata
        },
        getColumnAttrUnrepeat: function(data, column){
            //获取数据某列所有不重复项
            let data_list = []
            //table A B C
            //去重初始化 每次合并根据结果多次添加
            data.forEach(function(d,i){
                if(d.hasOwnProperty(column)){
                    if(data_list.indexOf(d) == -1){
                        //去重添加
                        data_list.push(d[column])
                    }
                }
            })
            return data_list
        },
        getDataNameColoumnsList: function(data, name){
            //构造 dataName + key 属性返回
            return Object.keys(data[0]).map(x => name + '&' + x)
        }
    }

    static innerJoin(data1, data2){

        let dataName1 = data1.dataName
        let dataName2 = data2.dataName
        let column1 = data1.dim
        let column2 = data2.dim
        let dataset1 = data1.data
        let dataset2 = data2.data

        return this.fakeDataBaseProcess._inner(dataset1, dataName1, dataset2, dataName2, column1, column2)
    }

    static outerJoin(data1, data2){

        let dataName1 = data1.dataName
        let dataName2 = data2.dataName
        let column1 = data1.dim
        let column2 = data2.dim
        let dataset1 = data1.data
        let dataset2 = data2.data

        let innerData = this.fakeDataBaseProcess._inner(dataset1, dataName1, dataset2, dataName2, column1, column2),
            leftData = this.fakeDataBaseProcess._part(dataset1, dataName1, dataset2, dataName2, column1, column2),
            rightData = this.fakeDataBaseProcess._part(dataset1, dataName1, dataset2, dataName2, column1, column2)

        return innerData.concat(leftData.concat(rightData)) 
    }

    static leftJoin(data1, data2){

        let dataName1 = data1.dataName
        let dataName2 = data2.dataName
        let column1 = data1.dim
        let column2 = data2.dim
        let dataset1 = data1.data
        let dataset2 = data2.data

        let innerData = this.fakeDataBaseProcess._inner(dataset1, dataName1, dataset2, dataName2, column1, column2),
            leftData = this.fakeDataBaseProcess._part(dataset1, dataName1, dataset2, dataName2, column1, column2)

        return innerData.concat(leftData)
    }

    static rightJoin(data1, data2){

        leftJoin(data2, data1)
    }

  
}