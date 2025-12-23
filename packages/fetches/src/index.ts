export type BaseUrl = string;

export type ResponseParseFunction = (data: unknown) => Promise<unknown>;
export type ResponseParseMode = 'arrayBuffer' | 'blob' | 'formData' | 'json' | 'raw' | 'text';
export type ResponseParse = ResponseParseFunction | ResponseParseMode;

export type RequestMethod = 'DELETE' | 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT';
export type RequestBody = BodyInit | Record<string, any> | null | undefined;
export interface RequestSearchParams {
  [key: string]: boolean | number | string | number[] | string[] | null | undefined;
}
export interface RequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  baseURL?: BaseUrl;
  body?: RequestBody;
  context?: Record<string, any>;
  headers?: Record<string, string>;
  onRequestFailure?: FailureRequestFunction;
  onRequestSuccess?: SuccessRequestFunction;
  onResponseFailure?: FailureResponseFunction;
  onResponseSuccess?: SuccessResponseFunction;
  parse?: ResponseParse;
  query?: RequestSearchParams;
}

export type RequestConfig = RequestInit & {
  url: string;
  _retry?: boolean;
  method: RequestMethod;
  headers?: Record<string, string>;
  query?: RequestSearchParams;
  parse?: ResponseParse;
};

export interface FetchesParams {
  baseURL: BaseUrl;
  headers?: Record<string, string>;
  parse?: ResponseParse;
}

export interface FetchesResponse<Data> {
  config: RequestConfig;
  data: Data;
  headers: Headers;
  options: RequestOptions;
  status: number;
  statusText: string;
  url: string;
}

export type SuccessResponseFunction = <Data = any>(
  response: FetchesResponse<Data>
) => FetchesResponse<Data> | Promise<FetchesResponse<Data>>;
export type SuccessRequestFunction = (
  config: RequestConfig
) => Promise<RequestConfig> | RequestConfig;

export class ResponseError extends Error {
  response: FetchesResponse<any>;
  request: RequestConfig;

  constructor(
    message: string,
    options: { request: RequestConfig; response: FetchesResponse<any> }
  ) {
    super(message, { cause: options });
    this.response = options.response;
    this.request = options.request;
  }
}

export type FailureResponseFunction = (error: ResponseError) => any;
export type FailureRequestFunction = (error: ResponseError) => any;

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

export type FetchesRequestConfig<Params = undefined> = Params extends undefined
  ? { params?: undefined; config?: RequestOptions }
  : { params: Params; config?: RequestOptions };

export type ApiFetchesRequest<Params, Response = any> = (
  Params extends { [K in keyof Params]: undefined extends Params[K] ? never : any }[keyof Params]
    ? true
    : false
) extends true
  ? (requestConfig: FetchesRequestConfig<Params>) => Promise<Response>
  : (requestConfig?: FetchesRequestConfig<Params>) => Promise<Response>;

class Fetches {
  readonly baseURL: BaseUrl;

  public headers: Record<string, string>;
  public parse?: ResponseParse;

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
    const { baseURL = '', headers = {}, parse } = params ?? {};
    this.baseURL = baseURL ?? '';
    this.headers = headers;
    this.parse = parse;
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

  setParse(parse: ResponseParse) {
    this.parse = parse;
  }

  private prepareBody(body?: RequestBody) {
    if (body instanceof FormData || body instanceof Blob || typeof body === 'string') return body;
    return JSON.stringify(body);
  }

  private async parseResponse<Data>(
    response: Response,
    parse?: ResponseParse
  ): Promise<Data | undefined> {
    if (!response.body) return undefined;

    if (typeof parse === 'function') {
      return (await parse(response.body)) as Data;
    }

    const parseMethods = {
      raw: {
        parse: () => response.body,
        match: 'raw'
      },
      text: {
        parse: () => response.text(),
        match: /text/
      },
      json: {
        parse: () => response.json(),
        match: /json/
      },
      blob: {
        parse: () => response.blob(),
        match: /(octet-stream|zip|pdf|image)/
      },
      formData: {
        parse: () => response.formData(),
        match: /form-data/
      },
      arrayBuffer: {
        parse: () => response.arrayBuffer(),
        match: /array-buffer/
      }
    };

    if (parse) {
      const parser = parseMethods[parse];
      return (await parser.parse()) as Data;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType) return (await response.text()) as Data;

    const parser = Object.values(parseMethods).find((entry) => contentType.match(entry.match));

    if (!parser) return response.body as Data;

    return (await parser.parse()) as Data;
  }

