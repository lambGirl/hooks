/**
 * 只在组件 mount 时执行的 hook
 */
import { useEffect } from 'react';

import usePersistFn from '../usePersistFn';

const useMount = (fn: any) => {
  // 持久化函数
  const fnPersist = usePersistFn(fn);

  // 初始化执行的方法
  useEffect(() => {
    if (fnPersist && typeof fnPersist === 'function') {
      fnPersist();
    }
  }, [])
};

export default useMount;
