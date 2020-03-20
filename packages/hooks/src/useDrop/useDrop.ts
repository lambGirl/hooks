import { useMemo, useState, useRef, useCallback } from 'react';
/**
 * 元素被拖拽的几要素
 * https://www.runoob.com/jsref/event-ondragend.html
 * ondragend 事件在用户完成元素或首选文本的拖动时触发。
 * 拖放是 HTML5 中非常常见的功能。 更多信息可以查看我们 HTML 教程中的 HTML5 拖放。
 * 注意： 为了让元素可拖动，需要使用 HTML5 draggable 属性。
 * 提示： 链接和图片默认是可拖动的，不需要 draggable 属性。
 * 在拖放的过程中会触发以下事件：
 * 1. 在拖动目标上触发事件 (源元素):
 *    ondragstart - 用户开始拖动元素时触发
 *    ondrag - 元素正在拖动时触发
 *    ondragend - 用户完成元素拖动后触发
 * 
 * 2. 释放目标时触发的事件:
 *    ondragenter - 当被鼠标拖动的对象进入其容器范围内时触发此事件
 *    ondragover - 当某被拖动的对象在另一对象容器范围内拖动时触发此事件
 *    ondragleave - 当被鼠标拖动的对象离开其容器范围内时触发此事件
 *    ondrop - 在一个拖动过程中，释放鼠标键时触发此事件
 */

// 拖拽区域是否激活
export interface DropAreaState {
  isHovering: boolean;
}

export interface DropProps {
  // 当某被拖动的对象在另一对象容器范围内拖动时触发此事件
  onDragOver: React.DragEventHandler;
  // 当被鼠标拖动的对象进入其容器范围内时触发此事件
  onDragEnter: React.DragEventHandler;

  // 当被鼠标拖动的对象离开其容器范围内时触发此事件
  onDragLeave: React.DragEventHandler;

  // 在一个拖动过程中，释放鼠标键时触发此事件
  onDrop: React.DragEventHandler;

 //粘贴触发
  onPaste: React.ClipboardEventHandler;
}

// 拖拽区域的回调类型
export interface DropAreaOptions {

  // 拖拽文件的回调
  onFiles?: (files: File[], event?: React.DragEvent) => void;
  // 拖拽链接的回调
  onUri?: (url: string, event?: React.DragEvent) => void;
  // 拖拽自定义 dom 节点的回调
  onDom?: (content: any, event?: React.DragEvent) => void;
  // 拖拽文字的回调
  onText?: (text: string, event?: React.ClipboardEvent) => void;

};

/**
 * 统一封装拖拽的方法拖拽成功执行对应的回调
 * event.persist(), 用法参考reactSyntheticEvent(合成事件)的用法
 * @param callback 转化后的回掉
 * @param setIsHovering  设置是否是拖拽中，且光标处于释放区域内
 */
const getProps = (
  callback: (dataTransfer: DataTransfer, event: (React.DragEvent | React.ClipboardEvent)) => void, 
  setIsHovering: (over: boolean) => void,
): DropProps => ({
  onDragOver: (event: React.DragEvent) => {
    // 阻止冒泡
    event.preventDefault();
  },
  onDragEnter: (event: React.DragEvent) => {
    // 阻止冒泡
    event.preventDefault();
    //设置为拖拽中
    setIsHovering(true);
  },
  onDragLeave: () => {
    // 设置为未拖拽中，并且关闭非在释放区域
    setIsHovering(false);
  },
  onDrop: (event: React.DragEvent) => {
    // 阻止冒泡
    event.preventDefault();
    // 注意：如果你想异步访问事件属性，你需在事件上调用 event.persist()，此方法会从池中移除合成事件，允许用户代码保留对事件的引用。
    event.persist();
    // 异步设置对应的值
    setIsHovering(false);
    // 需要异步导出对应event事件对象， 允许用户代码保留对事件的引用
    callback(event.dataTransfer, event);
  },
  onPaste: (event: React.ClipboardEvent) => {
    // 此方法会从池中移除合成事件
    event.persist();
    // 允许用户代码保留对事件的引用
    callback(event.clipboardData, event);
  },
});

/**
 * 
 * @param options 
 * 返回DropProps： 需要透传给接受拖拽区域 dom 节点的 props
 * DropAreaState： 是否是拖拽中，且光标处于释放区域内
 */
const useDrop = (options: DropAreaOptions = {}): [DropProps, DropAreaState] => {
  // 根据props设置拖拽区域dom节点，ref的使用
  const optionsRef = useRef(options);
  // 设置对应的ref.current =  options;
  optionsRef.current = options;
  // 默认初始化当前是否进入到拖拽的区域，是否开启拖拽
  const [isHovering, setIsHovering] = useState<boolean>(false);


  const callback = useCallback((
    dataTransfer: DataTransfer, event: (React.DragEvent | React.ClipboardEvent)
  ) => {
    const uri = dataTransfer.getData('text/uri-list');
    const dom = dataTransfer.getData('custom');
  
    // 验证是不是dom，如果是dom执行dom操作
    if(dom && optionsRef.current.onDom) {
      optionsRef.current.onDom(JSON.parse(dom), event as React.DragEvent);
      return;
    }


  // 验证是否为url，则执行url拖拽
    if (uri && optionsRef.current.onUri) {
      optionsRef.current.onUri(uri, event as React.DragEvent);
      return;
    }
  
    // 验证是否为文件，则执行文件操作
    if (dataTransfer.files && dataTransfer.files.length && optionsRef.current.onFiles) {
      optionsRef.current.onFiles([...dataTransfer.files], event as React.DragEvent);
      return;
    }
  
    // 验证是否为文本，执行文本回调
    if (dataTransfer.items && dataTransfer.items.length && optionsRef.current.onText) {
      dataTransfer.items[0].getAsString(text => {
        optionsRef.current.onText!(text, event as React.ClipboardEvent);
      });
    }
  }, []);
  
  const props: DropProps = useMemo(() => getProps(callback, setIsHovering), [callback, setIsHovering]);

  /**
   * props： 需要透传给接受拖拽区域 dom 节点的 props
   * 是否是拖拽中，且光标处于释放区域内
   */
  return [props, { isHovering }];
};

export default useDrop;