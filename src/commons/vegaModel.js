export default class VegaModel {

    constructor(height, width, name) {

        this.data = {}

        this.data["width"] = width;
        this.data["height"] = height;
        this.data["layer"] = [];
        this.data['background'] = '#202020'
        this.config = {}
      
        this['data'].title = {

            "text": name,
            "anchor": "middle",
            "fontSize": 20
        }

        this.layers = {}
   
    }
    getData(){

        return this.data['data']['values']
    }
    setData(values){

        this.data['data'] = {}

        this.data['data']['values'] = values

    }

    //Set the encoding rule, if there are one more layer, the encoding will add to corresponding with layer ID
    setEncoding(parent, rule){

        if(parent in this.layers){

            let meta = {'field': rule.name, 'type':rule.type}

            this.layers[parent].encoding[rule.key] = meta
            
        }
        else{

            this.layers[parent] = {'encoding':{}}
                
            let meta = {'field': rule.name, 'type':rule.type}

            this.layers[parent].encoding[rule.key] = meta

            this.layers[parent]['width'] = this.data["width"]

            this.layers[parent]['height'] = this.data["height"]

            this.data.layer.push(this.layers[parent])
        
        }

        console.log(this.data.layer)
        
    }
    setDescription(text){

        this['data'].description = text
    }  

    setMark(parent, mark){

        this.layers[parent].mark = mark

        if(mark == 'line'){

            let fill = ''
            let stroke = '#FE7F2D'
            this.layers[parent].mark = {'type':mark, 'fill':fill, 'stroke':stroke}
        }
        else if(mark == 'bar'){

            let fill = '#FCCA46'
            let stroke = ''
            this.layers[parent].mark = {'type':mark, 'fill':fill, 'stroke':stroke}
        }
        else if(mark == 'point'){

            let fill = '#A1C181'
            let stroke = '#fff'
            this.layers[parent].mark = {'type':mark, 'fill':fill, 'stroke':stroke}
        }
        else if(mark == 'boxplot'){

            let fill = '#57EC87'
            let stroke = '#fff'
            let opacity = '0.7'
            this.layers[parent].mark = {'type':mark, 'fill':fill, 'stroke':stroke, 'opacity': opacity}
        }

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

    //Output vega configuration and without check
    getOutputForced(){

        console.log(this.data)

        return this.data
    }

    //Get the vega configuration without detail data
    getConfig(){

        for(let key in this.data){

            if(key !== 'data'){

                this.config[key] = this.data[key]
            }
        }

        return this.config
    }
    reset(){

        this.data["layer"] = [];
        //this.data["data"] = {};
        this.layers = {}
    }
}