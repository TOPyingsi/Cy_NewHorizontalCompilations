        // 计时器接口定义
export interface XCT_Timer {
        id: number;         // 计时器唯一ID
        duration: number;   // 总持续时间（秒）
        elapsed: number;    // 已流逝时间（秒）
        callback: Function; // 计时结束回调函数
        isPaused: boolean;  // 是否暂停
}