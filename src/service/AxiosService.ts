import axios, { AxiosResponse } from 'axios';

const AxiosService: any = {
  get: (url: string): Promise<AxiosResponse> =>
    axios.get(url, {
      timeout: 20000,
    }),
};

export default AxiosService;
