import type { AxiosResponse } from 'axios';

import axios from 'axios';

export type ApicraftApiResponse<Data = never, Error = never> = AxiosResponse<Data | Error>;

export const instance = axios.create();
