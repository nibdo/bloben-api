import axios, { AxiosResponse } from 'axios';

const AxiosService: any = {
  get: (url: string, language?: string): Promise<AxiosResponse> =>
    axios.get(url, {
      timeout: 20000,
      headers: {
        'Accept-Language': language || 'en',
      },
    }),
};

export default AxiosService;
