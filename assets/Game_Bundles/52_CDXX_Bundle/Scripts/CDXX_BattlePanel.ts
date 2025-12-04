import { _decorator, Component, Node, Prefab, sp } from 'cc';
import { CDXX_GameData } from './CDXX_GameData';
import CDXX_PlayerController from './CDXX_PlayerController';
import { CDXX_PoolManager } from './CDXX_PoolManager';
import { CDXX_EnemyManager } from './CDXX_EnemyManager';
import { CDXX_EventManager, CDXX_MyEvent } from './CDXX_EventManager';
const { ccclass, property } = _decorator;

@ccclass('CDXX_BattlePanel')
export class CDXX_BattlePanel extends Component {

    @property(Node)
    Maps: Node[] = [];

    @property(sp.Skeleton)
    CSZs: sp.Skeleton[] = [];

    CurCSZ: sp.Skeleton = null;
    private _curIndex: number = 0;
    private _curEnemyIndex: number = 0;
    protected onEnable(): void {
        this.Show();
        CDXX_EventManager.on(CDXX_MyEvent.CDXX_PAUSE, this.Pause, this);
        CDXX_EventManager.on(CDXX_MyEvent.CDXX_RESUME, this.Resume, this);
    }

    protected onDisable(): void {
        CDXX_EventManager.off(CDXX_MyEvent.CDXX_PAUSE, this.Pause, this);
        CDXX_EventManager.off(CDXX_MyEvent.CDXX_RESUME, this.Resume, this);
    }

    Show() {
        this._curIndex = Math.floor(CDXX_GameData.Instance.CurMap / 2);
        this.CurCSZ = this.CSZs[this._curIndex];
        this._curEnemyIndex = this._curIndex * 5 + CDXX_GameData.Instance.CurEnemy;
        for (let i = 0; i < this.Maps.length; i++) {
            this.Maps[i].active = i == this._curIndex;
        }

        CDXX_PlayerController.Instance.InitPos(this.Maps[this._curIndex].getChildByName("PlayPoint").worldPosition.clone());

        this.StartCreateEnemy();
        this.Resume();
    }

    StartCreateEnemy() {
        this.CurCSZ.setAnimation(0, "animation", true);
        if(this.CurCSZ.timeScale != 0)  this.CreateEnemy();
        this.CurCSZ.setCompleteListener(() => {
          if(this.CurCSZ.timeScale != 0)  this.CreateEnemy();
        });
    }

    CreateEnemy() {
        CDXX_EnemyManager.Instance.CreateEnemy(this._curEnemyIndex, this.CurCSZ.node.worldPosition.clone())
    }

    Pause() {
        this.CurCSZ.timeScale = 0;
    }

    Resume() {
        this.CurCSZ.timeScale = 0.5;
    }

}


