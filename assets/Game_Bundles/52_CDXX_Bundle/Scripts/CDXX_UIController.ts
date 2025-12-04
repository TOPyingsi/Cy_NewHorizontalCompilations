import { _decorator, AudioSource, Component, EventTouch, Label, Node, Sprite } from 'cc';
import { CDXX_ItemShop } from './CDXX_ItemShop';
import { CDXX_TipsBuy } from './CDXX_TipsBuy';
import { CDXX_BuyOtherPanel } from './CDXX_BuyOtherPanel';
import { CDXX_BuyPanel } from './CDXX_BuyPanel';
import { CDXX_PICKAXE } from './CDXX_Constant';
import { CDXX_Tool } from './CDXX_Tool';
import { CDXX_GameData } from './CDXX_GameData';
import { CDXX_EventManager, CDXX_MyEvent } from './CDXX_EventManager';
import { CDXX_Equipment } from './CDXX_Equipment';
import CDXX_PlayerController from './CDXX_PlayerController';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('CDXX_UIController')
export class CDXX_UIController extends Component {
    public static Instance: CDXX_UIController = null;

    @property(Node)
    ShopPanel: Node = null;

    @property(Node)
    SetPanel: Node = null;

    // @property(Node)
    // AttributesPanel: Node = null;

    // @property(Node)
    // IntegralPanel: Node = null;

    @property(CDXX_TipsBuy)
    TipsPanel: CDXX_TipsBuy = null;

    @property(Node)
    MusicOpen: Node = null;

    @property(Node)
    MusicClose: Node = null;

    @property(Node)
    BuyPanel: Node = null;

    @property(CDXX_BuyOtherPanel)
    BuyOtherPanel1: CDXX_BuyOtherPanel = null;

    @property(CDXX_BuyOtherPanel)
    BuyOtherPanel2: CDXX_BuyOtherPanel = null;

    @property(CDXX_BuyOtherPanel)
    BuyOtherPanel3: CDXX_BuyOtherPanel = null;

    @property(CDXX_BuyOtherPanel)
    BuyOtherPanel4: CDXX_BuyOtherPanel = null;

    @property(CDXX_BuyOtherPanel)
    BuyOtherPanel5: CDXX_BuyOtherPanel = null;

    @property(CDXX_BuyOtherPanel)
    BuyOtherPanel6: CDXX_BuyOtherPanel = null;

    @property(CDXX_BuyOtherPanel)
    BuyOtherPanel7: CDXX_BuyOtherPanel = null;

    @property(CDXX_BuyOtherPanel)
    BuyOtherPanel8: CDXX_BuyOtherPanel = null;

    @property(CDXX_BuyOtherPanel)
    BuyOtherPanel9: CDXX_BuyOtherPanel = null;

    @property(CDXX_BuyOtherPanel)
    BuyOtherPanel10: CDXX_BuyOtherPanel = null;

    @property(Label)
    GoldLabel: Label = null;

    @property(Label)
    CupLabel: Label = null;

    @property(Label)
    HarmLabel: Label = null;

    // @property(Sprite)
    // EmpiricalSprite: Sprite = null

    @property(Node)
    Music: Node = null;

    @property(AudioSource)
    FireSource: AudioSource = null;

    @property(AudioSource)
    HitSource: AudioSource = null;

    TargetPanel: Node = null;
    IsMute: boolean = false;

    protected onLoad(): void {
        CDXX_UIController.Instance = this;
        this.Music.active = !CDXX_GameData.Instance.IsMuted;
    }

    protected start(): void {
        this.scheduleOnce(() => {
            this.showGold();
            this.showCup();
            this.showHarm();
            this.updateEmpirical();
        }, 0.1);
    }

    showGold() {
        this.GoldLabel.string = CDXX_Tool.formatNumber(CDXX_GameData.Instance.userData.金币);
    }

    showCup() {
        this.CupLabel.string = CDXX_Tool.formatNumber(CDXX_GameData.Instance.userData.奖杯);
    }

