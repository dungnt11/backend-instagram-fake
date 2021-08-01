import axios from 'axios';

axios.defaults.baseURL = process.env.TUNNEL_URL;

export default axios;
