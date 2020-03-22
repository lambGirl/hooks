/**
 * 一个用于追踪 dom 元素是否有鼠标悬停的 Hook
 */
import { MutableRefObject, useEffect, useRef } from 'react';
import useBoolean from '../useBoolean';

export interface Options<T> {
  // 可选项，如果未传入则会监听返回结果中的 ref，否则会监听传入的节点
  dom?: T | (() => T) | null;

  // 监听进入 hover
  onEnter?: () => void;

  // 监听离开 hover
  onLeave?: () => void;
}

export default <T extends HTMLElement = HTMLElement>(
  options?: Options<T>,
): [boolean | undefined, MutableRefObject<T>?] => {

  const { dom, onEnter, onLeave } = options || {};

  // 定义dom，通过ref设置
  const element = useRef<T>(null);

  // 定义onEnterRef的dom
  const onEnterRef = useRef(onEnter);
  onEnterRef.current = onEnter;

  // 定义onLeaveRef的dom
  const onLeaveRef = useRef(onLeave);
  onLeaveRef.current = onLeave;

  // 获取当前boolean状态
  const { state, setTrue, setFalse } = useBoolean(false);

  useEffect(() => {
    // 当进入Dom时
    const onMouseEnter = () => {
      if (onEnterRef.current) onEnterRef.current();
      setTrue();
    };

    // 当移除Dom时
    const onMouseLeave = () => {
      if (onLeaveRef.current) onLeaveRef.current();
      setFalse();
    };

   // 获取当前进入的dom 
    const passedInElement = typeof dom === 'function' ? dom() : dom;

    // 如果 传入dom存在
    if (passedInElement) {
      // 监听对应的Enter事件
      passedInElement.addEventListener('mouseenter', onMouseEnter);
      // 监听对应的Enter事件
      passedInElement.addEventListener('mouseleave', onMouseLeave);

      // 处理副作用
      return () => {
        passedInElement.removeEventListener('mouseenter', onMouseEnter);
        passedInElement.removeEventListener('mouseleave', onMouseLeave);
      };
    }

    // 如果传入dom不存在，验证对应的node存在不；
    const node = element.current;

    //如果node存在，则监听事件
    if (node) {
      node.addEventListener('mouseenter', onMouseEnter);
      node.addEventListener('mouseleave', onMouseLeave);
      return () => {
        node.removeEventListener('mouseenter', onMouseEnter);
        node.removeEventListener('mouseleave', onMouseLeave);
      };
    }

  }, [element.current, typeof dom === 'function' ? undefined : dom]);

  // 如果dom存在，返回对应的对象
  if (dom) {
    return [!!state];
  }

  // 如果don不存在， 返回对应的状态及对应的dom；
  return [!!state, element as MutableRefObject<T>];
};
