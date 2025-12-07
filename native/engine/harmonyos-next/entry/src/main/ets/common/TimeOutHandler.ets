import Logger from './Logger'

let log: Logger = new Logger(0x0002, "TimeOutHandler");

/**
 * 超时处理器,用于在超时之后做一些操作
 */
export class TimeOutHandler {
  isTimeOut: boolean;
  private timeOutIndex:number;

  constructor(handler:() => void, delay:number) {
    log.info('Create timeout handler');
    this.isTimeOut = false;
    this.timeOutIndex = setTimeout(() => {
      log.info('Timeout');
      this.isTimeOut = true;
      handler();
    },delay);
  }

  clear(): void{
    clearTimeout(this.timeOutIndex);
  }

}