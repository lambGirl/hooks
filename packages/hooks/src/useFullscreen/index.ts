/* eslint no-empty: 0 */

import { MutableRefObject, useLayoutEffect, useRef } from 'react';
import screenfull from 'screenfull';
import useBoolean from '../useBoolean';

export interface Options<T> {
  // 可选项，如果未传入则会监听返回结果中的 ref，否则会监听传入的节点
  dom?: T | (() => T) | null;
  // 监听退出全屏
  onExitFull?: () => void;
  // 监听全屏
  onFull?: () => void;
}

export interface Result<T> {
  // 是否全屏
  isFullscreen: boolean;
  // 设置全屏
  setFull: () => void;
  // 退出全屏
  exitFull: () => void;
  // 切换全屏
  toggleFull: () => void;
  
  //当未传入 dom 参数时，将 ref 绑定给需全屏的节点
  ref?: MutableRefObject<T>;
}

export default <T extends HTMLElement = HTMLElement>(options?: Options<T>): Result<T> => {
  const { dom, onExitFull, onFull } = options || {};

  const onExitFullRef = useRef(onExitFull);
  onExitFullRef.current = onExitFull;

  const onFullRef = useRef(onFull);
  onFullRef.current = onFull;

  const element = useRef<T>();

  const { state, toggle, setTrue, setFalse } = useBoolean(false);

  useLayoutEffect(() => {
    /* 非全屏时，不需要监听任何全屏事件 */
    if (!state) {
      return;
    }

    const passedInElement = typeof dom === 'function' ? dom() : dom;
    const targetElement = passedInElement || element.current;
    if (!targetElement) {
      return;
    }

    /* 监听退出 */
    const onChange = () => {
      if (screenfull.isEnabled) {
        const { isFullscreen } = screenfull;
        toggle(isFullscreen);
      }
    };

    if (screenfull.isEnabled) {
      try {
        screenfull.request(targetElement);
        setTrue();
        if (onFullRef.current) {
          onFullRef.current();
        }
      } catch (error) {
        setFalse();
        if (onExitFullRef.current) {
          onExitFullRef.current();
        }
      }
      screenfull.on('change', onChange);
    }

    /* state 从 true 变为 false，则关闭全屏 */
    return () => {
      if (screenfull.isEnabled) {
        try {
          screenfull.off('change', onChange);
          screenfull.exit();
        } catch (error) {}
      }
      if (onExitFullRef.current) {
        onExitFullRef.current();
      }
    };
  }, [state, typeof dom === 'function' ? undefined : dom]);

  const toggleFull = () => toggle();

  const result: Result<T> = {
    isFullscreen: !!state,
    setFull: setTrue,
    exitFull: setFalse,
    toggleFull,
  };

  if (!dom) {
    result.ref = element as MutableRefObject<T>;
  }

  return result;
};
