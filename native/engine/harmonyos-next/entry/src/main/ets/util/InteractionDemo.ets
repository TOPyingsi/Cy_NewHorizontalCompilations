import { PortProxy } from "../common/PortProxy";

let wordPort: PortProxy = null!; // 声明一个PortProxy类型的变量wordPort，并初始化为null
function initWordPort(work:PortProxy){
  wordPort = work;
}

function syncFunction(param: string): string {
  console.log("cocos demo enter syncFunction")
  return param;
}

function Hide(param: string): string {
  console.log("调用隐私政策Hide() -- Demo");
  return param;
}

function asyncFunction(param: string, callback: Function): void {
  console.log("cocos demo enter asyncFunction");
  setTimeout(() => { // 设置定时器，延迟1秒后执行回调函数
    callback(param); // 调用回调函数，并传递参数param
  }, 1000) // 1000毫秒即1秒后执行
}

function uiToWorkerFunction(param:string):void{
  console.log("cocos demo enter uiToWorkerFunction");
  console.log("cocos demo start to send message to worker thread");
  wordPort.postMessage("uiToWorkerTest",param)
}

export {syncFunction,asyncFunction,uiToWorkerFunction,initWordPort,Hide}