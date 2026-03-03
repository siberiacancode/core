import { beforeEach, describe, expect, it, vi } from 'vitest';

import fetches, { DEFAULT_VALIDATE_STATUS, ResponseError } from './index';

const Fetches = fetches.Fetches;

function createMockResponse(
  data: unknown = {},
  init: { status?: number; statusText?: string; headers?: Record<string, string> } = {}
) {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  return new Response(body, {
    status: init.status ?? 200,
    statusText: init.statusText ?? 'OK',
    headers: new Headers(init.headers ?? {})
  });
}

const mockedFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockedFetch);
});

describe('Exports and instance', () => {
  it('Should export fetches', () => {
    expect(fetches).toBeDefined();
    expect(typeof fetches.get).toBe('function');
    expect(Fetches).toBeDefined();
  });

  it('Should create instance with default options', async () => {
    const api = fetches.create();
    mockedFetch.mockResolvedValueOnce(createMockResponse({ ok: true }));

    expect(api.baseURL).toBe('');
    expect(api.headers).toEqual({});
    expect(api.parse).toBeUndefined();
    expect(api.validateStatus).toBe(DEFAULT_VALIDATE_STATUS);

    await api.get('/');
    expect(mockedFetch).toHaveBeenCalledWith('/', expect.any(Object));
  });

  it('Should create instance with custom options', async () => {
    const customValidate = vi.fn(() => true);
    const api = fetches.create({
      baseURL: '/api',
      headers: { 'x-custom': 'a' },
      parse: 'json',
      validateStatus: customValidate
    });
    mockedFetch.mockResolvedValueOnce(createMockResponse({ id: 1 }));

    expect(api.baseURL).toBe('/api');
    expect(api.headers).toEqual({ 'x-custom': 'a' });
    expect(api.parse).toBe('json');
    expect(api.validateStatus).toBe(customValidate);

    await api.get('/users');
    expect(mockedFetch).toHaveBeenCalledWith(
      '/api/users',
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-custom': 'a' })
      })
    );
    expect(customValidate).toHaveBeenCalledWith(200);
  });
});

describe('baseURL and request URL', () => {
  it('Should combine instance baseURL and path', async () => {
    const api = fetches.create({ baseURL: '/api' });
    mockedFetch.mockResolvedValueOnce(createMockResponse());
    await api.get('/users');
    expect(mockedFetch).toHaveBeenCalledWith('/api/users', expect.any(Object));
  });

  it('Should override instance baseURL with request option baseURL', async () => {
    const api = fetches.create({ baseURL: '/api' });
    mockedFetch.mockResolvedValueOnce(createMockResponse());
    await api.get('/users', { baseURL: '/new-api' });
    expect(mockedFetch).toHaveBeenCalledWith('/new-api/users', expect.any(Object));
  });

  it('Should append query params to URL', async () => {
    const api = fetches.create();
    mockedFetch.mockResolvedValueOnce(createMockResponse());
    await api.get('/search', { query: { a: '1', b: 2, c: undefined, d: null } });
    const [[url]] = mockedFetch.mock.calls;

    expect(url).toContain('a=1');
    expect(url).toContain('b=2');
    expect(url).not.toContain('c=');
    expect(url).not.toContain('d=');
    expect(url).toMatch(/\?.*/);
  });

  it('Should append query array values (multiple same key)', async () => {
    const api = fetches.create();
    mockedFetch.mockResolvedValueOnce(createMockResponse());
    await api.get('/', { query: { ids: [1, 2] } });
    const [[url]] = mockedFetch.mock.calls;
    expect(url).toContain('ids=1');
    expect(url).toContain('ids=2');
  });

  it('Should omit query null/undefined from URL', async () => {
    const api = fetches.create();
    mockedFetch.mockResolvedValueOnce(createMockResponse());
    await api.get('/', { query: { a: '1', b: null, c: undefined } });
    const [[url]] = mockedFetch.mock.calls;
    expect(url).toContain('a=1');
    expect(url).not.toContain('b=');
    expect(url).not.toContain('c=');
  });
});

