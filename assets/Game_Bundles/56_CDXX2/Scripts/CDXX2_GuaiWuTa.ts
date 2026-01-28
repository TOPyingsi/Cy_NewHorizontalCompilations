import { _decorator, Component, Node, Prefab, Label, NodeEventType, EventTouch } from 'cc';
import { CDXX2_PoolManager } from './CDXX2_PoolManager';
import { CDXX2_EventManager, CDXX2_MyEvent } from './CDXX2_EventManager';
import { CDXX2_BG } from './CDXX2_Constant';
import { CDXX2_GameData } from './CDXX2_GameData';
import { CDXX2_UIController } from './CDXX2_UIController';
import { CDXX2_EnemyManager } from './CDXX2_EnemyManager';
import { CDXX2_GameManager } from './CDXX2_GameManager';
import CDXX2_PlayerController from './CDXX2_PlayerController';
import { CDXX2_EnemyController } from './CDXX2_EnemyController';
const { ccclass, property } = _decorator;

/**
 * 怪物塔系统
 * 玩家挑战不同层数的怪物，每层怪物属性翻倍
 * 打败怪物获得内丹，记录进度
 */
@ccclass('CDXX2_GuaiWuTa')
export class CDXX2_GuaiWuTa extends Component {

    @property(Node)
    TowerPopup: Node = null;  // 怪物塔弹窗节点

    @property(Node)
    ChallengeBtn: Node = null;  // 挑战按钮

    @property(Node)
    ExitPopupBtn: Node = null;  // 退出弹窗按钮

    @property(Node)
    ContinuePanel: Node = null;  // 继续挑战面板

    @property(Node)
    NextFloorBtn: Node = null;  // 下一层按钮

    @property(Node)
    ExitTowerBtn: Node = null;  // 退出怪物塔按钮

    @property(Label)
    FloorLabel: Label = null;  // 显示第几层的Label

    @property(Prefab)
    TowerEnemyPrefab: Prefab = null;  // 怪物塔怪物预制体

    @property(Node)
    EnemySpawnPoint: Node = null;  // 怪物刷新位置

    @property(Node)
    PlayerSpawnPoint: Node = null;  // 玩家刷新位置

    private _currentFloor: number = 1;  // 当前层数
    private _currentEnemy: Node = null;  // 当前怪物节点
    private _isInTower: boolean = false;  // 是否在怪物塔中
    private _previousMap: number = 0;  // 进入怪物塔前的地图
    private _checkEnemyInterval: number = 0;  // 检查怪物的定时器

    protected onLoad(): void {
        // 点击怪物塔按钮打开弹窗
        this.node.on(NodeEventType.TOUCH_END, this.onTowerButtonClick, this);

        // 绑定按钮事件（阻止事件冒泡）
        if (this.ChallengeBtn) {
            this.ChallengeBtn.on(NodeEventType.TOUCH_END, (event: EventTouch) => {
                event.propagationStopped = true;
                this.startChallenge();
            }, this);
        }
        if (this.ExitPopupBtn) {
            this.ExitPopupBtn.on(NodeEventType.TOUCH_END, (event: EventTouch) => {
                event.propagationStopped = true;
                this.closePopup();
            }, this);
        }
        if (this.NextFloorBtn) {
            this.NextFloorBtn.on(NodeEventType.TOUCH_END, (event: EventTouch) => {
                event.propagationStopped = true;
                this.nextFloor();
            }, this);
        }
        if (this.ExitTowerBtn) {
            this.ExitTowerBtn.on(NodeEventType.TOUCH_END, (event: EventTouch) => {
                event.propagationStopped = true;
                this.exitTower();
            }, this);
        }

        // 从存档读取当前层数
        this.loadProgress();
    }

    protected onDestroy(): void {
        this.unschedule(this.checkEnemyStatus);
    }

    // 读取进度
    loadProgress(): void {
        this._currentFloor = CDXX2_GameData.Instance.userData["怪物塔层数"] || 1;
    }

    // 保存进度
    saveProgress(): void {
        CDXX2_GameData.Instance.userData["怪物塔层数"] = this._currentFloor;
        CDXX2_GameData.DateSave();
    }

    // 点击怪物塔按钮
    onTowerButtonClick(): void {
        this.openPopup();
    }

    openPopup(): void {
        if (this.TowerPopup) {
            this.TowerPopup.active = true;
        }
    }

    closePopup(): void {
        if (this.TowerPopup) {
            this.TowerPopup.active = false;
        }
    }

    // 开始挑战
    startChallenge(): void {
        // 关闭弹窗
        this.closePopup();

        // 切换到怪物塔地图
        this.switchToTowerMap();
    }

