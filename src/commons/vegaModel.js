export default class VegaModel {

    constructor(height, width, name) {

        this.data = {}

        this.data["width"] = width;
        this.data["height"] = height;
      
        this['data'].title = {

            "text": name,
            "anchor": "middle",
            "fontSize": 20
        }
   
    }
    setData(values){

        this.data['data'] = values

    }
    setEncoding(rule){

        if(this['data']['encoding'] == undefined){

            this['data'].encoding = []
        }

        let meta = {}

        meta['field'] = rule.name

        meta['type'] = rule.type

        this['data'].encoding[rule.key] = meta
    }
    setDescription(text){

        this['data'].description = text
    }  

    setMark(mark){

        this['data'].mark = mark
    }
    getOutput(){

        if(this.data['data'] != undefined && this.data['data']['values'] != undefined){

            if(this.mark != undefined){

                if(this['data']['encoding'] != undefined){

                    return this.data
                }
            }
        }

        return 'wrong argument'
    }

    getOutputForced(){

        return this.data
    }
}