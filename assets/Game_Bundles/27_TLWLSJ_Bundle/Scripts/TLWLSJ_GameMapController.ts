import { _decorator, Component, Node } from 'cc';
import { TLWLSJ_MapController } from './TLWLSJ_MapController';
import { TLWLSJ_EnemyInitController } from './TLWLSJ_EnemyInitController';
import { TLWLSJ_UIManager } from './TLWLSJ_UIManager';
import { TLWLSJ_GameManager } from './TLWLSJ_GameManager';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_GameMapController')
export class TLWLSJ_GameMapController extends TLWLSJ_MapController {

    @property(TLWLSJ_EnemyInitController)
    EnemyDatas: TLWLSJ_EnemyInitController[] = [];

    @property({ displayName: "波次之间的等待时间" })
    DelayTime: number = 20;

    private _curWave: number = 0;
    private _cb: Function = null;
    private _isFirst: boolean = true;

    protected start(): void {
        super.start();
        this.loadEnemyData();
    }

    loadEnemyData() {
        if (this.EnemyDatas.length <= 0) {
            //游戏结束
            this.detection(() => {
                TLWLSJ_UIManager.Instance.showTips("区域完全清空！");
                this.IsFinishAll = true;
            });
            return;
        }
        this.detection(() => {
            let tips: string = this._isFirst ? "游戏开始" : "区域清空！";
            this._isFirst = false;
            const isLast = this.EnemyDatas.length <= 0;
            this._curWave++;
            TLWLSJ_UIManager.Instance.showTips(tips, () => {
                TLWLSJ_UIManager.Instance.time(this.DelayTime, this._curWave, isLast, () => {
                    this.getEnemyData(this.EnemyDatas.shift());
                    this.createEnemy();
                });
            });
        })
    }

    detection(cb: Function = null) {
        this._cb = cb;
        this.schedule(this.startDetection, 1);
    }

    startDetection() {
        if (TLWLSJ_GameManager.Instance.EnemyLayout.children.length <= 0 && (this.IsFinish || this._isFirst)) {
            this._cb && this._cb();
            this.unschedule(this.startDetection);
        }
    }

    getEnemyData(data: TLWLSJ_EnemyInitController) {
        this.CurEnemyData = data;
        this.CurEnemyData.loadAllName();
        this.IsFinish = false;
    }

    createEnemy() {
        if (this.CurEnemyData.AllName.length <= 0) {
            this.IsFinish = true;
            this.loadEnemyData();
            return;
        }
        this.CreateName = this.CurEnemyData.AllName.shift();
        this.startCreateEnemy();
    }

}


