export type BaseUrl = string;
export type RequestMethod = RequestInit['method'];
export interface FetchesSearchParams {
  [key: string]: boolean | number | string | string[] | null | undefined;
}

type _RequestConfig = RequestInit & {
  url: string;
  _retry?: boolean;
  headers?: Record<string, string>;
  params?: FetchesSearchParams;
};

export type SuccessResponseFun = <T = any>(
  response: FetchesResponse<T>
) => FetchesResponse<T> | Promise<FetchesResponse<T>>;
export type SuccessRequestFun = (
  config: _RequestConfig
) => _RequestConfig | Promise<_RequestConfig>;

export type ResponseError = Error & { config: _RequestConfig; response: FetchesResponse<any> };
export type FailureResponseFun = (e: ResponseError) => any;
export type FailureRequestFun = (e: ResponseError) => any;

export interface RequestInterceptor {
  onFailure?: FailureRequestFun;
  onSuccess?: SuccessRequestFun;
}

export interface ResponseInterceptor {
  onFailure?: FailureResponseFun;
  onSuccess?: SuccessResponseFun;
}
export interface Interceptors {
  request?: RequestInterceptor[];
  response?: ResponseInterceptor[];
}

export type RequestBody = FormData | Record<string, any>;

export interface RequestOptions extends Omit<RequestInit, 'method'> {
  headers?: Record<string, string>;
  params?: FetchesSearchParams;
}

export type FetchesRequestConfig<Params = undefined> = Params extends undefined
  ? { params?: undefined; config?: RequestOptions }
  : { params: Params; config?: RequestOptions };

export interface FetchesParams {
  baseURL: BaseUrl;
  headers?: Record<string, string>;
}

export interface FetchesResponse<T> {
  config: _RequestConfig;
  data: T;
  headers: Headers;
  status: number;
  statusText: string;
  url: string;
}

class Fetches {
  readonly baseURL: BaseUrl;

  public headers: Record<string, string>;

  readonly interceptorHandlers: Interceptors;

  readonly interceptors: {
    request: {
      use: (onSuccess?: SuccessRequestFun, onFailure?: FailureRequestFun) => RequestInterceptor;
      eject: (interceptor: RequestInterceptor) => void;
    };
    response: {
      use: (onSuccess?: SuccessResponseFun, onFailure?: FailureResponseFun) => ResponseInterceptor;
      eject: (interceptor: ResponseInterceptor) => void;
    };
  };

  constructor(params?: FetchesParams) {
    const { baseURL = '', headers = {} } = params ?? {};
    this.baseURL = baseURL;
    this.headers = headers;
    this.interceptorHandlers = { request: [], response: [] };
    this.interceptors = {
      request: {
        use: (onSuccess, onFailure) => {
          const interceptor = { onSuccess, onFailure };
          this.interceptorHandlers.request?.push(interceptor);
          return interceptor;
        },
        eject: (interceptor) => {
          this.interceptorHandlers.request = this.interceptorHandlers.request?.filter(
            (interceptorLink) => interceptorLink !== interceptor
          );
        }
      },
      response: {
        use: (onSuccess, onFailure) => {
          const interceptor = { onSuccess, onFailure };
          this.interceptorHandlers.response?.push(interceptor);
          return interceptor;
        },
        eject: (interceptor) => {
          this.interceptorHandlers.response = this.interceptorHandlers.response?.filter(
            (interceptorLink) => interceptorLink !== interceptor
          );
        }
      }
    };
  }

  setHeaders(headers: Record<string, string>) {
    this.headers = { ...this.headers, ...headers };
  }

