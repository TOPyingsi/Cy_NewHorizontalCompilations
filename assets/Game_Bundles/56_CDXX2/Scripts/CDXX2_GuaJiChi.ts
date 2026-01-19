import { _decorator, Component, Node, NodeEventType, v3, find } from 'cc';
import { CDXX2_BG } from './CDXX2_Constant';
import { CDXX2_EventManager, CDXX2_MyEvent } from './CDXX2_EventManager';
import { CDXX2_GameManager } from './CDXX2_GameManager';
import { CDXX2_GameData } from './CDXX2_GameData';
import CDXX2_PlayerController from './CDXX2_PlayerController';
import { CDXX2_EnemyManager } from './CDXX2_EnemyManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

const { ccclass, property } = _decorator;

@ccclass('CDXX2_GuaJiChi')
export class CDXX2_GuaJiChi extends Component {

    private readonly TARGET_MAP = CDXX2_BG.挂机;
    
    // 挂机位置节点（场景中的空节点）
    @property(Node)
    GuaJiPosNode: Node = null;

    // 记录原始位置（用于退出挂机时恢复）
    private originalPos: { map: CDXX2_BG; pos: any } = null;

    // 挂机增益定时器
    private guaJiTimer: number = 0;
    public  isInGuaJi: boolean = false;

    // 增益倍数和时间间隔
    private readonly BUFF_MULTIPLE = 1.002;
    private readonly BUFF_INTERVAL = 5;

    protected onLoad(): void {
        this.node.on(NodeEventType.TOUCH_END, this.onClick, this);
    }

    private onClick(): void {
        CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_BG_SHOW,CDXX2_BG.挂机);

        // 1. 停战斗 + 清敌人
        CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_PAUSE);
        CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_ENEMY_REMOVE);
        CDXX2_EnemyManager.Instance.Clear();

        // 2. 记录当前位置和地图（用于退出挂机时恢复）
        this.originalPos = {
            map: CDXX2_GameData.Instance.CurMap,
            pos: CDXX2_PlayerController.Instance.node.getWorldPosition().clone()
        };

        // 3. Loading 1 秒（复用 GameManager 现有方法）
        CDXX2_GameManager.Instance.ShowLoadingPanel(1, () => {
            // 4. 关战斗面板
            CDXX2_GameManager.Instance.BattlePanel.active = false;

            // 5. 强制切图到挂机场景
            CDXX2_GameData.Instance.CurMap = this.TARGET_MAP;
            CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_BG_SHOW, this.TARGET_MAP);

            // 6. 延迟处理（确保BGController.Show已激活了挂机场景）
            this.scheduleOnce(() => {
                // 获取挂机位置并移动角色
                let pos = v3(0, 0, 0);
                if (this.GuaJiPosNode && this.GuaJiPosNode.isValid) {
                    pos = this.GuaJiPosNode.worldPosition.clone();
                } else {
                    // 如果没有指定节点，尝试查找场景中的 GuaJiPos 节点
                    const guaJiPos = find('GuaJiPos');
                    if (guaJiPos) {
                        pos = guaJiPos.worldPosition.clone();
                    }
                }
                CDXX2_PlayerController.Instance.InitPos(pos);
                CDXX2_PlayerController.Instance.Injured = 0;

                // 7. 刷新状态栏
                CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_STATE_SHOW);

                // 8. 开始挂机增益
                this.startGuaJiBuff();
            }, 0.3);
        });
    }

    /**
     * 开始挂机增益循环
     * 每5秒将血量、攻击力和战力乘以1.002
     */
    private startGuaJiBuff(): void {
        if (this.isInGuaJi) return;
        
        this.isInGuaJi = true;
        this.guaJiTimer = 0;
        ProjectEventManager.emit(ProjectEvent.页面转换, "吃丹修仙2");

        this.schedule(() => {
            if (!this.isInGuaJi) return;

            // 提升血量上限（存档数据）
            const currentHP = CDXX2_GameData.Instance.HP;
            CDXX2_GameData.Instance.HP = Math.floor(currentHP * this.BUFF_MULTIPLE);

            // 提升攻击力
            const currentHarm = CDXX2_GameData.Instance.Harm;
            CDXX2_GameData.Instance.Harm = Math.floor(currentHarm * this.BUFF_MULTIPLE);

            // 提升战力（存档数据）
            // const currentZL = CDXX2_GameData.Instance.ZL;
            // CDXX2_GameData.Instance.ZL = Math.floor(currentZL * this.BUFF_MULTIPLE);

            // 同时更新PlayerController的本地属性以保持同步
            const playerController = CDXX2_PlayerController.Instance;
            if (playerController) {
                playerController.Harm = CDXX2_GameData.Instance.Harm;
            }

            // 刷新 UI 显示（会触发所有状态栏的更新）
            CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_STATE_SHOW);

            this.guaJiTimer += this.BUFF_INTERVAL;
        }, this.BUFF_INTERVAL);
    }

    /**
     * 停止挂机增益
     */
    public stopGuaJiBuff(): void {
        if (!this.isInGuaJi) return;

        this.isInGuaJi = false;
        this.unscheduleAllCallbacks();

    }

    protected onDestroy(): void {
        this.stopGuaJiBuff();
    }
}