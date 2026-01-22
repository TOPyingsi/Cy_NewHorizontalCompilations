import { _decorator, Component, Node, Prefab, sp } from 'cc';
import { CDXX2_GameData } from './CDXX2_GameData';
import CDXX2_PlayerController from './CDXX2_PlayerController';
import { CDXX2_PoolManager } from './CDXX2_PoolManager';
import { CDXX2_EnemyManager } from './CDXX2_EnemyManager';
import { CDXX2_EventManager, CDXX2_MyEvent } from './CDXX2_EventManager';
const { ccclass, property } = _decorator;


//“战斗面板”根据当前关卡号激活对应地图和出生点动画骨架，利用骨架动画循环回调源源不断地在指定坐标刷怪，并响应全局暂停/继续事件。
@ccclass('CDXX2_BattlePanel')
export class CDXX2_BattlePanel extends Component {

    @property(Node)
    Maps: Node[] = [];

    @property(sp.Skeleton)
    CSZs: sp.Skeleton[] = [];

    CurCSZ: sp.Skeleton = null;
    private _curIndex: number = 0;
    // private _curEnemyIndex: number = 0;
    protected onEnable(): void {
        this.Show();
        CDXX2_EventManager.on(CDXX2_MyEvent.CDXX2_PAUSE, this.Pause, this);
        CDXX2_EventManager.on(CDXX2_MyEvent.CDXX2_RESUME, this.Resume, this);
    }

    protected onDisable(): void {
        CDXX2_EventManager.off(CDXX2_MyEvent.CDXX2_PAUSE, this.Pause, this);
        CDXX2_EventManager.off(CDXX2_MyEvent.CDXX2_RESUME, this.Resume, this);
    }

    Show() {
        this._curIndex = Math.floor(CDXX2_GameData.Instance.CurMap / 2);
        this.CurCSZ = this.CSZs[this._curIndex];
        // this._curEnemyIndex = CDXX2_GameData.Instance.CurMap * 5 + CDXX2_GameData.Instance.CurEnemy;
        for (let i = 0; i < this.Maps.length; i++) {
            this.Maps[i].active = i == this._curIndex;
        }

        CDXX2_PlayerController.Instance.InitPos(this.Maps[this._curIndex].getChildByName("PlayPoint").worldPosition.clone());

        this.StartCreateEnemy();
        this.Resume();
    }

    StartCreateEnemy() {
        this.CurCSZ.setAnimation(0, "animation", true);
        if (this.CurCSZ.timeScale != 0) this.CreateEnemy();
        this.CurCSZ.setCompleteListener(() => {
            if (this.CurCSZ.timeScale != 0) this.CreateEnemy();
        });
    }

    CreateEnemy() {
        CDXX2_EnemyManager.Instance.CreateEnemy(CDXX2_GameData.Instance.CurEnemy, this.CurCSZ.node.worldPosition.clone())
    }

    Pause() {
        this.CurCSZ.timeScale = 0;
    }

    Resume() {
        this.CurCSZ.timeScale = 0.5;
    }

}


