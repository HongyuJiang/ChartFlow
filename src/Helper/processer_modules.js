export default class processor_modules {


    //Data filter, global data will be updated
    static filter(data, range, dim){

        let newName = 'filtered_' + dim
        
        let newData = []

        data.forEach(function(d){

            if(d[dim] <= range[1] && d[dim] >= range[0])
            newData.push(d)
            
        })

        return {'data':newData,'name':newName}
        
    }
    //Data normalizer, the global data will be normalized
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