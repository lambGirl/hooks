import { useEffect, useState, useMemo } from 'react';

//  获取dom对象的winth， height;
import useSize from '../useSize';


export interface OptionType {
  itemHeight: number | ((index: number) => number);
  overscan?: number;
}

/**
 * 作用: 提供虚拟化列表能力的 Hook，用于解决展示海量数据渲染时首屏渲染缓慢和滚动卡顿问题。
 * list: 	包含大量数据的列表。 源数据
 * 可选配置项，Options:
 * {
 *   itemHeight: 行高度，静态高度可以直接写入像素值，动态高度可传入函数,
 *   overscan: 可视区域的item个数
 * }
 * 
 */

export default <T = any>(list: T[], options: OptionType) => {
  // 获取对应size及container
  const [size, containerRef] = useSize<HTMLElement>();
  // 暂时禁止 cache
  // const distanceCache = useRef<{ [key: number]: number }>({});
  // 
  const [state, setState] = useState({ start: 0, end: 10 });
  // 获取对应的初始化配置
  const { itemHeight, overscan = 5 } = options;

  if (!itemHeight) {
    console.warn('please enter a valid itemHeight');
  }

  // 计算view视窗可以视窗容纳的个数
  const getViewCapacity = (containerHeight: number) => {
    if (typeof itemHeight === 'number') {
      return Math.ceil(containerHeight / itemHeight);
    }
    const { start = 0 } = state;
    //  计算总高度
    let sum = 0;
    // 可以容量item多少个； 初始化为0 
    let capacity = 0;

    // 计算item的个数； sum： item高度的和
    for (let i = start; i < list.length; i++) {
      const height = (itemHeight as ((index: number) => number))(i);
      sum += height;
      if (sum >= containerHeight) {
        capacity = i;
        break;
      }
    }
    // 当前视窗容纳的个数
    return capacity - start;
  };


  /**
   * @param scrollTop 
   * 这里计算，当前滚动的高度，包含了多少个item;
   * Math.floor: 向下取整
   */
  const getOffset = (scrollTop: number) => {
    if (typeof itemHeight === 'number') {
      return Math.floor(scrollTop / itemHeight) + 1;
    }
    // item高度的总和
    let sum = 0;

    // 移动容器的高度容纳了多少个item
    let offset = 0;

    for (let i = 0; i < list.length; i++) {

      // 获取item的高度
      const height = (itemHeight as ((index: number) => number))(i);
      // 累加计算总和
      sum += height;
      //  计算出，当前容量了多少个item
      if (sum >= scrollTop) {
        offset = i;
        break;
      }
    }
    return offset + 1;
  };

  /**
   *  设置开始的item的位置； 
   *  结束item的位置
   */
  const calculateRange = () => {
    // 获取当前滚动的container容器的dom
    const element = containerRef.current;

    // scrollTop： 运动元素当前的位置距离滚动顶部移动的距离
    if (element) {

      // 获取scrollTop区域容纳了多少个item
      const offset = getOffset(element.scrollTop);
      // 获取可见区域容纳的item
      const viewCapacity = getViewCapacity(element.clientHeight);

      // overscan表示，可是区域从第几个item开始
      const from = offset - overscan;
      // 到第几个item结束，scrollTop滚动区域的item个数+ 可视区域item的个数+结束区域item的个数
      const to = offset + viewCapacity + overscan;

      // 设置开始与技术
      setState({ start: from < 0 ? 0 : from, end: to > list.length ? list.length : to });
    }
  };

  /**
   * 加载时计算
   */
  useEffect(() => {
    calculateRange();
  }, [size.width, size.height]);

  // 计算item累加的height和
  const totalHeight = useMemo(() => {
    if (typeof itemHeight === 'number') {
      return list.length * itemHeight;
    }
    return list.reduce((sum, _, index) => sum + itemHeight(index), 0);
  }, [list.length]);



  /**
   * 运动到某个位置的计算；
   * 计算scrollTop
   * @param index： 滚动到第几个item； 
   */
  const getDistanceTop = (index: number) => {
    // 如果有缓存，优先返回缓存值
    // if (enableCache && distanceCache.current[index]) {
    //   return distanceCache.current[index];
    // }
    
    if (typeof itemHeight === 'number') {
      const height = index * itemHeight;
      // if (enableCache) {
      //   distanceCache.current[index] = height;
      // }
      return height;
    }

    const height = list.slice(0, index).reduce((sum, _, i) => sum + itemHeight(i), 0);
    // if (enableCache) {
    //   distanceCache.current[index] = height;
    // }
    return height;
  };

  // 滚动到某个位置
  const scrollTo = (index: number) => {
    if (containerRef.current) {
      // 设置运动容器的scrollTop
      containerRef.current.scrollTop = getDistanceTop(index);
      // 重新计算start， end
      calculateRange();
    }
  };

  return {
    // 当前需要展示的列表内容
    list: list.slice(state.start, state.end).map((ele, index) => ({
      data: ele,
      index: index + state.start,
    })),
    // 快速滚动到指定 index
    scrollTo,
    // 滚动容器的 props
    containerProps: {
      ref: (ele: any) => {
        containerRef.current = ele;
      },
      onScroll: (e: any) => {
        e.preventDefault();
        calculateRange();
      },
      style: { overflowY: 'auto' as const },
    },
    /// children 外层包裹器 props
    wrapperProps: {
      style: { width: '100%', height: totalHeight, paddingTop: getDistanceTop(state.start) },
    },
  };
};
