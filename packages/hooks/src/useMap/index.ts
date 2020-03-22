import { useState, useMemo, useCallback } from 'react';
/**
 * 一个可以管理 Map 类型状态的 Hook。
 */
interface StableActions<U, V> {
  // 添加元素: (key: any, value: any) => void
  set: (key: U, value: V) => void;

  // 添加并生成一个新的 Map 对象: (newMap: Iterable<[any, any]>) => void
  setAll: (newMap: Iterable<readonly [U, V]>) => void;

  // 移除元素: (key: any) => void
  remove: (key: U) => void;

  // 重置为默认值: () => void
  reset: () => void;
}

interface Actions<U, V> extends StableActions<U, V> {
  // 获取元素: (key: any) => MapItem
  get: (key: U) => V;
}

/**
 * 
 * @param initialValue : 可选项，传入默认的 Map 参数
 */
function useMap<K, T>(initialValue?: Iterable<readonly [K, T]>): [Map<K, T>, Actions<K, T>] {
  // 初始化获取initialMap； initialValue ?  new Map(initialValue): new Map();
  const initialMap = useMemo<Map<K, T>>(
    () => (initialValue === undefined ? new Map() : new Map(initialValue)) as Map<K, T>,
    [initialValue]
  );
  //  定义map， set
  const [map, set] = useState(initialMap);

  const stableActions = useMemo<StableActions<K, T>>(
    () => ({
      // 添加对象
      set: (key, entry) => {
        map.set(key, entry);
        set(new Map([...map]));
      },
      // 生成一个新的 Map 对象
      setAll: newMap => {
        set(new Map(newMap))
      },
      // 移除元素
      remove: key => {
        map.delete(key);
        set(new Map([...map]))
      },

      //重置为默认值
      reset: () => set(initialMap),
    }),
    [map, set]
  );

  // 合并所有的操作
  const utils = {
    get: useCallback(key => map.get(key), [map]),
    ...stableActions,
  } as Actions<K, T>;
  
  // 返回对应的map及可以操作map的工具
  return [map, utils];
};

export default useMap;