describe('Methods and body', () => {
  it('Should call fetch with method GET', async () => {
    mockedFetch.mockResolvedValueOnce(createMockResponse());
    await fetches.get('/');
    expect(mockedFetch).toHaveBeenCalledWith('/', expect.objectContaining({ method: 'GET' }));
  });

  it('Should call fetch with method HEAD', async () => {
    mockedFetch.mockResolvedValueOnce(createMockResponse());
    await fetches.head('/');
    expect(mockedFetch).toHaveBeenCalledWith('/', expect.objectContaining({ method: 'HEAD' }));
  });

  it('Should call fetch with method DELETE', async () => {
    mockedFetch.mockResolvedValueOnce(createMockResponse());
    await fetches.delete('/');
    expect(mockedFetch).toHaveBeenCalledWith('/', expect.objectContaining({ method: 'DELETE' }));
  });

  it('Should call fetch with method POST', async () => {
    mockedFetch.mockResolvedValueOnce(createMockResponse());
    await fetches.post('/', { foo: 1 });
    expect(mockedFetch).toHaveBeenCalledWith(
      '/',
      expect.objectContaining({
        method: 'POST',
        body: '{"foo":1}',
        headers: expect.objectContaining({ 'content-type': 'application/json' })
      })
    );
  });

  it('Should call fetch with method PUT', async () => {
    mockedFetch.mockResolvedValueOnce(createMockResponse());
    await fetches.put('/', { bar: 2 });
    expect(mockedFetch).toHaveBeenCalledWith(
      '/',
      expect.objectContaining({
        method: 'PUT',
        body: '{"bar":2}',
        headers: expect.objectContaining({ 'content-type': 'application/json' })
      })
    );
  });

  it('Should call fetch with method PATCH', async () => {
    mockedFetch.mockResolvedValueOnce(createMockResponse());
    await fetches.patch('/', { baz: 3 });
    expect(mockedFetch).toHaveBeenCalledWith(
      '/',
      expect.objectContaining({
        method: 'PATCH',
        body: '{"baz":3}'
      })
    );
  });

  it('Should pass FormData body', async () => {
    const formData = new FormData();
    formData.set('foo', 'bar');
    mockedFetch.mockResolvedValueOnce(createMockResponse());

    await fetches.post('/', formData);
    const [[url, config]] = mockedFetch.mock.calls;

    expect(url).toBe('/');
    expect(config.body).toBeInstanceOf(FormData);
    expect(config.headers['content-type']).toBeUndefined();
  });

  it('Should pass string body through', async () => {
    mockedFetch.mockResolvedValueOnce(createMockResponse());
    await fetches.post('/', 'plain');
    const [[url, config]] = mockedFetch.mock.calls;

    expect(url).toBe('/');
    expect(config.body).toBe('plain');
    expect(config.headers['content-type']).toBeUndefined();
  });

  it('Should call fetch', async () => {
    mockedFetch.mockResolvedValueOnce(createMockResponse());
    await fetches.call('GET', '/custom');
    expect(mockedFetch).toHaveBeenCalledWith('/custom', expect.objectContaining({ method: 'GET' }));
  });
});

describe('Headers', () => {
  it('Should send instance headers on every request', async () => {
    const api = fetches.create({ headers: { 'x-custom': 'a' } });
    mockedFetch.mockResolvedValueOnce(createMockResponse());
    await api.get('/');

    expect(mockedFetch).toHaveBeenCalledWith(
      '/',
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-custom': 'a' })
      })
    );
  });

  it('Should merge request headers with instance headers (request overrides)', async () => {
    const api = fetches.create({ headers: { 'x-custom': 'instance' } });
    mockedFetch.mockResolvedValueOnce(createMockResponse());

    await api.get('/', { headers: { 'x-custom': 'request' } });
    expect(mockedFetch).toHaveBeenCalledWith(
      '/',
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-custom': 'request' })
      })
    );
  });

  it('Should merge setHeaders into instance headers', async () => {
    const api = fetches.create({ headers: { 'x-custom': '1' } });
    api.setHeaders({ 'x-key': '2' });

    mockedFetch.mockResolvedValueOnce(createMockResponse());
    await api.get('/');
    expect(mockedFetch).toHaveBeenCalledWith(
      '/',
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-custom': '1', 'x-key': '2' })
      })
    );
  });
});

