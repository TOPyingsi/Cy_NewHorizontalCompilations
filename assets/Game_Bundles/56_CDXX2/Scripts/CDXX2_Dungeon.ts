import { _decorator, Component, Node, Prefab, NodeEventType, EventTouch } from 'cc';
import { CDXX2_PoolManager } from './CDXX2_PoolManager';
import { CDXX2_EnemyController } from './CDXX2_EnemyController';
import { CDXX2_EventManager, CDXX2_MyEvent } from './CDXX2_EventManager';
import { CDXX2_ELIXIR_NAME, CDXX2_BG } from './CDXX2_Constant';
import { CDXX2_GameData } from './CDXX2_GameData';
import { CDXX2_UIController } from './CDXX2_UIController';
import { CDXX2_EnemyManager } from './CDXX2_EnemyManager';
import { CDXX2_GameManager } from './CDXX2_GameManager';
import CDXX2_PlayerController from './CDXX2_PlayerController';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

// 副本类型枚举
export enum CDXX2_DUNGEON_TYPE {
    倍率丹怪物,
    灵兽boss,
    兽王boss,
    仙兽boss,
}

// 副本战力要求
const DUNGEON_POWER_REQUIREMENTS: Map<CDXX2_DUNGEON_TYPE, number> = new Map([
    [CDXX2_DUNGEON_TYPE.倍率丹怪物, 5000000],        // 500万
    [CDXX2_DUNGEON_TYPE.灵兽boss, 1000000000],       // 10亿
    [CDXX2_DUNGEON_TYPE.兽王boss, 10000000000000],   // 1京
    [CDXX2_DUNGEON_TYPE.仙兽boss, 50000000000000000], // 5000京
]);

/**
 * 副本系统控制器
 * 点击副本按钮打开弹窗，选择不同类型刷不同的怪物
 * 每次刷4只，打完5秒后再刷4只，循环
 */
@ccclass('CDXX2_Dungeon')
export class CDXX2_Dungeon extends Component {

    @property(Node)
    DungeonPopup: Node = null;  // 副本弹窗节点

    @property(Node)
    BeiLvDanBtn: Node = null;   // 倍率丹怪物按钮

    @property(Node)
    LingShouBossBtn: Node = null;  // 灵兽boss按钮

    @property(Node)
    ShouWangBossBtn: Node = null;  // 兽王boss按钮

    @property(Node)
    XianShouBossBtn: Node = null;  // 仙兽boss按钮

    @property(Node)
    CloseBtn: Node = null;  // 关闭按钮

    @property(Prefab)
    BeiLvDanEnemyPrefab: Prefab = null;  // 倍率丹怪物预制体

    @property(Prefab)
    LingShouBossPrefab: Prefab = null;   // 灵兽boss预制体

    @property(Prefab)
    ShouWangBossPrefab: Prefab = null;   // 兽王boss预制体

    @property(Prefab)
    XianShouBossPrefab: Prefab = null;   // 仙兽boss预制体

    @property(Node)
    SpawnPoint1: Node = null;  // 刷新位置1

    @property(Node)
    SpawnPoint2: Node = null;  // 刷新位置2

    @property(Node)
    SpawnPoint3: Node = null;  // 刷新位置3

    @property(Node)
    SpawnPoint4: Node = null;  // 刷新位置4

    private _currentType: CDXX2_DUNGEON_TYPE = null;
    private _isRunning: boolean = false;
    private _spawnedEnemies: Node[] = [];
    private _respawnTimer: number = 0;
    private _spawnPoints: Node[] = [];

    protected onLoad(): void {
        // 点击副本按钮打开弹窗
        this.node.on(NodeEventType.TOUCH_END, this.openPopup, this);
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "吃丹修仙2");

