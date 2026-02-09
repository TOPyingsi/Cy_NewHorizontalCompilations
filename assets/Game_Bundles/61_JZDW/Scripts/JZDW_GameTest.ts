import { _decorator, Component, Label } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 游戏测试辅助脚本
 * 用于在开发过程中快速测试和调试
 */
@ccclass('JZDW_GameTest')
export class JZDW_GameTest extends Component {
    
    @property(Label)
    debugLabel: Label = null;

    private debugInfo: string[] = [];

    start() {
        this.log('游戏测试模式启动');
    }

    log(message: string) {
        console.log(`[JZDW Test] ${message}`);
        
        if (this.debugLabel) {
            this.debugInfo.push(message);
            if (this.debugInfo.length > 10) {
                this.debugInfo.shift();
            }
            this.debugLabel.string = this.debugInfo.join('\n');
        }
    }

    // 测试方法：跳过当前关卡
    skipLevel() {
        this.log('跳过当前关卡');
        // 可以通过事件或直接调用游戏脚本的方法
    }

    // 测试方法：回满血量
    restoreHp() {
        this.log('血量已回满');
    }

    // 测试方法：显示当前状态
    showStatus() {
        this.log('显示游戏状态');
    }
}
