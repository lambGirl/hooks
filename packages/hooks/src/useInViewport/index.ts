import { useRef, useLayoutEffect, useState, MutableRefObject } from 'react';

// intersection-observer： https://www.jianshu.com/p/84a86e41eb2b
import 'intersection-observer';

/**
 * 一个用于判断dom元素是否在可视范围之内的 Hook
 */
// 定义入参类型
type Arg = HTMLElement | (() => HTMLElement) | null;
// 定义是否在可视觉区域
type InViewport = boolean | undefined;

/**
 * 判断el是否在数传内
 * @param el 
 */
function isInViewPort(el: HTMLElement): boolean {
  if (!el) {
    return false;
  }

  // 当前的可视区域的宽度
  const viewPortWidth =
    window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

  // 当前的可视区域的高度
  const viewPortHeight =
    window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

  // 用于获取某个元素相对于视窗的位置集合， top, bottom, left, right;
  const rect = el.getBoundingClientRect();

  // 兼容性处理，如果存在，则处理
  if (rect) {
    const { top, bottom, left, right } = rect;
    return bottom > 0 && top <= viewPortHeight && left <= viewPortWidth && right > 0;
  }

  // 不存在，则直接返回false
  return false;
}

function useInViewport<T extends HTMLElement = HTMLElement>(): [InViewport, MutableRefObject<T>];
function useInViewport<T extends HTMLElement = HTMLElement>(arg: Arg): [InViewport];
function useInViewport<T extends HTMLElement = HTMLElement>(
  ...args: [Arg] | []
): [InViewport, MutableRefObject<T>?] {
  const element = useRef<T>();
  const hasPassedInElement = args.length === 1;
  const arg = useRef(args[0]);
  [arg.current] = args;
  // 初始化dom，可视区域区域的初始值
  const [inViewPort, setInViewport] = useState<InViewport>(() => {
    const initDOM = typeof arg.current === 'function' ? arg.current() : arg.current;

    return isInViewPort(initDOM as HTMLElement);
  });

  /**
   * 与useEffect,执行一样，但是react官方建议，当需要修改dom的时候，则使用useLayoutEffect
   */
  useLayoutEffect(() => {
    const passedInElement = typeof arg.current === 'function' ? arg.current() : arg.current;

    const targetElement = hasPassedInElement ? passedInElement : element.current;

    if (!targetElement) {
      return () => {};
    }

    /**
     * 监听元素是否在视窗那。
     * entries返回的数据
     * boundingClientRect: 目标元素的矩形信息
     * intersectionRatio: 相交区域和目标元素的比例值 intersectionRect/boundingClientRect 不可见时小于等于0
     * intersectionRect: 目标元素和视窗（根）相交的矩形信息 可以称为相交区域
     * isIntersecting: 目标元素当前是否可见 Boolean值 可见为true
     * rootBounds: 根元素的矩形信息，没有指定根元素就是当前视窗的矩形信息
     * target: 观察的目标元素
     * time: 返回一个记录从IntersectionObserver的时间到交叉被触发的时间的时间戳
     */
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        // 目标对象dom进入可视区，设置对应返回的值
        if (entry.isIntersecting) {
          setInViewport(true);
        } else {
          setInViewport(false);
        }
      }
    });

    // 开始观察，接受一个DOM节点对象
    observer.observe(targetElement);
    // observer.unobserve(element)   停止观察 接受一个element元素
    // 关闭观察器
    return () => {
      observer.disconnect();
    };
  }, [element.current, typeof arg.current === 'function' ? undefined : arg.current]);

  // 如果存在目标对象，则返回状态
  if (hasPassedInElement) {
    return [inViewPort];
  }

  return [inViewPort, element as MutableRefObject<T>];
}

export default useInViewport;
