import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '../../redux/store';
import Toast from 'react-native-toast-message';
import { reset } from '../../helper/NavigationService';
import { GlobalLoaderController } from '../../context/GlobalLoaderContext';

const DEFAULT_BASE_URL = 'http://ec2-51-21-190-78.eu-north-1.compute.amazonaws.com:8000/';

let axiosInstance: AxiosInstance = createAxiosInstance();
let pendingRequestCount = 0;

/**
 * Dynamically create a new axios instance (useful if token or baseURL changes).
 */
function createAxiosInstance(baseURL = DEFAULT_BASE_URL): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // Request interceptor
  instance.interceptors.request.use(
    config => {
      // show loader for each outgoing request
      pendingRequestCount += 1;
      GlobalLoaderController.show('Loading...');
      const token = store.getState().authorization?.token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      __DEV__ &&
        console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`, {
          headers: config.headers,
          params: config.params,
          data: config.data,
        });

      return config;
    },
    error => {
      // decrement count on error before request is sent
      pendingRequestCount = Math.max(0, pendingRequestCount - 1);
      if (pendingRequestCount === 0) {
        GlobalLoaderController.hide();
      }
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.message || 'Request error',
        position: 'bottom',
      });
      return Promise.reject(error);
    }
  );


  // Response interceptor
  instance.interceptors.response.use(
    async (response: AxiosResponse) => {
      // decrement and possibly hide on success
      pendingRequestCount = Math.max(0, pendingRequestCount - 1);
      if (pendingRequestCount === 0) {
        GlobalLoaderController.hide();
      }
      __DEV__ && console.log(`[Response] ${response.status} ${response.config.url}`, response.data);

      const msg =
        response?.data?.Description ||
        response?.data?.message;

      if (typeof msg === 'string' && msg.includes('Unauthorized')) {
        Toast.show({
          type: 'error',
          text1: 'Session Expired',
          text2: 'Please login again.',
          position: 'top',
        });
        reset('Login');
        throw new Error('Unauthorized');
      }

      return response;
    },
    error => {
      // decrement and possibly hide on error
      pendingRequestCount = Math.max(0, pendingRequestCount - 1);
      if (pendingRequestCount === 0) {
        GlobalLoaderController.hide();
      }

      let msg = error.response?.data?.message || error.response?.data?.Description;

      if (!msg) {
        if (error.message === 'Network Error') {
          msg = 'Network Error: Please check your internet connection or server availability.';
        } else {
          msg = error.message || 'Something went wrong';
        }
      }

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: msg,
        position: 'bottom',
      });
      return Promise.reject(error);
    }
  );

  return instance;
}

// Generic API Service
class AxiosService {
  static refreshInstance(baseURL?: string) {
    axiosInstance = createAxiosInstance(baseURL);
  }

  static async get<T>(
    url: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await axiosInstance.get(url, {
      ...config,
      params,
    });
    return response.data;
  }

  static async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    formEncoded: boolean = false
  ): Promise<T> {
    const payload = formEncoded
      ? typeof data === 'string'
        ? data
        : new URLSearchParams(data).toString()
      : data;

    const headers = {
      ...(formEncoded
        ? { 'Content-Type': 'application/x-www-form-urlencoded' }
        : {}),
      ...config?.headers,
    };

    const response: AxiosResponse<T> = await axiosInstance.post(url, payload, {
      ...config,
      headers,
    });
    return response.data;
  }

  static async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await axiosInstance.put(url, data, config);
    return response.data;
  }

  static async delete<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await axiosInstance.delete(url, { ...config, data });
    return response.data;
  }

  static async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await axiosInstance.patch(url, data, config);
    return response.data;
  }
}

export default AxiosService;
