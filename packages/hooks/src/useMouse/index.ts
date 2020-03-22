import { useEffect, useState } from 'react';

/**
 * 一个跟踪鼠标位置的 Hook
 */
export interface CursorState {
  // 屏幕x轴坐标位置
  screenX: number;
  // 屏幕Y轴坐标位置
  screenY: number;
  // 浏览器窗口当前的x坐标，不包含滚动条
  clientX: number;
  // 浏览器窗口当前的y坐标，不包含滚动条
  clientY: number;
  // clientX+横轴滚动条的位置
  pageX: number;
  // clientY+纵轴滚动条的位置
  pageY: number;
}

const initState: CursorState = {
  screenX: NaN,
  screenY: NaN,
  clientX: NaN,
  clientY: NaN,
  pageX: NaN,
  pageY: NaN,
};

export default () => {
  // 定义初始化数据
  const [state, setState] = useState(initState);

  useEffect(() => {
    // 当移动时，动态设置对应的state值
    const moveHandler = (event: MouseEvent) => {
      const { screenX, screenY, clientX, clientY, pageX, pageY } = event;
      setState({ screenX, screenY, clientX, clientY, pageX, pageY });
    };
    //  监听dom的mousemove;
    document.addEventListener('mousemove', moveHandler);

    // 当页面离开时，移除对应的mousemove监听
    return () => {
      document.removeEventListener('mousemove', moveHandler);
    };
  }, []);

  return state;
};
