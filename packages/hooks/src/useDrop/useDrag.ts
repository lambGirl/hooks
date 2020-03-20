/**
 * 用法： useDrag 允许一个 dom 节点被拖拽，需要配合 useDrop 使用。
 */

// 定义类型
type getDragPropsFn = (data: any) => {
  draggable: 'true',
  key: string,
  onDragStart: (e: React.DragEvent) => void;
}

// 定义Drag， 返回一个闭包 useDrag Result
const useDrag = (): getDragPropsFn => {

  // getDragProps： 一个接收拖拽的值，并返回需要透传给被拖拽节点 props 的方法
  const getProps = (data: any) => {
    return {
      key: JSON.stringify(data),
      draggable: 'true' as const,
      onDragStart: (e: React.DragEvent) => {
        e.dataTransfer.setData('custom', JSON.stringify(data));
      }
    }
  }

  return getProps;
};

export default useDrag;