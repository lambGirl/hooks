import { useState, useMemo, useCallback } from 'react';
/**
 * 一个可以管理 Set 类型状态的 Hook。
 */
interface StableActions<K> {
  // 添加元素
  add: (key: K) => void;

  //移除元素
  remove: (key: K) => void;

  // 重置为默认值
  reset: () => void;
}

interface Actions<K> extends StableActions<K> {
  // 判断是否存在元素
  has: (key: K) => boolean;
}

function useSet<K>(initialValue?: Iterable<K>): [Set<K>, Actions<K>] {

  // 初始化成对应的Set
  const initialSet = useMemo<Set<K>>(
    () => (initialValue === undefined ? new Set() : new Set(initialValue)) as Set<K>,
    [initialValue]
  );
  // 声明set， setSet
  const [set, setSet] = useState(initialSet);

  // 封装对应的操作
  const stableActions = useMemo<StableActions<K>>(
    () => ({
      add: key => setSet(prevSet => new Set([...Array.from(prevSet), key])),
      remove: key => setSet(prevSet => new Set(Array.from(prevSet).filter(i => i !== key))),
      reset: () => setSet(initialSet),
    }),
    [setSet]
  );

  const utils = {
    has: useCallback(key => set.has(key), [set]),
    ...stableActions,
  } as Actions<K>;

  return [set, utils];
};

export default useSet;
