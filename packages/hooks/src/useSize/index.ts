import { useState, useRef, MutableRefObject, useLayoutEffect } from 'react';
/**
 * 用于Resize Observer API的polyfill。
 * https://github.com/que-etc/resize-observer-polyfill
 */
import ResizeObserver from 'resize-observer-polyfill';

// 定一个对象 HTMLElement对象
type Arg = HTMLElement | (() => HTMLElement) | null;

// 定义size的type类型
type Size = { width?: number; height?: number };

function useSize<T extends HTMLElement = HTMLElement>(): [Size, MutableRefObject<T>];
function useSize<T extends HTMLElement = HTMLElement>(arg: Arg): [Size];
function useSize<T extends HTMLElement = HTMLElement>(
  ...args: [Arg] | []
): [Size, MutableRefObject<T>?] {
  const hasPassedInElement = args.length === 1;
  const arg = useRef(args[0]);
  [arg.current] = args;
  // 创建一个dom对象 element
  const element = useRef<T>();
  // 初始化dom的当前内容的高度及宽度； clientWidth =  dom.width + dom.padding(left,right的和)； 不包含border及垂直滚动条的宽度；clientHeight同理
  const [state, setState] = useState<Size>(() => {
    const initDOM = typeof arg.current === 'function' ? arg.current() : arg.current;
    return {
      width: (initDOM || {}).clientWidth,
      height: (initDOM || {}).clientHeight,
    };
  });

  /**
   * 当在effect中需要操作dom的时候，则需要使用useLayoutEffect; 否则会出现闪屏；
   *  useLayoutEffect里面的callback函数会在DOM更新完成后立即执行,
   *  但是会在浏览器进行任何绘制之前运行完成,阻塞了浏览器的绘制.
   */
  useLayoutEffect(() => {
    // 当前经过的dom对象
    const passedInElement = typeof arg.current === 'function' ? arg.current() : arg.current;

    // 目标dom对象
    const targetElement = hasPassedInElement ? passedInElement : element.current;

    if (!targetElement) {
      return () => {};
    }

    const resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        setState({
          width: entry.target.clientWidth,
          height: entry.target.clientHeight,
        });
      });
    });

    // 为滚动的盒子注册
    resizeObserver.observe(targetElement);
    return () => {
      resizeObserver.disconnect();
    };
  }, [element.current, typeof arg.current === 'function' ? undefined : arg.current]);

  if (hasPassedInElement) {
    return [state];
  }
  return [state, element as MutableRefObject<T>];
}

export default useSize;
