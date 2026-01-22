import { _decorator, Component, Node } from 'cc';
import { CDXX2_BG } from './CDXX2_Constant';
import { CDXX2_EventManager, CDXX2_MyEvent } from './CDXX2_EventManager';
import { CDXX2_GameData } from './CDXX2_GameData';
import { CDXX2_GameManager } from './CDXX2_GameManager';
import { CDXX2_EnemyManager } from './CDXX2_EnemyManager';
import CDXX2_PlayerController from './CDXX2_PlayerController';
const { ccclass, property } = _decorator;

@ccclass('CDXX2_TeleportPanel')
export default class CDXX2_TeleportPanel extends Component {
    @property([Node])
    Buttons: Node[] = [];

    onLoad() {
        console.log('CDXX2_TeleportPanel onLoad，Buttons数量:', this.Buttons?.length);
        if (!this.Buttons || this.Buttons.length === 0) {
            console.warn('CDXX2_TeleportPanel: Buttons 未设置或为空');
            return;
        }
        
        // 为每个按钮添加点击事件
        this.Buttons.forEach((btn, idx) => {
            if (!btn) {
                console.warn(`CDXX2_TeleportPanel: Buttons[${idx}] 为 null`);
                return;
            }
            btn.on(Node.EventType.TOUCH_END, () => {
                this.onButtonClick(idx);
                console.log(idx);
                
            }, this);
        });
    }

    onButtonClick(idx: number) {
        console.log('CDXX2_TeleportPanel: 点击了按钮', idx);
        
        // 按钮顺序对应 6 个地图：凡界_下层, 凡界_上层, 灵界_下层, 灵界_上层, 仙界_下层, 仙界_上层
        const maps = [
            CDXX2_BG.凡界_下层,
            CDXX2_BG.凡界_上层,
            CDXX2_BG.灵界_下层,
            CDXX2_BG.灵界_上层,
            CDXX2_BG.仙界_下层,
            CDXX2_BG.仙界_上层,
        ];
        const map = maps[idx];
        if (map === undefined) {
            console.warn(`CDXX2_TeleportPanel: 无效的按钮索引 ${idx}`);
            return;
        }

        if (!CDXX2_GameData.Instance) {
            console.warn('传送失败：CDXX2_GameData 未初始化');
            return;
        }

        // 如果已经在当前地图，就直接关闭弹窗
        if (CDXX2_GameData.Instance.CurMap === map) {
            console.log('CDXX2_TeleportPanel: 已在目标地图，只关闭弹窗');
            this.node.active = false;
            return;
        }

        console.log(`CDXX2_TeleportPanel: 开始传送到地图 ${map}`);
        
        // 1. 停战斗 + 清敌人
        CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_PAUSE);
        CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_ENEMY_REMOVE);
        CDXX2_EnemyManager.Instance.Clear();
        
        // 2. Loading 1 秒后切换地图
        CDXX2_GameManager.Instance.ShowLoadingPanel(1, () => {
            // 3. 设置地图并发出事件
            CDXX2_GameData.Instance.CurMap = map;
            CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_BG_SHOW, map);
            
            // 4. 满血 + 刷新状态
            CDXX2_PlayerController.Instance.Injured = 0;
            CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_STATE_SHOW);
            
            console.log(`CDXX2_TeleportPanel: 已传送到地图 ${map}`);
        });

        // 隐藏弹窗
        this.node.active = false;
    }

    onDisable() {
        // if (!this.Buttons) return;
        // this.Buttons.forEach((btn) => {
        //     if (btn) {
        //         btn.off(Node.EventType.TOUCH_END);
        //     }
        // });
    }
}

