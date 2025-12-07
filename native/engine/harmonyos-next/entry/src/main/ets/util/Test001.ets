import { PortProxy } from "../common/PortProxy";

//同步调用
function test(param: string): string {
  console.log("param::", param);
  return param;
}

//异步调用
function syncTest(param: string, cb: Function): void {
  console.log("param::", param);
  setTimeout(() => {
    cb(param);
    console.log("")
    workPort?.postMessage("TestUi","");
  }, 1000);
}
let workPort:PortProxy | null = null;
function setWorkPort(_workPort: PortProxy){
  workPort = _workPort;
}

export { test, syncTest,setWorkPort };