const express = require('express');
const upload = require('./multer')
const router = express.Router();
const fs = require('fs')


const dataProcessFunc = require('../models/dataprocess');
const dataProcess = dataProcessFunc.dataProcess
const dataBuffer = dataProcessFunc.dataBuffer

//api
    //上传并保存数据
router.post('/changeAvatar', upload.single(), function(req, res){
    const avatar = req.files.null;
    avatar.mv('./upload/'+ avatar.name, function(err){
        if(err)
            return res.status(500).send(err);
        dataname = avatar.name.split('.')[0];
        datatype = avatar.name.split('.')[1];
        dataProcess.storeData(dataname, datatype)
        res.send('File uploaded!')
    });
})
    //获取已上传数据列表
router.post('/getDatalist', function(req, res, next){
    res.setHeader('Content-Type', 'application/json');
    res.json(dataBuffer.getDataKeysList())
    //
})

router.post('/getData' ,function(req, res, next){

    let dataName = req.query.dataname
    
    //随机表
    //let dataNameList = dataBuffer.getDataNameList()
    //let randomKey = Math.floor(Math.random() * dataNameList.length)
    //let dataName = dataNameList[randomKey]
    
    resData = {
        "dimensions": dataBuffer.getDataDimensions(dataName),
        "description": "",
        "data": {
            "values": dataBuffer.getData(dataName)
        },
        "title": {
            "text": "A Simple Bar Chart",
            "anchor": "middle",
            "fontSize": 20
        }
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.json(resData)
})

router.post('/test' ,function(req, res, next){
    
    res.setHeader('Content-Type', 'application/json');
    res.json(dataBuffer)
})
    //暂时使用默认存入数据功能
const storeDefaultData = function(){
    fs.readdir(process.cwd() + "/upload", function(err, files){
        //file -> list
        if (err) {
            console.log(err);
        }
        files.forEach(function(d,i){
            let dataName = d.split('.')[0]
            let dataType = d.split('.')[1]
            dataProcess.storeData(dataName, dataType)
        })
    })
}
storeDefaultData();

module.exports = router;