describe('Parse', () => {
  it('Should use instance parse when request parse is not set', async () => {
    const api = fetches.create({ baseURL: '', parse: 'json' });
    const data = { x: 1 };
    mockedFetch.mockResolvedValueOnce(createMockResponse(data));
    const response = await api.get('/');
    expect(response.data).toEqual(data);
  });

  it('Should parse response via response.json() when parse is "json"', async () => {
    const data = { id: 1, name: 'test' };
    mockedFetch.mockResolvedValueOnce(createMockResponse(data));
    const response = await fetches.get('/', { parse: 'json' });
    expect(response.data).toEqual(data);
  });

  it('Should use response.text() when parse is "text"', async () => {
    const text = 'hello';
    mockedFetch.mockResolvedValueOnce(createMockResponse(text));
    const response = await fetches.get('/', { parse: 'text' });
    expect(response.data).toBe(text);
  });

  it('Should return response.body when parse is "raw"', async () => {
    const mockRes = createMockResponse('ignored');
    mockedFetch.mockResolvedValueOnce(mockRes);
    const response = await fetches.get('/', { parse: 'raw' });
    expect(response.data).toBe(mockRes.body);
  });

  it('Should call custom parse function and put result in response.data', async () => {
    const customParse = vi.fn().mockResolvedValue({ parsed: true });
    mockedFetch.mockResolvedValueOnce(createMockResponse('body'));
    const response = await fetches.get('/', { parse: customParse });
    expect(customParse).toHaveBeenCalled();
    expect(response.data).toEqual({ parsed: true });
  });

  it('Should trigger json parse by Content-Type application/json when parse not set', async () => {
    mockedFetch.mockResolvedValueOnce(
      createMockResponse({ a: 1 }, { headers: { 'content-type': 'application/json' } })
    );
    const response = await fetches.get('/');
    expect(response.data).toEqual({ a: 1 });
  });
});

describe('validateStatus', () => {
  it('Should treat 2xx as success and throw on 4xx/5xx without interceptors', async () => {
    mockedFetch.mockResolvedValueOnce(
      createMockResponse({}, { status: 404, statusText: 'Not Found' })
    );
    await expect(fetches.get('/')).rejects.toThrow(ResponseError);
  });

  it('Should change behavior for next requests when using setValidateStatus', async () => {
    const api = fetches.create();
    api.setValidateStatus((status) => status >= 200 && status < 400);

    mockedFetch.mockResolvedValueOnce(createMockResponse({}, { status: 301, statusText: 'Moved' }));

    const response = await api.get('/');
    expect(response.status).toBe(301);
  });
});

describe('ResponseError', () => {
  it('Should throw ResponseError with response and request on invalid status without interceptors', async () => {
    mockedFetch.mockResolvedValueOnce(
      createMockResponse(
        { error: 'bad' },
        { status: 500, statusText: 'Server Error', headers: { 'content-type': 'application/json' } }
      )
    );
    try {
      await fetches.get('/');
    } catch (err: any) {
      const error = err as ResponseError;
      expect(error).toBeInstanceOf(ResponseError);
      expect(error.response).toBeDefined();
      expect(error.response.status).toBe(500);
      expect(error.response.data).toEqual({ error: 'bad' });
      expect(error.request).toBeDefined();
      expect(error.request.url).toBe('/');
      expect(error.request.method).toBe('GET');
      expect(error.message).toBe('Server Error');
    }
  });
});

