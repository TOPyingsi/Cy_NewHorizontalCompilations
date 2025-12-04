import { _decorator, Component, find, instantiate, Node, Prefab } from 'cc';
import { TLWLSJ_MapCamera } from './TLWLSJ_MapCamera';
import { TLWLSJ_GameManager } from './TLWLSJ_GameManager';
import { TLWLSJ_EnemyInitController } from './TLWLSJ_EnemyInitController';
import { TLWLSJ_PrefsManager } from './TLWLSJPrefsManager';
import { TLWLSJ_WEAPON } from './TLWLSJ_Constant';
import { TLWLSJ_TipsController } from './TLWLSJ_TipsController';
import { TLWLSJ_Tool } from './TLWLSJ_Tool';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_MapController')
export class TLWLSJ_MapController extends Component {
    public static Instance: TLWLSJ_MapController = null;

    @property(Node)
    InitPos: Node[] = [];

    @property
    MinX: number = 0;

    @property
    MaxX: number = 0;

    @property
    MinY: number = 0;

    @property
    MaxY: number = 0;

    @property
    IsMAP1: boolean = false;

    IsFinish: boolean = true;
    IsFinishAll: boolean = false;
    CurEnemyData: TLWLSJ_EnemyInitController = null;
    CreateName: string[] = [];


    protected onLoad(): void {
        TLWLSJ_MapController.Instance = this;
    }

    protected start(): void {
        TLWLSJ_MapCamera.Instance.setClamp(this.MinX, this.MaxX, this.MinY, this.MaxY);
        if (this.node.name === "MAP1" && TLWLSJ_PrefsManager.Instance.userData.HaveWeapon.findIndex(e => e == TLWLSJ_WEAPON.自动手枪) != -1) {
            find("Prop/枪", this.node).active = false;
        }

        if (this.IsMAP1 && TLWLSJ_TipsController.Instance.IsPack) {
            TLWLSJ_GameManager.Instance.PackButton.active = false;
        }
    }

    startCreateEnemy() {
        if (this.CreateName.length <= 0) {
            if (this.CurEnemyData.AllName.length <= 0) {
                this.createEnemy()
                return;
            }
            this.scheduleOnce(() => {
                this.createEnemy()
            }, this.CurEnemyData.DelayTime);
            return;
        }

        const enemyName = this.CreateName.shift();
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `${enemyName}`).then((prefab: Prefab) => {
            const enemy: Node = instantiate(prefab);
            enemy.parent = TLWLSJ_GameManager.Instance.EnemyLayout;
            enemy.setWorldPosition(this.CurEnemyData.getPos());
            this.scheduleOnce(() => { this.startCreateEnemy() }, this.CurEnemyData.getDelayTime());
        })
    }

    createEnemy() {
        if (this.CurEnemyData.AllName.length <= 0) {
            this.IsFinish = true;
            return;
        }
        this.CreateName = this.CurEnemyData.AllName.shift();
        this.startCreateEnemy();
    }

    getEnemyData(data: TLWLSJ_EnemyInitController) {
        this.CurEnemyData = data;
        this.IsFinish = false
        this.createEnemy();
    }

    getPlayerInitPos() {
        return this.InitPos[TLWLSJ_Tool.GetRandomInt(0, this.InitPos.length)].getWorldPosition();
    }
}


