import axios from 'axios';

export default class dataHelper {
    static getDataList() {

        return axios.post('http://localhost:3000/api/getDataList');
    }
    static getDataDetail(dataname) {

        return axios.get('http://localhost:3000/api/getInitData?dataName=' + dataname);
    }
  
}