  private createSearchParams(params: FetchesSearchParams) {
    const searchParams = new URLSearchParams();

    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        const value = params[key];

        if (value === undefined || value === null) continue;

        if (Array.isArray(value)) {
          value.forEach((currentValue) => searchParams.append(key, currentValue));
        } else {
          searchParams.set(key, value.toString());
        }
      }
    }

    return `?${searchParams.toString()}`;
  }

  private async runResponseInterceptors<T>(
    initialResponse: Response,
    initialConfig: _RequestConfig
  ) {
    const body = await this.parse<T>(initialResponse);
    let response = {
      data: body,
      url: initialResponse.url,
      headers: initialResponse.headers,
      status: initialResponse.status,
      statusText: initialResponse.statusText,
      config: initialConfig
    } as FetchesResponse<T>;

    if (!this.interceptorHandlers.response?.length) return response;

    for (const { onSuccess, onFailure } of this.interceptorHandlers.response) {
      try {
        if (!initialResponse.ok)
          throw new Error(initialResponse.statusText, {
            cause: { config: initialConfig, response }
          });
        if (!onSuccess) continue;
        response = await onSuccess(response);
      } catch (error) {
        (error as any).config = initialConfig;
        (error as any).response = response;
        if (onFailure) {
          response = await onFailure(error as ResponseError);
        } else Promise.reject(error);
      }
    }

    return response;
  }

  private async runRequestInterceptors(initialConfig: _RequestConfig) {
    let config = initialConfig;

    if (!this.interceptorHandlers.request?.length) return config;

    for (const { onSuccess, onFailure } of this.interceptorHandlers.request) {
      try {
        if (!onSuccess) continue;
        config = await onSuccess(config);
      } catch (error) {
        (error as any).config = initialConfig;
        if (onFailure) {
          await onFailure(error as ResponseError);
        } else Promise.reject(error);
      }
    }

    return config;
  }

  private async parse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    if (!contentType) return (await response.text()) as T;

    const parseMethods = [
      { match: /json/, parse: () => response.json() },
      { match: /text/, parse: () => response.text() },
      { match: /(octet-stream|zip|pdf|image)/, parse: () => response.blob() }
    ];

    const parser = parseMethods.find((entry) => contentType.match(entry.match));

    if (!parser) return (await response.text()) as T;

    return (await parser.parse()) as T;
  }

  private async request<T, R = FetchesResponse<T>>(
    endpoint: string,
    method: RequestMethod,
    options: RequestOptions = {}
  ) {
    let url = `${this.baseURL}${endpoint}`;

    if (options.params) {
      url += this.createSearchParams(options.params);
    }

    const defaultConfig: _RequestConfig = {
      ...options,
      url,
      method,
      headers: {
        ...this.headers,
        ...(options?.body &&
          !(options.body instanceof FormData) && {
            'content-type': 'application/json'
          }),
        ...(!!options?.headers && options.headers)
      }
    };

    const config = await this.runRequestInterceptors(defaultConfig);

    const response: Response = await fetch(config.url, config);

    if (this.interceptorHandlers.response?.length) {
      return this.runResponseInterceptors<T>(response, config) as R;
    }

    if (response.status >= 400) {
      const error = {} as ResponseError;
      const body = await this.parse<T>(response);
      error.config = config;
      error.response = {
        config,
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: body
      };
      throw new Error(response.statusText, { cause: { config, response } });
    }

    const body = await this.parse<T>(response);
    return {
      config,
      data: body,
      url: response.url,
      headers: response.headers,
      status: response.status,
      statusText: response.statusText
    } as R;
  }

  get<T, R = FetchesResponse<T>>(endpoint: string, options: Omit<RequestOptions, 'body'> = {}) {
    return this.request<T, R>(endpoint, 'GET', options);
  }

  delete<T, R = FetchesResponse<T>>(endpoint: string, options: Omit<RequestOptions, 'body'> = {}) {
    return this.request<T, R>(endpoint, 'DELETE', options);
  }

  post<T, R = FetchesResponse<T>>(
    endpoint: string,
    body?: RequestBody,
    options: RequestOptions = {}
  ) {
    return this.request<T, R>(endpoint, 'POST', {
      ...options,
      ...(!!body && { body: body instanceof FormData ? body : JSON.stringify(body) })
    });
  }

  put<T, R = FetchesResponse<T>>(
    endpoint: string,
    body?: RequestBody,
    options: RequestOptions = {}
  ) {
    return this.request<T, R>(endpoint, 'PUT', {
      ...options,
      ...(!!body && { body: body instanceof FormData ? body : JSON.stringify(body) })
    });
  }

  patch<T, R = FetchesResponse<T>>(
    endpoint: string,
    body?: RequestBody,
    options: RequestOptions = {}
  ) {
    return this.request<T, R>(endpoint, 'PATCH', {
      ...options,
      ...(!!body && { body: body instanceof FormData ? body : JSON.stringify(body) })
    });
  }

  call<T, R = FetchesResponse<T>>(options: _RequestConfig) {
    return this.request<T, R>(options.url, options.method, options);
  }
}

interface Instance extends Fetches {
  Fetches: typeof Fetches;
  create: (params: FetchesParams) => Fetches;
}

const fetches = new Fetches() as Instance;
fetches.Fetches = Fetches;
fetches.create = (params?: FetchesParams) => new Fetches(params);

export default fetches;