describe('Request interceptors', () => {
  it('Should use returned config for fetch when onSuccess receives config', async () => {
    const api = fetches.create();

    api.interceptors.request.use((config) => {
      config.headers!.authorization = 'Bearer token';
      return config;
    });

    mockedFetch.mockResolvedValueOnce(createMockResponse());

    await api.get('/users');

    expect(mockedFetch).toHaveBeenCalledWith(
      '/users',
      expect.objectContaining({
        headers: expect.objectContaining({ authorization: 'Bearer token' })
      })
    );
  });

  it('Should trigger failure callback', async () => {
    const api = fetches.create();
    const onFailure = vi.fn();

    api.interceptors.request.use(() => {
      throw new Error('req err');
    }, onFailure);

    mockedFetch.mockResolvedValueOnce(createMockResponse());
    await api.get('/');

    expect(onFailure).toHaveBeenCalled();
  });

  it('Should remove interceptor when using eject', async () => {
    const api = fetches.create();

    const addHeader = vi.fn((config) => {
      config.headers = { ...config.headers, 'x-injected': 'yes' };
      return config;
    });

    const interceptor = api.interceptors.request.use(addHeader);
    mockedFetch.mockResolvedValueOnce(createMockResponse());

    await api.get('/');

    expect(addHeader).toHaveBeenCalledTimes(1);
    expect(mockedFetch).toHaveBeenLastCalledWith(
      '/',
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-injected': 'yes' })
      })
    );
    api.interceptors.request.eject(interceptor);
    mockedFetch.mockResolvedValueOnce(createMockResponse());

    await api.get('/');

    expect(addHeader).toHaveBeenCalledTimes(1);
    expect(mockedFetch).toHaveBeenLastCalledWith(
      '/',
      expect.not.objectContaining({
        headers: expect.objectContaining({ 'x-injected': 'yes' })
      })
    );
  });
});

describe('Response interceptors', () => {
  it('Should use success return value as request result', async () => {
    const api = fetches.create();

    api.interceptors.response.use(
      (response) => ({ ...response, data: { wrapped: response.data } }) as typeof response
    );

    mockedFetch.mockResolvedValueOnce(
      createMockResponse({ id: 1 }, { headers: { 'content-type': 'application/json' } })
    );

    const response = await api.get('/');

    expect(response.data).toEqual({ wrapped: { id: 1 } });
  });

  it('Should return data from failure callback', async () => {
    const api = fetches.create();

    api.interceptors.response.use(undefined, (error) => {
      return { ...error.response, data: { recovered: true } } as typeof error.response;
    });

    mockedFetch.mockResolvedValueOnce(
      createMockResponse({ err: 'x' }, { status: 500, statusText: 'Error' })
    );

    const response = await api.get('/');

    expect(response.data).toEqual({ recovered: true });
    expect(response.status).toBe(500);
  });

  it('Should trigger failure callback', async () => {
    const api = fetches.create();
    const onFailure = vi.fn();

    api.interceptors.response.use(() => {
      throw new Error('res err');
    }, onFailure);

    mockedFetch.mockResolvedValueOnce(createMockResponse());
    await api.get('/');

    expect(onFailure).toHaveBeenCalled();
  });

  it('Should remove response interceptor when using eject', async () => {
    const api = fetches.create();

    const transform = vi.fn((response) => ({ ...response, data: 'transformed' }));
    const interceptor = api.interceptors.response.use(transform);

    mockedFetch.mockResolvedValueOnce(
      createMockResponse({ original: true }, { headers: { 'content-type': 'application/json' } })
    );

    await api.get('/');

    expect(transform).toHaveBeenCalledTimes(1);

    api.interceptors.response.eject(interceptor);
    mockedFetch.mockResolvedValueOnce(
      createMockResponse({ original: true }, { headers: { 'content-type': 'application/json' } })
    );

    const response = await api.get('/');

    expect(transform).toHaveBeenCalledTimes(1);
    expect(response.data).toEqual({ original: true });
  });
});

describe('Context', () => {
  it('Should match response.options.context with request context', async () => {
    mockedFetch.mockResolvedValueOnce(createMockResponse());
    const response = await fetches.get('/', { context: { some: 'data' } });
    expect(response.options.context).toEqual({ some: 'data' });
  });
});

describe('Signal', () => {
  it('Should pass options.signal to fetch', async () => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    mockedFetch.mockResolvedValueOnce(createMockResponse());

    await fetches.get('/', { signal: abortController.signal });
    expect(mockedFetch).toHaveBeenCalledWith('/', expect.objectContaining({ signal }));
  });
});
