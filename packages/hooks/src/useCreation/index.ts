import {useRef} from 'react'
/**
 * useCreation 是 useMemo 或 useRef 的替代品。
 * @param factory : 用来创建所需对象的函数
 * @param deps : 	传入依赖变化的对象
 */
export default function useCreation<T>(factory: () => T, deps: any[]) {

  // 声明当前对象
  const {current} = useRef({
    deps,
    obj: undefined as undefined | T,
    initialized: false,
  })
  // 如果initialized第一次渲染|| 比较所有的依赖是否有变化，如果有变化则需要create
  if (current.initialized === false || !depsAreSame(current.deps, deps)) {
    current.deps = deps
    current.obj = factory()
    current.initialized = true
  }
  //返回当前ref
  return current.obj as T
}

// 
function depsAreSame(oldDeps: any[], deps: any[]): boolean {
  if (oldDeps === deps) return true
  for (let i in oldDeps) {
    if (oldDeps[i] !== deps[i]) return false
  }
  return true
}
