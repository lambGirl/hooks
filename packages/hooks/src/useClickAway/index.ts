import { MutableRefObject, useRef, useEffect, useCallback, useMemo } from 'react';

// 鼠标点击事件，click 不会监听右键
const defaultEvent = 'click';

type RefType = HTMLElement | (() => HTMLElement | null) | null;

export default function useClickAway<T extends HTMLElement = HTMLDivElement>(
  // 	触发事件的函数
  onClickAway: (event: KeyboardEvent) => void,
  // 可选项，如果未传入则会监听返回结果中的 ref，否则会监听传入的节点
  dom?: RefType,
  // 监听的事件名称
  eventName: string = defaultEvent,
): MutableRefObject<T> {
  const element = useRef<T>();

  const handler = useCallback(
    event => {
      const targetElement = typeof dom === 'function' ? dom() : dom;
      const el = targetElement || element.current;
      if (!el || el.contains(event.target)) {
        return;
      }

      // 执行触发的事件
      onClickAway(event);
    },
    [element.current, onClickAway, dom],
  );

  useEffect(() => {
    document.addEventListener(eventName, handler);

    return () => {
      document.removeEventListener(eventName, handler);
    };
  }, [eventName, handler]);

  return element as MutableRefObject<T>;
}
