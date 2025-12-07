import { hilog } from "@kit.PerformanceAnalysisKit";

export default class Logger {
  private domain: number
  private prefix: string
  private msgPrefix: string

  constructor(domain: number, prefix: string) { // domain: 日志域标识符，prefix: 日志前缀
    this.domain = domain;
    this.prefix = prefix;
    this.msgPrefix = `[${prefix}]`;
  }

  debug(format: string, ...args: (string | number)[]) {
    hilog.debug(this.domain, this.prefix, this.msgPrefix + format, args);
  }

  info(format: string, ...args: (string | number)[]) {
    hilog.info(this.domain, this.prefix, this.msgPrefix + format, args);
  }

  warn(format: string, ...args: (string | number)[]) {
    hilog.warn(this.domain, this.prefix, this.msgPrefix + format, args);
  }

  error(format: string, ...args: (string | number)[]) {
    hilog.error(this.domain, this.prefix, this.msgPrefix + format, args);
  }
}