    showHarm() {
        this.HarmLabel.string = CDXX_PlayerController.Instance.Harm.toString();
    }

    /**更新 显示经验值的变化 */
    updateEmpirical() {
        let needEmp = CDXX_GameData.Instance.userData.等级 * 10;
        while (CDXX_GameData.Instance.userData.经验 >= needEmp) {
            CDXX_GameData.Instance.userData.经验 -= needEmp;
            CDXX_GameData.Instance.userData.等级++;
            needEmp = CDXX_GameData.Instance.userData.等级 * 10;
            // CDXX_Equipment.Instance.updateGrade();
        }
        // this.EmpiricalSprite.fillRange = CDXX_GameData.Instance.userData.经验 / needEmp;
    }


    ButtonClick(event: EventTouch) {
        const ButtonName = event.currentTarget.name;

        switch (ButtonName) {
            case "商店":
                ProjectEventManager.emit(ProjectEvent.弹出窗口, "升级你的镐子");
                this.TargetPanel = this.ShopPanel;
                break;
            case "设置":
                ProjectEventManager.emit(ProjectEvent.弹出窗口, "升级你的镐子");
                this.TargetPanel = this.SetPanel;
                break;
            case "自动":
                CDXX_PlayerController.Instance.IsAuto = true;
                CDXX_EventManager.Scene.emit(CDXX_MyEvent.CDXX_ATTACK_START);
                break;
            case "信息":
                break;
            // case "属性":
            //     ProjectEventManager.emit(ProjectEvent.弹出窗口, "升级你的镐子");
            //     this.TargetPanel = this.AttributesPanel;
            //     break;
            // case "积分":
            //     ProjectEventManager.emit(ProjectEvent.弹出窗口, "升级你的镐子");
            //     this.TargetPanel = this.IntegralPanel;
            //     break;
        }

        if (this.TargetPanel) this.TargetPanel.active = true;
    }

    HidePanel() {
        if (this.TargetPanel) {
            this.TargetPanel.active = false;
            this.TargetPanel = null;
        }
    }

    MusicButton() {
        CDXX_GameData.Instance.IsMuted = !CDXX_GameData.Instance.IsMuted;
        this.MusicOpen.active = !CDXX_GameData.Instance.IsMuted;
        this.MusicClose.active = CDXX_GameData.Instance.IsMuted;
        this.Music.active = !CDXX_GameData.Instance.IsMuted;
    }

    PlayFire() {
        if (CDXX_GameData.Instance.IsMuted) return;
        this.FireSource.play();
    }

    PlayHit() {
        if (CDXX_GameData.Instance.IsMuted) return;
        this.HitSource.play();
    }

    ShopItemClick(event: EventTouch) {
        const itemTs: CDXX_ItemShop = event.currentTarget.getComponent(CDXX_ItemShop);
        switch (itemTs.Type) {
            case CDXX_PICKAXE.紫电狂魔:
                this.BuyOtherPanel1.show();
                break;
            case CDXX_PICKAXE.金芒战矛:
                this.BuyOtherPanel2.show();
                break;
            case CDXX_PICKAXE.红缨怒号:
                this.BuyOtherPanel3.show();
                break;
            case CDXX_PICKAXE.圣金猎隼:
                this.BuyOtherPanel4.show();
                break;
            case CDXX_PICKAXE.丛林魅影:
                this.BuyOtherPanel5.show();
                break;
            case CDXX_PICKAXE.冰蓝海啸:
                this.BuyOtherPanel6.show();
                break;
            case CDXX_PICKAXE.猩红猎手:
                this.BuyOtherPanel7.show();
                break;
            case CDXX_PICKAXE.赤炼火炮:
                this.BuyOtherPanel8.show();
                break;
            case CDXX_PICKAXE.幻晶毒牙:
                this.BuyOtherPanel9.show();
                break;
            case CDXX_PICKAXE.星陨狂徒:
                this.BuyOtherPanel10.show();
                break;
            default:
                this.BuyPanel.getComponent(CDXX_BuyPanel).show(itemTs.Type);
                break;
        }
    }
}


