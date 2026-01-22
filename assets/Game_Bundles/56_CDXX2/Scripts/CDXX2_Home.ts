import { _decorator, Component, EventTouch, Node, v3, NodeEventType } from 'cc';
import { CDXX2_BG } from './CDXX2_Constant';
import { CDXX2_EventManager, CDXX2_MyEvent } from './CDXX2_EventManager';
import { CDXX2_GameManager } from './CDXX2_GameManager';
import { CDXX2_GameData } from './CDXX2_GameData';
import CDXX2_PlayerController from './CDXX2_PlayerController';
import { CDXX2_EnemyManager } from './CDXX2_EnemyManager';
import { CDXX2_GuaJiChi } from './CDXX2_GuaJiChi';
import { find } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('CDXX2_Home')
export class CDXX2_Home extends Component {

    private readonly TARGET_MAP = CDXX2_BG.凡界_下层;

    protected onLoad(): void {
        this.node.on(NodeEventType.TOUCH_END, this.onHomeClick, this);
    }

    private onHomeClick(evt: EventTouch): void {
        // 0. 先停止挂机增益（必须在场景切换前）
        const guaJiNode = find('Canvas/UI/挂机池');          // 你的挂机按钮/面板根节点
        console.log('【Home】找到的节点：', guaJiNode);
        const guaJi = guaJiNode?.getComponent(CDXX2_GuaJiChi);
        console.log('【Home】拿到的组件：', guaJi);
        if (guaJi) {
            console.log('【Home】即将停止挂机');
            guaJi.stopGuaJiBuff();
        }
        

        // 1. 停战斗 + 清敌人
        CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_PAUSE);
        CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_ENEMY_REMOVE);
        CDXX2_EnemyManager.Instance.Clear();
        // 2. Loading 1 秒
        CDXX2_GameManager.Instance.ShowLoadingPanel(1, () => {
            // 3. 先设置地图，再切图
            CDXX2_GameData.Instance.CurMap = this.TARGET_MAP;
            CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_BG_SHOW, this.TARGET_MAP);

            // 4. 关闭战斗面板
            CDXX2_GameManager.Instance.BattlePanel.active = false;

            // 5. 延迟查找并设置 HomePoint 世界坐标
            // 注：BGController.Show会在激活场景后调用InitPos()重置位置，
            // 所以我们要在更长的延迟后再手动设置位置，覆盖默认初始化
            this.scheduleOnce(() => {
                const homeNode = find('HomePoint');
                if (homeNode) {
                    const pos = homeNode.worldPosition.clone();
                    CDXX2_PlayerController.Instance.InitPos(pos);
                }

                // 6. 满血 + 刷新状态
                CDXX2_PlayerController.Instance.Injured = 0;
                CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_STATE_SHOW);
            }, 0.3);
        });
    }
}