  private createSearchParams(query: RequestSearchParams) {
    const searchParams = new URLSearchParams();

    for (const key in query) {
      if (key in query) {
        const value = query[key];

        if (value === undefined || value === null) continue;

        if (Array.isArray(value)) {
          value.forEach((currentValue) => searchParams.append(key, currentValue.toString()));
        } else {
          searchParams.set(key, value.toString());
        }
      }
    }

    return `?${searchParams.toString()}`;
  }

  private async runResponseInterceptors<Data>(
    initialResponse: Response,
    initialConfig: RequestConfig,
    requestOptions: RequestOptions
  ) {
    const data = await this.parseResponse<Data>(initialResponse);
    let response = {
      data,
      url: initialResponse.url,
      headers: initialResponse.headers,
      status: initialResponse.status,
      statusText: initialResponse.statusText,
      config: initialConfig
    } as FetchesResponse<Data>;

    if (!this.interceptorHandlers.response?.length) return response;

    for (const { onSuccess, onFailure } of [
      { onSuccess: requestOptions.onResponseSuccess, onFailure: requestOptions.onResponseFailure },
      ...this.interceptorHandlers.response
    ]) {
      try {
        if (!initialResponse.ok)
          throw new ResponseError(initialResponse.statusText, {
            request: initialConfig,
            response
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

  private async runRequestInterceptors(
    initialConfig: RequestConfig,
    requestOptions: RequestOptions
  ) {
    let config = initialConfig;

    if (!this.interceptorHandlers.request?.length) return config;

    for (const { onSuccess, onFailure } of [
      { onSuccess: requestOptions.onRequestSuccess, onFailure: requestOptions.onRequestFailure },
      ...this.interceptorHandlers.request
    ]) {
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

  private async request<Data, R = FetchesResponse<Data>>(
    endpoint: string,
    method: RequestMethod,
    options: RequestOptions = {}
  ) {
    const { body, query, parse, baseURL, ...rest } = options;
    let url = `${baseURL ?? this.baseURL}${endpoint}`;

    if (query && Object.keys(query).length) {
      url += this.createSearchParams(query);
    }

    const defaultConfig: RequestConfig = {
      ...rest,
      ...(body && { body: this.prepareBody(body) }),
      url,
      method,
      parse,
      headers: {
        ...this.headers,
        ...(body &&
          !(body instanceof FormData || body instanceof Blob || typeof body === 'string') && {
            'content-type': 'application/json'
          }),
        ...(!!options?.headers && options.headers)
      }
    };

    const config = await this.runRequestInterceptors(defaultConfig, options);

    const response: Response = await fetch(config.url, config);

    if (this.interceptorHandlers.response?.length) {
      return this.runResponseInterceptors<Data>(response, config, options) as R;
    }

    const data = await this.parseResponse<Data>(response, config.parse);

    if (response.status >= 400) {
      const errorResponse = {
        data,
        url: response.url,
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
        config,
        options
      } as FetchesResponse<Data>;

      throw new ResponseError(response.statusText, { request: config, response: errorResponse });
    }

    return {
      config,
      options,
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
    return this.request<Data, Response>(endpoint, 'PUT', options);
  }

  patch<Data, Response = FetchesResponse<Data>>(
    endpoint: string,
    body?: RequestBody,
    options: RequestOptions = {}
  ) {
    options.body = body;
    return this.request<Data, Response>(endpoint, 'PATCH', options);
  }

  call<Data, Response = FetchesResponse<Data>>(
    method: RequestMethod,
    url: string,
    options: RequestOptions
  ) {
    return this.request<Data, Response>(url, method, options);
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
