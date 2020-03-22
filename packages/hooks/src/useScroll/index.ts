import { MutableRefObject, useEffect, useRef, useState } from 'react';

interface Position {
  left: number;
  top: number;
}

type Target = HTMLElement | Document;

type Arg = Target | (() => Target) | null;

/**
 * 	可选项，如果未传入则会监听返回结果中的 ref，否则会监听传入的节点
 */
function useScroll<T extends Target = HTMLElement>(): [Position, MutableRefObject<T>];
function useScroll<T extends Target = HTMLElement>(arg: Arg): [Position];
function useScroll<T extends Target = HTMLElement>(...args: [Arg] | []) {
  // 定义当前的位置
  const [position, setPosition] = useState<Position>({
    left: NaN,
    top: NaN,
  });
  const ref = useRef<T>();

 // 当前的Element 
  const hasPassedInElement = args.length === 1;

  const arg = args[0];

  useEffect(() => {
    const passedInElement = typeof arg === 'function' ? arg() : arg;

    const element = hasPassedInElement ? passedInElement : ref.current;
    if (!element) return;
    function updatePosition(target: Target) {
      let newPosition;
      // 如果target === document
      if (target === document) {
        if (!document.scrollingElement) return;
        newPosition = {
          left: document.scrollingElement.scrollLeft,
          top: document.scrollingElement.scrollTop,
        };
      } else {
        newPosition = {
          left: (target as HTMLElement).scrollLeft,
          top: (target as HTMLElement).scrollTop,
        };
      }
      setPosition(newPosition);
    }
    // 设置对应的position
    updatePosition(element);
    //  监听
    function listener(event: Event) {
      if (!event.target) return;
      updatePosition(event.target as Target);
    }
    // 监听当前element的scroll事件
    element.addEventListener('scroll', listener);
    return () => {
      element.removeEventListener('scroll', listener);
    };
  }, [ref.current, typeof arg === 'function' ? undefined : arg]);
  return [position, ref];
}

export default useScroll;