        // 绑定按钮事件（阻止事件冒泡）
        if (this.BeiLvDanBtn) {
            this.BeiLvDanBtn.on(NodeEventType.TOUCH_END, (event: EventTouch) => {
                event.propagationStopped = true;
                this.onDungeonButtonClick(CDXX2_DUNGEON_TYPE.倍率丹怪物);
            }, this);
        }
        if (this.LingShouBossBtn) {
            this.LingShouBossBtn.on(NodeEventType.TOUCH_END, (event: EventTouch) => {
                event.propagationStopped = true;
                this.onDungeonButtonClick(CDXX2_DUNGEON_TYPE.灵兽boss);
            }, this);
        }
        if (this.ShouWangBossBtn) {
            this.ShouWangBossBtn.on(NodeEventType.TOUCH_END, (event: EventTouch) => {
                event.propagationStopped = true;
                this.onDungeonButtonClick(CDXX2_DUNGEON_TYPE.兽王boss);
            }, this);
        }
        if (this.XianShouBossBtn) {
            this.XianShouBossBtn.on(NodeEventType.TOUCH_END, (event: EventTouch) => {
                event.propagationStopped = true;
                this.onDungeonButtonClick(CDXX2_DUNGEON_TYPE.仙兽boss);
            }, this);
        }
        if (this.CloseBtn) {
            this.CloseBtn.on(NodeEventType.TOUCH_END, (event: EventTouch) => {
                event.propagationStopped = true;
                this.closePopup();
            }, this);
        }

        // 收集刷新点
        this._spawnPoints = [this.SpawnPoint1, this.SpawnPoint2, this.SpawnPoint3, this.SpawnPoint4].filter(p => p !== null);

