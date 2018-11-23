export default class caculator_modules {

    //Set calculator's operator, if A is occupied, set the B
    static setOperator(dimension){

        if(this.dimensionA == undefined)
            this.dimensionA = dimension
        else
            this.dimensionB = dimension
    }

    //Clear the operators
    static resetOperators(){

        this.dimensionA = undefined
        this.dimensionB = undefined
    }

    //Return if all the operactor is been setted
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
    static multiple(data) {

        let name = 'multi_'
        let that = this

        name = name + this.dimensionA + '_' + this.dimensionB

        data.forEach(function(d){

            d[name] = parseFloat(d[that.dimensionA]) * parseFloat(d[that.dimensionB])
        })

        return {'data':data,'name':name}
    }
  
}