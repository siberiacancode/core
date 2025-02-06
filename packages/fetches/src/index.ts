export type BaseUrl = string;
export type RequestMethod = RequestInit['method'];
export interface FetchesSearchParams {
  [key: string]: boolean | number | string | string[] | null | undefined;
}
export type RequestBody = BodyInit | Record<string, any> | null | undefined;

type RequestConfig = RequestInit & {
  url: string;
  _retry?: boolean;
  headers?: Record<string, string>;
  params?: FetchesSearchParams;
};

export type SuccessResponseFunction = <T = any>(
  response: FetchesResponse<T>
) => FetchesResponse<T> | Promise<FetchesResponse<T>>;
export type SuccessRequestFunction = (
  config: RequestConfig
) => Promise<RequestConfig> | RequestConfig;

export type ResponseError = Error & { config: RequestConfig; response: FetchesResponse<any> };
export type FailureResponseFunction = (e: ResponseError) => any;
export type FailureRequestFunction = (e: ResponseError) => any;

export interface RequestInterceptor {
  onFailure?: FailureRequestFunction;
  onSuccess?: SuccessRequestFunction;
}

export interface ResponseInterceptor {
  onFailure?: FailureResponseFunction;
  onSuccess?: SuccessResponseFunction;
}
export interface Interceptors {
  request?: RequestInterceptor[];
  response?: ResponseInterceptor[];
}
export interface RequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  body?: RequestBody;
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
  config: RequestConfig;
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
      use: (
        onSuccess?: SuccessRequestFunction,
        onFailure?: FailureRequestFunction
      ) => RequestInterceptor;
      eject: (interceptor: RequestInterceptor) => void;
    };
    response: {
      use: (
        onSuccess?: SuccessResponseFunction,
        onFailure?: FailureResponseFunction
      ) => ResponseInterceptor;
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

  private createBody(data?: RequestBody) {
    if (data instanceof FormData || data instanceof Blob) return data;
    return JSON.stringify(data);
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
    initialConfig: RequestConfig
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

  private async runRequestInterceptors(initialConfig: RequestConfig) {
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

  private async parse<Data>(response: Response): Promise<Data | undefined> {
    if (!response.body) return undefined;

    const contentType = response.headers.get('content-type');
    if (!contentType) return (await response.text()) as Data;

    const parseMethods = [
      { match: /json/, parse: () => response.json() },
      { match: /text/, parse: () => response.text() },
      { match: /(octet-stream|zip|pdf|image)/, parse: () => response.blob() }
    ];

    const parser = parseMethods.find((entry) => contentType.match(entry.match));

    if (!parser) return (await response.text()) as Data;

    return (await parser.parse()) as Data;
  }

  private async request<T, R = FetchesResponse<T>>(
    endpoint: string,
    method: RequestMethod,
    options: RequestOptions = {}
  ) {
    const { body, params, ...rest } = options;
    let url = `${this.baseURL}${endpoint}`;

    if (params && Object.keys(params).length) {
      url += this.createSearchParams(params);
    }

    const defaultConfig: RequestConfig = {
      ...rest,
      ...(body && { body: this.createBody(body) }),
      url,
      method,
      headers: {
        ...this.headers,
        ...(body &&
          !(body instanceof FormData || options.body instanceof Blob) && {
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

    const data = await this.parse<T>(response);

    if (response.status >= 400) {
      const error = {} as ResponseError;
      error.config = config;
      error.response = {
        config,
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data
      };
      throw new Error(response.statusText, { cause: { config, response } });
    }

    return {
      config,
      data,
      url: response.url,
      headers: response.headers,
      status: response.status,
      statusText: response.statusText
    } as R;
  }

  get<Data, Response = FetchesResponse<Data>>(
    endpoint: string,
    options: Omit<RequestOptions, 'body'> = {}
  ) {
    return this.request<Data, Response>(endpoint, 'GET', options);
  }

  head<Data, Response = FetchesResponse<Data>>(
    endpoint: string,
    options: Omit<RequestOptions, 'body'> = {}
  ) {
    return this.request<Data, Response>(endpoint, 'HEAD', options);
  }

  delete<Data, Response = FetchesResponse<Data>>(
    endpoint: string,
    options: Omit<RequestOptions, 'body'> = {}
  ) {
    return this.request<Data, Response>(endpoint, 'DELETE', options);
  }

  post<Data, Response = FetchesResponse<Data>>(
    endpoint: string,
    body?: RequestBody,
    options: RequestOptions = {}
  ) {
    options.body = body;
    return this.request<Data, Response>(endpoint, 'POST', options);
  }

  put<Data, Response = FetchesResponse<Data>>(
    endpoint: string,
    body?: RequestBody,
    options: RequestOptions = {}
  ) {
    options.body = body;
    return this.request<Data, Response>(endpoint, 'POST', options);
  }

  patch<Data, Response = FetchesResponse<Data>>(
    endpoint: string,
    body?: RequestBody,
    options: RequestOptions = {}
  ) {
    options.body = body;
    return this.request<Data, Response>(endpoint, 'POST', options);
  }

  call<Data, Response = FetchesResponse<Data>>(options: RequestConfig) {
    return this.request<Data, Response>(options.url, options.method, options);
  }
}

interface Instance extends Fetches {
  Fetches: typeof Fetches;
  create: (params?: FetchesParams) => Fetches;
}

const fetches = new Fetches() as Instance;
fetches.Fetches = Fetches;
fetches.create = (params?: FetchesParams) => new Fetches(params);

export default fetches;
