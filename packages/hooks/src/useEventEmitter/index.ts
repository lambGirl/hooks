import { useRef, useEffect } from 'react';
 /**
  * 发布订阅模式
  */

// 定一个订阅类型
type Subscription<T> = (val: T) => void;

//  声明一个时间的监听中
export class EventEmitter<T> {
  
  // 定义订阅器
  private subscriptions = new Set<Subscription<T>>();

  // 触发对应方法
  emit = (val: T) => {
    // 判断对应的subscriptions内部是否已经定义订阅器
    for (const subscription of this.subscriptions) {
      subscription(val);
    }
  };

  // 声明对应的订阅器
  /**
   * callback 传入对应的回调函数
   */
  useSubscription = (callback: Subscription<T>) => {
    const callbackRef = useRef<Subscription<T>>();
    callbackRef.current = callback;
    useEffect(() => {
      // 声明对应的subscription
      function subscription(val: T) {
        if (callbackRef.current) {
          callbackRef.current(val);
        }
      }
      // 添加对应的订阅
      this.subscriptions.add(subscription);

      // 当移除时，清除副作用
      return () => {
        this.subscriptions.delete(subscription);
      };
    }, []);
  };
}

// 封装hooks，调用及生成对应的监听器
export default function useEventEmitter<T = void>() {

  // 定义useRef，返回对象
  const ref = useRef<EventEmitter<T>>();
  
  // 如果ref.current不存在，则初始化对应的监听器，
  if (!ref.current) {
    ref.current = new EventEmitter();
  }
  // 返回当前的监听器
  return ref.current;
}
