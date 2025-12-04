import { _decorator, Component, EventTouch, Label, Node, Sprite } from 'cc';
import { SJNDGZ_ItemShop } from './SJNDGZ_ItemShop';
import { SJNDGZ_TipsBuy } from './SJNDGZ_TipsBuy';
import { SJNDGZ_BuyOtherPanel } from './SJNDGZ_BuyOtherPanel';
import { SJNDGZ_BuyPanel } from './SJNDGZ_BuyPanel';
import { SJNDGZ_PICKAXE } from './SJNDGZ_Constant';
import { SJNDGZ_Tool } from './SJNDGZ_Tool';
import { SJNDGZ_GameData } from './SJNDGZ_GameData';
import { SJNDGZ_EventManager, SJNDGZ_MyEvent } from './SJNDGZ_EventManager';
import { SJNDGZ_Equipment } from './SJNDGZ_Equipment';
import SJNDGZ_PlayerController from './SJNDGZ_PlayerController';
const { ccclass, property } = _decorator;

@ccclass('SJNDGZ_UIController')
export class SJNDGZ_UIController extends Component {
    public static Instance: SJNDGZ_UIController = null;

    @property(Node)
    ShopPanel: Node = null;

    @property(Node)
    SetPanel: Node = null;

    @property(Node)
    AttributesPanel: Node = null;

    @property(Node)
    IntegralPanel: Node = null;

    @property(SJNDGZ_TipsBuy)
    TipsPanel: SJNDGZ_TipsBuy = null;

    @property(Node)
    MusicOpen: Node = null;

    @property(Node)
    MusicClose: Node = null;

    @property(Node)
    BuyPanel: Node = null;

    // @property(SJNDGZ_BuyOtherPanel)
    // BuyOtherPanel1: SJNDGZ_BuyOtherPanel = null;

    // @property(SJNDGZ_BuyOtherPanel)
    // BuyOtherPanel2: SJNDGZ_BuyOtherPanel = null;

    // @property(SJNDGZ_BuyOtherPanel)
    // BuyOtherPanel3: SJNDGZ_BuyOtherPanel = null;

    // @property(SJNDGZ_BuyOtherPanel)
    // BuyOtherPanel4: SJNDGZ_BuyOtherPanel = null;

    // @property(SJNDGZ_BuyOtherPanel)
    // BuyOtherPanel5: SJNDGZ_BuyOtherPanel = null;

    // @property(SJNDGZ_BuyOtherPanel)
    // BuyOtherPanel6: SJNDGZ_BuyOtherPanel = null;

    // @property(SJNDGZ_BuyOtherPanel)
    // BuyOtherPanel7: SJNDGZ_BuyOtherPanel = null;

    // @property(SJNDGZ_BuyOtherPanel)
    // BuyOtherPanel8: SJNDGZ_BuyOtherPanel = null;

    // @property(SJNDGZ_BuyOtherPanel)
    // BuyOtherPanel9: SJNDGZ_BuyOtherPanel = null;

    // @property(SJNDGZ_BuyOtherPanel)
    // BuyOtherPanel10: SJNDGZ_BuyOtherPanel = null;

    @property(Label)
    GoldLabel: Label = null;

    @property(Label)
    CupLabel: Label = null;

    @property(Label)
    HarmLabel: Label = null;

    @property(Sprite)
    EmpiricalSprite: Sprite = null

    @property(Node)
    Music: Node = null;

    @property(Label)
    AutoLabel: Label = null;

    TargetPanel: Node = null;
    IsMute: boolean = false;
    IsAuto: boolean = false;

    protected onLoad(): void {
        SJNDGZ_UIController.Instance = this;

        SJNDGZ_EventManager.on(SJNDGZ_MyEvent.SJNDGZ_ATTACK_END, this.AttackEnd, this);
    }

    protected start(): void {
        this.scheduleOnce(() => {
            this.showGold();
            this.showCup();
            this.showHarm();
            this.updateEmpirical();
        }, 0.1);
    }

    protected onDisable(): void {
        SJNDGZ_EventManager.off(SJNDGZ_MyEvent.SJNDGZ_ATTACK_END, this.AttackEnd, this);
    }

    showGold() {
        this.GoldLabel.string = SJNDGZ_Tool.formatNumber(SJNDGZ_GameData.Instance.userData.金币);
    }