        // 监听敌人移除事件
        CDXX2_EventManager.on(CDXX2_MyEvent.CDXX2_ENEMY_REMOVE, this.onEnemyRemoved, this);
    }

    protected onDestroy(): void {
        CDXX2_EventManager.off(CDXX2_MyEvent.CDXX2_ENEMY_REMOVE, this.onEnemyRemoved, this);
    }

    protected update(dt: number): void {
        if (!this._isRunning) return;

        // 检查是否所有怪物都被消灭
        this._spawnedEnemies = this._spawnedEnemies.filter(e => e && e.isValid && e.parent);
        
        if (this._spawnedEnemies.length === 0) {
            this._respawnTimer += dt;
            if (this._respawnTimer >= 5) {
                this._respawnTimer = 0;
                this.spawnEnemies();
            }
        }
    }

    openPopup(): void {
        if (this.DungeonPopup) {
            this.DungeonPopup.active = true;
        }
    }

    closePopup(): void {
        if (this.DungeonPopup) {
            this.DungeonPopup.active = false;
        }
    }

    // 检查战力是否满足要求
    checkPowerRequirement(type: CDXX2_DUNGEON_TYPE): boolean {
        const requiredPower = DUNGEON_POWER_REQUIREMENTS.get(type);
        const currentPower = CDXX2_GameData.Instance.ZL;
        return currentPower >= requiredPower;
    }

    // 获取战力要求提示文本
    getPowerRequirementText(type: CDXX2_DUNGEON_TYPE): string {
        const requiredPower = DUNGEON_POWER_REQUIREMENTS.get(type);
        let powerText = "";
        
        if (requiredPower >= 10000000000000) {
            // 京
            powerText = `${requiredPower / 10000000000000}京`;
        } else if (requiredPower >= 100000000) {
            // 亿
            powerText = `${requiredPower / 100000000}亿`;
        } else if (requiredPower >= 10000) {
            // 万
            powerText = `${requiredPower / 10000}万`;
        } else {
            powerText = `${requiredPower}`;
        }
        
        return `战力不足！需要${powerText}战力`;
    }

    // 副本按钮点击处理
    onDungeonButtonClick(type: CDXX2_DUNGEON_TYPE): void {
        if (!this.checkPowerRequirement(type)) {
            // 战力不足，显示提示
            const tipText = this.getPowerRequirementText(type);
            CDXX2_UIController.Instance.TipsPanel.show(tipText);
            return;
        }
        
        // 战力满足，切换到副本地图并开始副本
        this.switchToDungeonMap(type);
    }

    // 切换到副本地图
    switchToDungeonMap(type: CDXX2_DUNGEON_TYPE): void {
        // 1. 停战斗 + 清敌人
        CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_PAUSE);
        CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_ENEMY_REMOVE);
        CDXX2_EnemyManager.Instance.Clear();

        // 2. Loading 1 秒
        CDXX2_GameManager.Instance.ShowLoadingPanel(1, () => {
            // 3. 设置地图为副本
            CDXX2_GameData.Instance.CurMap = CDXX2_BG.副本;
            CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_BG_SHOW, CDXX2_BG.副本);

            // 4. 打开战斗面板
            CDXX2_GameManager.Instance.BattlePanel.active = true;

            // 5. 延迟后开始副本
            this.scheduleOnce(() => {
                // 满血 + 刷新状态
                CDXX2_PlayerController.Instance.Injured = 0;
                CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_STATE_SHOW);

                // 开始副本
                this.startDungeon(type);
            }, 0.3);
        });
    }

    startDungeon(type: CDXX2_DUNGEON_TYPE): void {
        this._currentType = type;
        this._isRunning = true;
        this._respawnTimer = 0;
        
        // 清除之前的怪物
        this.clearEnemies();
        
        // 立即刷怪
        this.spawnEnemies();
        
        // 关闭弹窗
        if (this.DungeonPopup) {
            this.DungeonPopup.active = false;
        }
    }

    stopDungeon(): void {
        this._isRunning = false;
        this._currentType = null;
        this.clearEnemies();
    }

    clearEnemies(): void {
        for (const enemy of this._spawnedEnemies) {
            if (enemy && enemy.isValid) {
                CDXX2_PoolManager.Instance.put(enemy);
            }
        }
        this._spawnedEnemies = [];
    }

    spawnEnemies(): void {
        const prefab = this.getPrefabByType(this._currentType);
        if (!prefab) {
            console.error(`副本类型 ${this._currentType} 没有配置预制体`);
            return;
        }

        if (this._spawnPoints.length === 0) {
            console.error("没有配置刷新点！请在副本地图中设置4个刷新位置节点");
            return;
        }

        // 在4个刷新点刷怪
        for (let i = 0; i < Math.min(4, this._spawnPoints.length); i++) {
            const enemy = CDXX2_PoolManager.Instance.get(prefab);
            const spawnPoint = this._spawnPoints[i];
            
            // 设置父节点为刷新点的父节点（通常是场景根节点或Enemy容器）
            if (spawnPoint.parent) {
                enemy.parent = spawnPoint.parent;
            }
            
            // 设置位置为刷新点的世界坐标
            enemy.setWorldPosition(spawnPoint.getWorldPosition());
            
            // 初始化敌人
            const controller = enemy.getComponent(CDXX2_EnemyController);
            if (controller) {
                // 根据副本类型设置掉落
                this.setEnemyDrop(controller, this._currentType);
                controller.Init();
            }
            
            this._spawnedEnemies.push(enemy);
        }
    }

    getPrefabByType(type: CDXX2_DUNGEON_TYPE): Prefab {
        switch (type) {
            case CDXX2_DUNGEON_TYPE.倍率丹怪物:
                return this.BeiLvDanEnemyPrefab;
            case CDXX2_DUNGEON_TYPE.灵兽boss:
                return this.LingShouBossPrefab;
            case CDXX2_DUNGEON_TYPE.兽王boss:
                return this.ShouWangBossPrefab;
            case CDXX2_DUNGEON_TYPE.仙兽boss:
                return this.XianShouBossPrefab;
            default:
                return null;
        }
    }

    setEnemyDrop(controller: CDXX2_EnemyController, type: CDXX2_DUNGEON_TYPE): void {
        switch (type) {
            case CDXX2_DUNGEON_TYPE.倍率丹怪物:
                controller.Elixir = CDXX2_ELIXIR_NAME.倍率丹;
                controller.ElixirNumber = 1;
                break;
            case CDXX2_DUNGEON_TYPE.灵兽boss:
                controller.Elixir = CDXX2_ELIXIR_NAME.灵兽boss属性丹;
                controller.ElixirNumber = 1;
                break;
            case CDXX2_DUNGEON_TYPE.兽王boss:
                controller.Elixir = CDXX2_ELIXIR_NAME.兽王boss属性丹;
                controller.ElixirNumber = 1;
                break;
            case CDXX2_DUNGEON_TYPE.仙兽boss:
                controller.Elixir = CDXX2_ELIXIR_NAME.仙兽boss属性丹;
                controller.ElixirNumber = 1;
                break;
        }
    }

    onEnemyRemoved(): void {
        // 敌人被移除时更新列表
        this._spawnedEnemies = this._spawnedEnemies.filter(e => e && e.isValid && e.parent);
    }
}
