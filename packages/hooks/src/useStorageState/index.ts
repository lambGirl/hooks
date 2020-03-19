import { useState } from 'react';
import useUpdateEffect from '../useUpdateEffect';

<<<<<<< HEAD
/**
 * 定义参数
 */
interface IFuncUpdater<T> {
  (previousState?: T): T;
}

// 验证是不是Function
=======
export interface IFuncUpdater<T> {
  (previousState?: T): T;
}

export type StorageStateDefaultValue<T> = T | IFuncUpdater<T>;

export type StorageStateResult<T> = [T | undefined, (value: StorageStateDefaultValue<T>) => void];

>>>>>>> ed3b594ff98741797dcc232bab711ab5fe993e3d
function isFunction<T>(obj: any): obj is T {
  return typeof obj === 'function';
}

<<<<<<< HEAD
// 定义useStorageState
/**
 *
 * @param storage : 缓存类型localStorage， SessionStorage;
 * @param key: 对应的key
 * @param defaultValue： 设置对应的值
 */
function useStorageState<T>(storage: Storage, key: string, defaultValue?: T | IFuncUpdater<T>) {
  // 定义state
=======
function useStorageState<T>(
  storage: Storage,
  key: string,
  defaultValue?: StorageStateDefaultValue<T>
): StorageStateResult<T> {
>>>>>>> ed3b594ff98741797dcc232bab711ab5fe993e3d
  const [state, setState] = useState<T | undefined>(() => getStoredValue());

  // 获取StoredValue
  function getStoredValue() {
    const raw = storage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
    // 验证defaultValue是够为Function
    if (isFunction<IFuncUpdater<T>>(defaultValue)) {
      // 执行defaultValue();
      return defaultValue();
    }
    // 直接返回
    return defaultValue;
  }

  /**
   * updateState： 更新值
   * @param value：传入值
   */
  function updateState(value?: T | IFuncUpdater<T>) {
    // 如果value为'undefined'： typeof value === 'undefined';
    if (typeof value === 'undefined') {
      // 移除key对象
      storage.removeItem(key);
<<<<<<< HEAD
      // 设置初始值
      setState(defaultValue);
      // 判断value是否为Function
=======
      setState(undefined);
>>>>>>> ed3b594ff98741797dcc232bab711ab5fe993e3d
    } else if (isFunction<IFuncUpdater<T>>(value)) {
      // 获取previousState = getStoreValue();
      const previousState = getStoredValue();

      // 获取currentState
      const currentState = value(previousState);

      // 设置对应值
      storage.setItem(key, JSON.stringify(currentState));

      // 设置当前值
      setState(currentState);
    } else {
      // 设置对应的值
      storage.setItem(key, JSON.stringify(value));
      // 设置对应的值
      setState(value);
    }
  }
<<<<<<< HEAD
  // 返回state； updateState
=======

  useUpdateEffect(() => {
    setState(getStoredValue());
  }, [key]);

>>>>>>> ed3b594ff98741797dcc232bab711ab5fe993e3d
  return [state, updateState];
}

export default useStorageState;
