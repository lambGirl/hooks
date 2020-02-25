import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

/**
 * 定义一个范型的方法，有初始值
 * 一个帮助你管理列表状态，并能生成唯一 key 的 Hook。
 * initialValue: 列表的初始值 T[];
 * 备注返回
 *  list: 当前的列表 T[]
    insert, 在指定位置插入元素 (index: number, obj: T) => void
    merge, 在指定位置插入多个元素  (index: number, obj: T) => void
    replace,替换指定元素  (index: number, obj: T) => void
    remove, 删除指定元素  (index: number) => void;
    getKey, 获得某个元素的 uuid  (index: number) => number;
    getIndex, 获得某个key的 index (key: number) => number;
    move, 移动元素 (oldIndex: number, newIndex: number) => void;
    push, 在列表末尾添加元素 	(obj: T) => void;
    pop, 移除末尾元素 () => void;
    unshift, 在列表起始位置添加元素 (obj: T) => void;
    shift,  移除起始位置元素 () => void; 
    sortForm,  根据表单结果自动排序 (list: unknown[]) => unknown[];
    resetList, 重新设置 list 的值 (list: T[]) => void;
 */
export default <T>(initialValue: T[]) => {
  //  计数器： 初始值为-1
  const counterRef = useRef(-1);

  // key 存储器
  const keyList = useRef<number[]>([]);

  // 内部方法
  const setKey = useCallback((index: number) => {
    // 将counterRef的值+1
    counterRef.current += 1;

    // 在index索引处， 新增counterRef.current的当前值
    keyList.current.splice(index, 0, counterRef.current);
  }, []);

  /**
   * 定义list的初始值
   * 此处初始化list的值 initialValue || [];
   * 设置key的长度
   * keyList [0, ..., initialValue.length-1]
   * counterRef= initialValue.length - 1;
   */
  const [list, setList] = useState(() => {
    (initialValue || []).forEach((_, index) => {
      setKey(index);
    });
    return initialValue || [];
  });


  /**
   * 重置list的值
   * @param newList 
   */
  const resetList = (newList: T[] = []) => {
    // 初始化keyList.current的值
    keyList.current = [];

    // 初始化counterRef.current的初始值
    counterRef.current = -1;

    // 重新为list赋值为newList, 并设置对应的key值及个数
    setList(() => {
      (newList || []).forEach((_, index) => {
        setKey(index);
      });
      return newList || [];
    });
  };


  /**
   * 在指定位置插入元素
   * @param index： 对应的位置： 数组的索引值
   * @param obj ： 插入的对象
   */
  const insert = (index: number, obj: T) => {
    setList(l => {
      // 中间变量
      const temp = [...l];
      // 在temp的index索引对应的位置插入新增obj对象
      temp.splice(index, 0, obj);
      // 新增一个counter的个数； 并为keyList在index指定的位置上插入数组的个数counter === temp.length - 1;
      setKey(index);
      // 返回插入后的值
      return temp;
    });

  };

  // 获取对应的index对应的key值
  const getKey = (index: number) => keyList.current[index];

  // 获取索引值
  const getIndex = (index: number) => keyList.current.findIndex(ele => ele === index);

  /**
   * 在指定位置插入多个元素
   * @param index 
   * @param obj 
   */
  const merge = (index: number, obj: T[]) => {
    setList(l => {
      const temp = [...l];
      obj.forEach((_, i) => {
        setKey(index + i);
      });
      temp.splice(index, 0, ...obj);
      return temp;
    });
  };

/**
 * 替换指定元素
 * @param index 
 * @param obj 
 */
  const replace = (index: number, obj: T) => {
    setList(l => {
      const temp = [...l];
      temp[index] = obj;
      return temp;
    });
  };

  /**
   * 删除指定元素
   * @param index 
   */
  const remove = (index: number) => {
    setList(l => {
      const temp = [...l];
      temp.splice(index, 1);

      // remove keys if necessary
      try {
        keyList.current.splice(index, 1);
      } catch (e) {
        console.error(e);
      }
      return temp;
    });
  };

  /**
   * 移动元素
   * @param oldIndex 
   * @param newIndex 
   */
  const move = (oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) {
      return;
    }
    setList(l => {
      const newList = [...l];
      const temp = newList.filter((_: {}, index: number) => index !== oldIndex);
      temp.splice(newIndex, 0, newList[oldIndex]);

      // move keys if necessary
      try {
        const keyTemp = keyList.current.filter((_: {}, index: number) => index !== oldIndex);
        keyTemp.splice(newIndex, 0, keyList.current[oldIndex]);
        keyList.current = keyTemp;
      } catch (e) {
        console.error(e);
      }

      return temp;
    });
  };

  /**
   * 在列表末尾添加元素
   * @param obj 
   */
  const push = (obj: T) => {
    setList(l => {
      setKey(l.length);
      return l.concat([obj]);
    });
  };

  /**
   * 移除末尾元素
   */
  const pop = () => {
    // remove keys if necessary
    try {
      keyList.current = keyList.current.slice(0, keyList.current.length - 1);
    } catch (e) {
      console.error(e);
    }

    setList(l => l.slice(0, l.length - 1));
  };

  // 在列表起始位置添加元素
  const unshift = (obj: T) => {
    setList(l => {
      setKey(0);
      return [obj].concat(l);
    });
  };
/**
 * 根据表单结果自动排序
 * @param result 
 */
  const sortForm = (result: unknown[]) =>
    result
      .map((item, index) => ({ key: index, item })) // add index into obj
      .sort((a, b) => getIndex(a.key) - getIndex(b.key)) // sort based on the index of table
      .filter(item => !!item.item) // remove undefined(s)
      .map(item => item.item); // retrive the data

  // 移除起始位置元素
  const shift = () => {
    // remove keys if necessary
    try {
      keyList.current = keyList.current.slice(1, keyList.current.length);
    } catch (e) {
      console.error(e);
    }
    setList(l => l.slice(1, l.length));
  };

  return {
    list,
    insert,
    merge,
    replace,
    remove,
    getKey,
    getIndex,
    move,
    push,
    pop,
    unshift,
    shift,
    sortForm,
    resetList,
  };
};
