export default class caculator_modules {
    static add(data, dimensions) {

        let name = 'sum_'

        for(i=0;i<dimensions.length;i++){

            name += dimensions[0]
        }

        data.forEach(function(d){

            let sum = 0

            for(i=0;i<dimensions.length;i++){

                dim = dimensions[i]
                sum +=  d[dim]
            }

            d[name] = sum
        })

        return data
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