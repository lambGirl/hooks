import { useEffect, useState } from 'react';
/**
 * 获取响应式信息。
 * 在组件中调用 useResponsive 可以获取并订阅浏览器窗口的响应式信息。
 * 默认的响应式配置和 bootstrap 是一致的：
 * {
  'xs': 0,
  'sm': 576,
  'md': 768,
  'lg': 992,
  'xl': 1200,
  }
 */
// 定义订阅类型
type Subscriber = () => void;

// 声明Set对象
const subscribers = new Set<Subscriber>();

// 定义响应配置
interface ResponsiveConfig {
  [key: string]: number;
}

// 定义 响应信息
interface ResponsiveInfo {
  [key: string]: boolean;
}

let info: ResponsiveInfo;

// 屏幕大小
let responsiveConfig: ResponsiveConfig = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

// 初始化配置
function init() {
  // 如果info 存在，则返回
  if (info) return;
  // 赋值
  info = {};
  // 开启计算操作
  calculate();

  // 当窗口发生 改变的时候，需要重新计算
  window.addEventListener('resize', () => {
    const oldInfo = info;
    calculate();
    if (oldInfo === info) return;
    for (const subscriber of subscribers) {
      subscriber();
    }
  });
}

function calculate() {
  // 返回窗口的文档显示区的宽度
  const width = window.innerWidth;

  const newInfo = {} as ResponsiveInfo;

  // 应该更新
  let shouldUpdate = false;

  // 判断 如果
  for (const key of Object.keys(responsiveConfig)) {
    // 设置对应的key; 当前的宽度，大于等于设置的默认值，设置key对应的状态为true
    newInfo[key] = width >= responsiveConfig[key];

    // 判断如果 新的对应信息，与info的对应信息不相等，则需要设置对应的值。修改shouldUpdate =  true;
    if (newInfo[key] !== info[key]) {
      shouldUpdate = true;
    }
  }
  // 如果shouldUpdate为true， 则重新赋值
  if (shouldUpdate) {
    info = newInfo;
  }
}

// 如果需要修改响应的配置，则通过configResponsive重新配置
export function configResponsive(config: ResponsiveConfig) {
  responsiveConfig = config;
  // 重新执行计算
  if (info) calculate();
}

// 定义导出的useResponsive; 当前是什么类型的屏幕
export function useResponsive() {
  init();
  const [state, setState] = useState<ResponsiveInfo>(info);

  useEffect(() => {
    const subscriber = () => {
      setState(info);
    };
    subscribers.add(subscriber);
    return () => {
      subscribers.delete(subscriber);
    };
  }, []);

  return state;
}
