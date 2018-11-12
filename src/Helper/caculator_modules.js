export default class caculator_modules {
    static add() {

        return axios.post('http://localhost:3000/api/getDataList');
    }
    static multiple() {

        return axios.post('http://localhost:3000/api/getDataList');
    }
    static reduce(dataname) {

        return axios.post('http://localhost:3000/api/getData?dataname=' + dataname);
    }
  
}