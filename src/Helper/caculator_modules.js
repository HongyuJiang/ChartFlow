export default class caculator_modules {

    static setOperator(dimension){

        if(this.dimensionA == undefined)
            this.dimensionA = dimension
        else
            this.dimensionB = dimension
    }
    static resetOperators(){

        this.dimensionA = undefined
        this.dimensionB = undefined
    }
    static operatorsSetted(){

        if(this.dimensionA != undefined && this.dimensionB != undefined){

            return true
        }
        return false
    }
    static sum(data) {

        let name = 'sum_'
        let that = this

        name = name + this.dimensionA + '_' + this.dimensionB

        data.forEach(function(d){

            d[name] = parseFloat(d[that.dimensionA]) + parseFloat(d[that.dimensionB])
        })

        return {'data':data,'name':name}
    }
    static reduce(data) {

        let name = 'reduce_'
        let that = this

        name = name + this.dimensionA + '_' + this.dimensionB

        data.forEach(function(d){

            d[name] = parseFloat(d[that.dimensionA]) - parseFloat(d[that.dimensionB])
        })

        return {'data':data,'name':name}
    }
    static multiple() {

        let name = 'multi_'

        for(i=0;i<dimensions.length;i++){

            name += dimensions[0]
        }

        data.forEach(function(d){

            let result = 0

            for(i=0;i<dimensions.length;i++){

                dim = dimensions[i]
                result +=  d[dim]
            }

            d[name] = result
        })

        return data
    }
  
}