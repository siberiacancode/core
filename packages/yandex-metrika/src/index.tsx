import type { ComponentProps } from 'react';

import React from 'react';

export type YandexMetrikaCounterId = number;
export type YandexMetrikaEventName = 'reachGoal';
export type YandexMetrikaTarget = string;
export type YandexMetrikaParams = Record<string, unknown>;

export type Ym = (
  counterId: YandexMetrikaCounterId,
  eventName: YandexMetrikaEventName,
  target: YandexMetrikaTarget,
  params?: YandexMetrikaParams
) => void;

declare global {
  interface Window {
    ym?: Ym;
  }
}

export interface YandexMetrikaEvent {
  eventName: YandexMetrikaEventName;
  params?: YandexMetrikaParams;
  target: YandexMetrikaTarget;
}

export type YandexMetrika<Event extends YandexMetrikaEvent = YandexMetrikaEvent> = (
  event: Event
) => void;

type CreateYandexMetrika = <Event extends YandexMetrikaEvent>(
  counterId: YandexMetrikaCounterId
) => YandexMetrika<Event>;

export const createYandexMetrika: CreateYandexMetrika =
  (counterId) =>
  ({ eventName, target, params }) => {
    try {
      window.ym?.(counterId, eventName, target, params);
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
ym(${counterId}, 'init', {trackHash:true, clickmap:true, referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});`;

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
