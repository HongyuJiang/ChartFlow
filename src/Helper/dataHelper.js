import axios from 'axios';

export default class dataHelper {
    static getDataList() {

        return axios.get('http://localhost:3000/api/getDatalist');
    }
  
}