import type { ComponentProps } from 'react';

export type YandexMetrikaCounterId = number;
export type YandexMetrikaTarget = string;
export type YandexMetrikaParams = Record<string, unknown>;
export type YandexMetrikaCallback = () => void;

/**
 * Yandex Metrika JS API methods
 * (https://yandex.ru/support/metrica/ru/objects/method-reference),
 * plus two pseudo-methods that push into window.dataLayer instead of calling ym:
 *   - 'dataLayer'  raw push for a tag manager to pick up by trigger
 *   - 'ecommerce'  e-commerce push in Metrika's { ecommerce: {...} } format
 */
export type YandexMetrikaYmMethod =
  | 'addFileExtension'
  | 'extLink'
  | 'file'
  | 'firstPartyParams'
  | 'firstPartyParamsHashed'
  | 'getClientID'
  | 'hit'
  | 'notBounce'
  | 'params'
  | 'reachGoal'
  | 'setUserID'
  | 'userParams';

export type YandexMetrikaEventName = 'dataLayer' | 'ecommerce' | YandexMetrikaYmMethod;

export type Ym = (
  counterId: YandexMetrikaCounterId,
  method: YandexMetrikaYmMethod,
  ...args: unknown[]
) => void;

export type DataLayer = unknown[];

declare global {
  interface Window {
    dataLayer?: DataLayer;
    ym?: Ym;
  }
}

export type YandexMetrikaEcommerceAction = 'add' | 'detail' | 'purchase' | 'remove';
export interface YandexMetrikaEcommerceProduct {
  brand?: string;
  category?: string;
  coupon?: string;
  id?: string;
  list?: string;
  name?: string;
  position?: number;
  price?: number;
  quantity?: number;
  variant?: string;
  [key: string]: unknown;
}

export interface YandexMetrikaEcommercePayload {
  actionField?: { id?: string; revenue?: number; coupon?: string; [key: string]: unknown };
  currencyCode?: string;
  products: YandexMetrikaEcommerceProduct[];
}

export type YandexMetrikaEvent =
  | { eventName: 'addFileExtension'; target: YandexMetrikaTarget }
  | { eventName: 'dataLayer'; data: Record<string, unknown> }
  | {
      eventName: 'ecommerce';
      action: YandexMetrikaEcommerceAction;
      ecommerce: YandexMetrikaEcommercePayload;
    }
  | {
      eventName: 'extLink';
      target: YandexMetrikaTarget;
      params?: YandexMetrikaParams;
      callback?: YandexMetrikaCallback;
    }
  | {
      eventName: 'file';
      target: YandexMetrikaTarget;
      params?: YandexMetrikaParams;
      callback?: YandexMetrikaCallback;
    }
  | { eventName: 'firstPartyParams'; params: YandexMetrikaParams }
  | { eventName: 'firstPartyParamsHashed'; params: YandexMetrikaParams }
  | { eventName: 'getClientID'; callback: YandexMetrikaCallback }
  | {
      eventName: 'hit';
      target: YandexMetrikaTarget;
      params?: YandexMetrikaParams;
      callback?: YandexMetrikaCallback;
    }
  | { eventName: 'notBounce'; callback?: YandexMetrikaCallback }
  | { eventName: 'params'; params: YandexMetrikaParams }
  | {
      eventName: 'reachGoal';
      target: YandexMetrikaTarget;
      params?: YandexMetrikaParams;
      callback?: YandexMetrikaCallback;
    }
  | { eventName: 'setUserID'; target: YandexMetrikaTarget }
  | { eventName: 'userParams'; params: YandexMetrikaParams };

export type YandexMetrika<Event extends YandexMetrikaEvent = YandexMetrikaEvent> = (
  event: Event
) => void;

type CreateYandexMetrika = <Event extends YandexMetrikaEvent = YandexMetrikaEvent>(
  counterId: YandexMetrikaCounterId
) => YandexMetrika<Event>;

export const createYandexMetrika: CreateYandexMetrika = (counterId) => (event) => {
  try {
    switch (event.eventName) {
      case 'ecommerce':
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          ...(event.ecommerce.currencyCode ? { currencyCode: event.ecommerce.currencyCode } : {}),
          ecommerce: {
            ...(event.ecommerce.currencyCode ? { currencyCode: event.ecommerce.currencyCode } : {}),
            [event.action]: {
              ...(event.ecommerce.actionField ? { actionField: event.ecommerce.actionField } : {}),
              products: event.ecommerce.products
            }
          }
        });
        return;

      case 'dataLayer':
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(event.data);
        return;

      case 'getClientID':
        window.ym?.(counterId, 'getClientID', event.callback);
        return;

      case 'notBounce':
        window.ym?.(
          counterId,
          'notBounce',
          event.callback ? { callback: event.callback } : undefined
        );
        return;

      case 'params':
      case 'userParams':
      case 'firstPartyParams':
      case 'firstPartyParamsHashed':
        window.ym?.(counterId, event.eventName, event.params);
        return;

      case 'setUserID':
      case 'addFileExtension':
        window.ym?.(counterId, event.eventName, event.target);
        return;

      default:
        window.ym?.(counterId, event.eventName, event.target, event.params, event.callback);
    }
  } catch (error) {
    console.error('[YandexMetrika] Error:', error);
  }
};

export const getYandexMetrikaScript = (counterId: YandexMetrikaCounterId) =>
  `(function(m,e,t,r,i,k,a){
  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j = 0; j < document.scripts.length; j++) {
    if (document.scripts[j].src === r) { return; }
  }
  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js', 'ym');
ym(${counterId}, 'init', {trackHash:true, clickmap:true, ecommerce:'dataLayer', referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});`;

export interface YandexMetrikaNoScriptProps extends ComponentProps<'img'> {
  counterId: YandexMetrikaCounterId;
}

export const YandexMetrikaNoScript = ({ counterId, ...props }: YandexMetrikaNoScriptProps) => (
  <noscript>
    <div>
      <img
        style={{
          position: 'absolute',
          left: '-9999px'
        }}
        alt=''
        src={`https://mc.yandex.ru/watch/${counterId}`}
        {...props}
      />
    </div>
  </noscript>
);
