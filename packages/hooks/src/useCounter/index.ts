import { useMemo, useState } from 'react';
import useCreation from '../useCreation';
/**
 * 一个可以管理 count 的 Hook。
 */
export interface Options {
  // 最小值
  min?: number;

  // 最大值
  max?: number;
}

export interface Actions {
  // 加，默认加 1
  inc: (delta?: number) => void;
  // 减，默认减 1
  dec: (delta?: number) => void;
  // 设置 current
  set: (value: number | ((c: number) => number)) => void;
  // 重置为默认值
  reset: () => void;
}

function useCounter(
  // 默认值 
  initialValue: number = 0,
  options: Options = {}
): [number, Actions] {

  //  获取最小值，最大值
  const { min, max } = options;

  // 获取初始值
  const init = useCreation(() => {
    if (typeof max === 'number') {
      // 最大值，谁最小已谁为准
      return Math.min(max, initialValue);
    }
    if (typeof min === 'number') {
      // 最小值，谁最大已谁为准
      return Math.max(min, initialValue);
    }
    return initialValue;
  }, []);

  // 设置对应的初始值
  const [current, setCurrent] = useState(init);

  // 封装对应的操作
  const actions = useMemo(() => {
    // 设置当前值
    const setValue = (value: (number | ((c: number) => number))) => {
      setCurrent((c: number) => {
        // get target value
        let target = typeof value === 'number' ? value : value(c);
        if (typeof max === 'number') {
          target = Math.min(max, target);
        }
        if (typeof min === 'number') {
          target = Math.max(min, target);
        }
        return target;
      });
    }
    //  
    const inc = (delta: number = 1) => {
      setValue(c => c + delta);
    }
    const dec = (delta: number = 1) => {
      setValue(c => c - delta);
    }
    const set = (value: number | ((c: number) => number)) => {
      setValue(value);
    }
    const reset = () => {
      setValue(init);
    }
    return { inc, dec, set, reset }
  }, []);

  return [current, actions];
}

export default useCounter;
