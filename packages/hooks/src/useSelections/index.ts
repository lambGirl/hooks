/* eslint-disable no-shadow */
import { useState, useMemo } from 'react';

/**
 * 常见联动 checkbox 逻辑封装，支持多选，单选，全选逻辑，还提供了是否选择，是否全选，是否半选的状态。
 * @param items 
 * @param defaultSelected 
 */
export default function useSelections<T>(items: T[], defaultSelected: T[] = []) {
  // 定义选中初始化值
  const [selected, setSelected] = useState<T[]>(defaultSelected);

  // 当selected改变时，重新调整
  const { selectedSet, isSelected, select, unSelect, toggle } = useMemo(() => {
    // 定义选中的值， 以set定义，保证值不能重复
    const selectedSet = new Set<T>(selected);

    // 用已验证某一个值是否被选中
    const isSelected = (item: T) => selectedSet.has(item);

    // 执行选中的操作
    const select = (item: T) => {
      // 将当前选中的item => 添加到对应的selectesSet数据中，通过add，可以减少重复验证
      selectedSet.add(item);
      /**
       * 简介一下array.from的用法，只要类似数组对象中有Interator接口的数据结构，array.from都可以将起转化成数组
       * array.from方法用于将两类对象转为真正的数组：类似数组的对象（array-like object）和可遍历（iterable）的对象（包括 ES6 新增的数据结构 Set 和 Map）
       */
      // 设置选中的值
      return setSelected(Array.from(selectedSet));
    };

    // 取消选中操作
    const unSelect = (item: T) => {
      // 删除对应的对象
      selectedSet.delete(item);
      // 重新设置对应的值
      return setSelected(Array.from(selectedSet));
    };

    // 封装用于切换选中，取消选中的交换方法
    const toggle = (item: T) => {
      // 判断如果是选中状态，则执行取消操作， 否则执行选中操作
      if (isSelected(item)) {
        unSelect(item);
      } else {
        select(item);
      }
    };

    /**
     * selectedSet: 选中的值
     * isSelected: 判断是否被选中
     * select: 选中
     * unSelect: 取消选中
     * toggle: 切换选中或取消选中
     */
    return { selectedSet, isSelected, select, unSelect, toggle };
  }, [selected]);

  // 当selectedSet,items发生改变时，重新处理方法
  const {
    selectAll,
    unSelectAll,
    noneSelected,
    allSelected,
    partiallySelected,
    toggleAll,
  } = useMemo(() => {

    // 全选操作
    const selectAll = () => {
      // forEach不会存在异步的情况，循环设置selectedSet
      items.forEach(o => {
        selectedSet.add(o);
      });
      setSelected(Array.from(selectedSet));
    };

    // 取消全选
    const unSelectAll = () => {
      items.forEach(o => {
        selectedSet.delete(o);
      });
      setSelected(Array.from(selectedSet));
    };

    /**
     * Array.prototype.every:
     * 方法测试数组的所有元素是否都通过了指定函数的测试
     * 只要有一个不满足就要返回false；
     */
    // 判断是否一个都没有选择
    const noneSelected = items.every(o => !selectedSet.has(o));

    // 判断所有的checkbox都被选中
    const allSelected = items.every(o => selectedSet.has(o)) && !noneSelected;


    // 是否半选
    const partiallySelected = !noneSelected && !allSelected;

    const toggleAll = () => (allSelected ? unSelectAll() : selectAll());

    return { selectAll, unSelectAll, noneSelected, allSelected, partiallySelected, toggleAll };
  }, [selectedSet, items]);

  /**
   * selected： 已经选择的元素
   * isSelected： 是否被选择
   * select： 选择元素操作
   * unSelect： 取消选择元素的操作
   * toggle： 选择元素与取消元素的切换操作，反之依然
   * selectAll： 选择全部元素
   * unSelectAll： 取消选择全部元素
   * toggleAll： 反选全部元素
   * allSelected： 是否全选
   * noneSelected： 是否一个都没有选择
   * partiallySelected： 是否半选
   * setSelected： 设置选择的元素
   */
  return {
    selected,
    isSelected,
    select,
    unSelect,
    toggle,
    selectAll,
    unSelectAll,
    toggleAll,
    allSelected,
    noneSelected,
    partiallySelected,
    setSelected,
  } as const;
}