    // 切换到怪物塔地图
    switchToTowerMap(): void {
        // 记录进入前的地图
        this._previousMap = CDXX2_GameData.Instance.CurMap;

        // 1. 停战斗 + 清敌人
        CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_PAUSE);
        CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_ENEMY_REMOVE);
        CDXX2_EnemyManager.Instance.Clear();

        // 2. Loading 1 秒
        CDXX2_GameManager.Instance.ShowLoadingPanel(1, () => {
            // 3. 设置地图为怪物塔
            CDXX2_GameData.Instance.CurMap = CDXX2_BG.怪物塔;
            CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_BG_SHOW, CDXX2_BG.怪物塔);

            // 4. 不打开战斗面板（怪物塔自己管理刷怪）
            // CDXX2_GameManager.Instance.BattlePanel.active = true;

            // 5. 延迟后刷怪
            this.scheduleOnce(() => {
                // 设置玩家位置
                if (this.PlayerSpawnPoint) {
                    CDXX2_PlayerController.Instance.InitPos(this.PlayerSpawnPoint.getWorldPosition().clone());
                }

                // 满血 + 刷新状态
                CDXX2_PlayerController.Instance.Injured = 0;
                CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_STATE_SHOW);

                // 标记进入怪物塔
                this._isInTower = true;

                // 更新层数显示
                this.updateFloorLabel();

                // 刷新怪物
                this.spawnEnemy();

                // 隐藏继续挑战面板
                if (this.ContinuePanel) {
                    this.ContinuePanel.active = false;
                }
            }, 0.3);
        });
    }

    // 更新层数显示
    updateFloorLabel(): void {
        if (this.FloorLabel) {
            this.FloorLabel.string = `第${this._currentFloor}层`;
        }
    }

    // 刷新怪物
    spawnEnemy(): void {
        if (!this.TowerEnemyPrefab) {
            console.error("怪物塔怪物预制体未配置！");
            return;
        }

        if (!this.EnemySpawnPoint) {
            console.error("怪物刷新位置未配置！");
            return;
        }

        // 清除之前的怪物
        if (this._currentEnemy && this._currentEnemy.isValid) {
            CDXX2_PoolManager.Instance.put(this._currentEnemy);
        }

        // 创建新怪物
        this._currentEnemy = CDXX2_PoolManager.Instance.get(this.TowerEnemyPrefab);
        
        // 设置父节点和位置
        if (this.EnemySpawnPoint.parent) {
            this._currentEnemy.parent = this.EnemySpawnPoint.parent;
        }
        this._currentEnemy.setWorldPosition(this.EnemySpawnPoint.getWorldPosition());

        // 初始化怪物
        const controller = this._currentEnemy.getComponent(CDXX2_EnemyController);
        if (controller) {
            controller.Init();

            // 固定基础属性：5000血，200攻击
            const baseHP = 5000;
            const baseHarm = 200;
            
            // 根据层数倍增怪物属性：第N层 = 基础值 × 2^(N-1)
            const multiplier = Math.pow(2, this._currentFloor - 1);
            controller.HP = Math.floor(baseHP * multiplier);
            controller.Harm = Math.floor(baseHarm * multiplier);
            
            console.log(`怪物塔第${this._currentFloor}层：HP=${controller.HP}, 攻击=${controller.Harm}`);
        }

        // 开始定时检查怪物状态
        this.schedule(this.checkEnemyStatus, 0.2);
    }

    // 定时检查怪物是否被击杀
    checkEnemyStatus(): void {
        if (!this._isInTower) {
            this.unschedule(this.checkEnemyStatus);
            return;
        }

        // 检查怪物是否已死亡
        if (this._currentEnemy) {
            const controller = this._currentEnemy.getComponent(CDXX2_EnemyController);
            if (controller && controller.Injury >= controller.HP) {
                // 怪物已死亡
                this.onEnemyKilled();
                this.unschedule(this.checkEnemyStatus);
            }
        }
    }

    // 怪物被击杀
    onEnemyKilled(): void {
        if (!this._isInTower) return;

        // 怪物被击杀，层数+1并保存（这样退出后再进入就是下一层）
        this._currentFloor++;
        this.saveProgress();

        // 给予奖励提示
        this.giveReward();

        // 清除当前怪物引用
        this._currentEnemy = null;

        // 显示继续挑战面板
        if (this.ContinuePanel) {
            this.ContinuePanel.active = true;
        }
    }

    // 给予奖励
    giveReward(): void {
        // 奖励在怪物预制体中配置，这里不需要额外处理
        CDXX2_UIController.Instance.TipsPanel.show(`通过第${this._currentFloor}层！`);
    }

    // 下一层（玩家点击下一层按钮时调用）
    nextFloor(): void {
        // 层数已经在 onEnemyKilled 中+1了，这里不需要再加

        // 隐藏继续挑战面板
        if (this.ContinuePanel) {
            this.ContinuePanel.active = false;
        }

        // 更新层数显示
        this.updateFloorLabel();

        // 刷新新怪物
        this.spawnEnemy();

        // 满血恢复
        CDXX2_PlayerController.Instance.Injured = 0;
        CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_STATE_SHOW);
    }

    // 退出怪物塔
    exitTower(): void {
        // 标记退出怪物塔
        this._isInTower = false;

        // 清除当前怪物
        if (this._currentEnemy && this._currentEnemy.isValid) {
            CDXX2_PoolManager.Instance.put(this._currentEnemy);
            this._currentEnemy = null;
        }

        // 隐藏继续挑战面板
        if (this.ContinuePanel) {
            this.ContinuePanel.active = false;
        }

        // 1. 停战斗 + 清敌人
        CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_PAUSE);
        CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_ENEMY_REMOVE);
        CDXX2_EnemyManager.Instance.Clear();

        // 获取返回的地图（使用进入前保存的地图）
        const returnMap = this._previousMap || CDXX2_BG.凡界_下层;

        // 2. Loading 1 秒
        CDXX2_GameManager.Instance.ShowLoadingPanel(1, () => {
            // 3. 返回之前的地图
            CDXX2_GameData.Instance.CurMap = returnMap;
            CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_BG_SHOW, returnMap);

            // 4. 关闭战斗面板
            CDXX2_GameManager.Instance.BattlePanel.active = false;

            // 5. 延迟后恢复玩家状态
            this.scheduleOnce(() => {
                // 满血 + 刷新状态
                CDXX2_PlayerController.Instance.Injured = 0;
                CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_STATE_SHOW);
            }, 0.3);
        });
    }
}
