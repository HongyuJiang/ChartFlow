How to start?
    npm install
    npm start
    
How to use?
    post url: 'http://localhost:3000/api/getData'
        need data: none
        return data: 
            {
                "dimensions":[
                    {
                        "name": value,
                        "type": value
                    },{},
                    ...
                ],
                "description": "",
                "data":{
                    "values": [
                        {
                            key: value,
                            key: value
                        },{},
                    ]
                }
            }
        
    post url: 'http://localhost:3000/api/getDatalist'
        need data: none
        return data:
            [
                {
                    "name": value,
                    "dimensions":[
                        {
                            "name": value,
                            "type": value
                        },{},
                        ...
                    ]
                },{}
                ...
            ]