    showCup() {
        this.CupLabel.string = SJNDGZ_Tool.formatNumber(SJNDGZ_GameData.Instance.userData.奖杯);
    }

    showHarm() {
        this.HarmLabel.string = SJNDGZ_PlayerController.Instance.Harm.toString();
    }

    /**更新 显示经验值的变化 */
    updateEmpirical() {
        let needEmp = SJNDGZ_GameData.Instance.userData.等级 * 10;
        while (SJNDGZ_GameData.Instance.userData.经验 >= needEmp) {
            SJNDGZ_GameData.Instance.userData.经验 -= needEmp;
            SJNDGZ_GameData.Instance.userData.等级++;
            needEmp = SJNDGZ_GameData.Instance.userData.等级 * 10;
            SJNDGZ_Equipment.Instance.updateGrade();
        }
        this.EmpiricalSprite.fillRange = SJNDGZ_GameData.Instance.userData.经验 / needEmp;
    }


    ButtonClick(event: EventTouch) {
        const ButtonName = event.currentTarget.name;

        switch (ButtonName) {
            case "商店":
                this.TargetPanel = this.ShopPanel;
                break;
            case "设置":
                this.TargetPanel = this.SetPanel;
                break;
            case "自动":
                this.IsAuto = !this.IsAuto;
                this.AutoAttack();
                break;
            case "信息":
                break;
            case "属性":
                this.TargetPanel = this.AttributesPanel;
                break;
            case "积分":
                this.TargetPanel = this.IntegralPanel;
                break;
        }

        if (this.TargetPanel) this.TargetPanel.active = true;
    }

    AutoAttack() {
        if (this.IsAuto) {
            this.AutoLabel.string = "OFF";
            SJNDGZ_EventManager.Scene.emit(SJNDGZ_MyEvent.SJNDGZ_ATTACK_START);
        } else {
            this.AutoLabel.string = "Auto";
            SJNDGZ_EventManager.Scene.emit(SJNDGZ_MyEvent.SJNDGZ_ATTACK_END);
        }
    }

    AttackEnd() {
        if (!this.IsAuto) return;
        this.IsAuto = false;
        this.AutoLabel.string = "Auto";
    }

    HidePanel() {
        if (this.TargetPanel) {
            this.TargetPanel.active = false;
            this.TargetPanel = null;
        }
    }

    MusicButton() {
        this.IsMute = !this.IsMute;
        this.MusicOpen.active = !this.IsMute;
        this.MusicClose.active = this.IsMute;
        this.Music.active = !this.IsMute;
    }

    ShopItemClick(event: EventTouch) {
        const itemTs: SJNDGZ_ItemShop = event.currentTarget.getComponent(SJNDGZ_ItemShop);
        this.BuyPanel.getComponent(SJNDGZ_BuyPanel).show(itemTs.Type);
        // switch (itemTs.Type) {
        // case SJNDGZ_PICKAXE.紫水晶镐:
        //     this.BuyOtherPanel1.show();
        //     break;
        // case SJNDGZ_PICKAXE.红曜石镐:
        //     this.BuyOtherPanel2.show();
        //     break;
        // case SJNDGZ_PICKAXE.蓝曜石镐:
        //     this.BuyOtherPanel3.show();
        //     break;
        // case SJNDGZ_PICKAXE.红蓝镐:
        //     this.BuyOtherPanel4.show();
        //     break;
        // case SJNDGZ_PICKAXE.只因岩镐:
        //     this.BuyOtherPanel5.show();
        //     break;
        // case SJNDGZ_PICKAXE.创游土镐:
        //     this.BuyOtherPanel6.show();
        //     break;
        // case SJNDGZ_PICKAXE.创游草镐:
        //     this.BuyOtherPanel7.show();
        //     break;
        // case SJNDGZ_PICKAXE.水立方镐:
        //     this.BuyOtherPanel8.show();
        //     break;
        // case SJNDGZ_PICKAXE.火焰之镐:
        //     this.BuyOtherPanel9.show();
        //     break;
        // case SJNDGZ_PICKAXE.创游金镐:
        //     this.BuyOtherPanel10.show();
        //     break;
        // default:
        //     this.BuyPanel.getComponent(SJNDGZ_BuyPanel).show(itemTs.Type);
        //     break;
        // }
    }
}


