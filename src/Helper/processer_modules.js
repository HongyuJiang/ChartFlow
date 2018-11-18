export default class processor_modules {

    static filter(threshold,data,dim,operator){
        
        let newData = []

        data.forEach(function(d){

            if(operator == '='){

                if(d[dim] == threshold)
                newData.push(d)
                
            }
            else if(operator == '>'){

                if(d[dim] > threshold)
                newData.push(d)
            }
            else if(operator == '>='){

                if(d[dim] >= threshold)
                newData.push(d)
            }
            else if(operator == '<'){

                if(d[dim] <= threshold)
                newData.push(d)
            }
            else if(operator == '<='){

                if(d[dim] <= threshold)
                newData.push(d)
            }
        })

        return newData
        
    }
    static log(data,dim,base){

        let logged_name = 'log_' + dim

        data.forEach(function(d){

            if(base == 'e')
                data[dim] = Math.log(data[dim])
            else if(base == '10')
                data[dim] = Math.log10(data[dim])
            else if(base == '2')
                data[dim] = Math.log2(data[dim])
        })

        return {'data':data,'name':logged_name}
    }
    
}