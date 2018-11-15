export default class VegaModel {

    constructor() {

        this.data = {}

    }
    setData(values){

        this.data['data'] = values

    }
    setEncoding(rule){

        if(this['data']['Encoding'] == undefined){

            this['data'].Encoding = []
        }

        let meta = {}

        meta[rule.key] = rule.name

        meta['type'] = rule.type

        this['data'].Encoding.push(meta)
    }
    setTitle(title){

        this['data'].title = {

            "text": title,
            "anchor": "middle",
            "fontSize": 20
        }
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

                if(this['data']['Encoding'] != undefined){

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