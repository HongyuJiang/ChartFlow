const bytes = require('bytes')
const multer = require('multer')
const fs = require('fs')
const dataprocess = require('../models/dataprocess')
// 配置multer
// 详情请见https://github.com/expressjs/multer
//设置上传文件夹
const uploadFolder = './upload/';
const createFolder = function(folder){
    try{
        fs.accessSync(folder);  
    }catch(e){ 
        fs.mkdirSync(folder); 
    }
};
createFolder(uploadFolder);

// 通过 filename 属性定制
const storage = multer.diskStorage({ 
    destination: function (req, file, cb) {
        cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建 
    }, 
    filename: function (req, file, cb) { 
        // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943 
        cb(null, file.fieldname );   
    } 
});

const upload = multer({ storage: storage })

module.exports = upload