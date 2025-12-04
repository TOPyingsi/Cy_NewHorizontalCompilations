import { _decorator, AudioClip, Component, math, Node, PhysicsSystem, PhysicsSystem2D, Vec3 } from 'cc';
import PrefsManager from 'db://assets/Scripts/Framework/Managers/PrefsManager';
import { Bacon_Constant } from './Bacon_Constant';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import Bacon_GamePanel from './Bacon_GamePanel';
import Bacon_StartPanel from './Bacon_StartPanel';
import { Bacon_Item } from './Bacon_Item';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { PhysicsManager } from 'db://assets/Scripts/Framework/Managers/PhysicsManager';
const { ccclass, property } = _decorator;

export enum BaconAudio {
    pa = 0,
    throw = 1,
    win = 2
}

@ccclass('Bacon_Manager')
export class Bacon_Manager extends Component {
    static Instance: Bacon_Manager = null;

    @property(Node)
    canvas: Node = null;

    @property(Bacon_StartPanel)
    startPanel: Bacon_StartPanel = null;

    @property(Bacon_GamePanel)
    gamePanel: Bacon_GamePanel = null;

    @property(Bacon_Item)
    bacon: Bacon_Item = null;

    @property([AudioClip])
    audios: AudioClip[] = [];

    static checkWin: boolean = false;
    static canReleaseBacon: boolean = false;

    lvTimer: number = 0;
    throwBaconCount: number = 0;
    checkTimer: number = 0;

    public static get Bacon(): number {
        return PrefsManager.GetNumber(Bacon_Constant.Key_Bacon, 30);
    }
    public static set Bacon(value: number) {
        if (this.InfiniteTime > 0) return;
        value = Tools.Clamp(value, 0, 999);
        PrefsManager.SetNumber(Bacon_Constant.Key_Bacon, value);
        EventManager.Scene.emit(Bacon_Constant.Event_RefreshBacon);
    }

    //无限培根时间，单位秒
    public static get InfiniteTime(): number {
        return PrefsManager.GetNumber(Bacon_Constant.Key_InfiniteTime, 0);
    }
    public static set InfiniteTime(value: number) {
        value = Tools.Clamp(value, 0, Infinity);
        PrefsManager.SetNumber(Bacon_Constant.Key_InfiniteTime, value);
        if (value <= 0) {
            EventManager.Scene.emit(Bacon_Constant.Event_StopInfiniteBacon);
        }
    }

    //关卡
    public static get Lv(): number {
        return PrefsManager.GetNumber(Bacon_Constant.Key_Lv, 1);
    }
    public static set Lv(value: number) {
        if (math.random() > 0.6) {
            var result = Bacon_Constant.Pans[Tools.GetRandomInt(0, Bacon_Constant.Pans.length)];
            if (!Bacon_Manager.GetPanUnlock(result)) {
                UIManager.ShowBundlePanel(GameManager.GameData.DefaultBundle, Bacon_Constant.UI.BaconGetPanPanel, result);
            }
        }

        PrefsManager.SetNumber(Bacon_Constant.Key_Lv, value);
    }

    //需要显示的假关卡
    public static get FakeLv(): number {
        let lv = Bacon_Manager.Lv;
        if (Bacon_Manager.Lv > 20) lv = Tools.GetRandomInt(1, 21);
        return lv;
    }

    protected onLoad(): void {
        Bacon_Manager.Instance = this;

        PhysicsManager.LogGameCollisionMatrix(GameManager.GameData);
    }

    ShowStartPanel() {
        this.gamePanel.Hide();
        this.startPanel.Show();
    }

    ShowGamePanel() {
        this.ResetBacon();
        this.startPanel.Hide();
        this.gamePanel.Show();
    }

    ResetLv() {
        this.lvTimer = 0;
        this.throwBaconCount = 0;
    }

    ResetBacon() {
        Bacon_Manager.checkWin = false;
        this.gamePanel.ClearBaconColliders();
        this.bacon.node.parent = this.gamePanel.HandPos;
        this.bacon.node.setPosition(Vec3.ZERO);
        this.bacon.ResetBacon(this.gamePanel.HandPos.worldPosition);
        this.gamePanel.StartHandAni(() => {
            Bacon_Manager.canReleaseBacon = true;
        });
    }

    ReleaseBacon() {
        if (Bacon_Manager.Bacon <= 0) {
            UIManager.ShowBundlePanel(GameManager.GameData.DefaultBundle, Bacon_Constant.UI.BaconGetPanel);
            UIManager.ShowTip("培根用完了");
            return;
        }

        Bacon_Manager.canReleaseBacon = false;
        Bacon_Manager.Bacon--;
        Bacon_Manager.Instance.throwBaconCount++;
        const position = this.bacon.node.worldPosition.clone();
        this.bacon.node.parent = this.canvas;
        this.bacon.node.setWorldPosition(position);
        this.bacon.ReleasBacon();
        this.gamePanel.EndHandAni();

        this.checkTimer = 0;
        Bacon_Manager.checkWin = true;
    }

    update(deltaTime: number) {
        this.lvTimer += deltaTime;

        if (Bacon_Manager.checkWin) {
            if (this.bacon.head) {
                if (this.bacon.head.rigid.linearVelocity.length() < 0.5) {
                    this.checkTimer += deltaTime;
                    if (this.checkTimer >= 1.5) {
                        Bacon_Manager.checkWin = false
                        console.log("胜利，进入下一关");
                        Bacon_Manager.Instance.ResetBacon();
                        UIManager.ShowBundlePanel(GameManager.GameData.DefaultBundle, Bacon_Constant.UI.BaconWinPanel, [this.lvTimer, this.throwBaconCount]);
                    }
                }
            }
        }
    }

    static GetDefaultPan(): string {
        return PrefsManager.GetString(`Bacon_DefaultPan`, "锅");
    }

    static SetDefaultPan(name: string) {
        PrefsManager.SetString(`Bacon_DefaultPan`, name);
        EventManager.Scene.emit(Bacon_Constant.Event_RefreshPan);
    }

    static SetPanUnlock(name: string) {
        PrefsManager.SetBool(`Bacon_Pan_${name}`, true);
    }

    static GetPanUnlock(name: string): boolean {
        if (name == "锅") return true;
        return PrefsManager.GetBool(`Bacon_Pan_${name}`, false);
    }
}

