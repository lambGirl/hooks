import { useEffect, useRef } from 'react';

/**
 * 只在组件 unmount 时执行的 hook
 * @param fn 
 */
const useUnmount = (fn: any) => {
  // 声明当前的ref
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(()=>{
    // 当在unmount时调用对应的方法
    return () => {
      if(fnRef.current && typeof fnRef.current === 'function') {
        fnRef.current();
      }
    }
  }, [])
};

export default useUnmount;
