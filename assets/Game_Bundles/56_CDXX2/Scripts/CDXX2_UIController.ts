import { _decorator, AudioClip, AudioSource, Component, EventTouch, find, Label, Node, Sprite } from 'cc';
import { CDXX2_ItemShop } from './CDXX2_ItemShop';
import { CDXX2_TipsBuy } from './CDXX2_TipsBuy';
import { CDXX2_BuyOtherPanel } from './CDXX2_BuyOtherPanel';
import { CDXX2_BuyPanel } from './CDXX2_BuyPanel';
import { CDXX2_PICKAXE } from './CDXX2_Constant';
import { CDXX2_Tool } from './CDXX2_Tool';
import { CDXX2_GameData } from './CDXX2_GameData';
import { CDXX2_EventManager, CDXX2_MyEvent } from './CDXX2_EventManager';
import { CDXX2_Equipment } from './CDXX2_Equipment';
import CDXX2_PlayerController from './CDXX2_PlayerController';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

/*
全局 UI 总控：
统一开关各弹窗（商店/设置/购买），刷新金币、奖杯、攻击力等主界面数值；
处理静音、播放射击/受击音效；
把商店里不同镐子的点击分发到“直购”或“材料兑换”两类购买面板，并弹出对应提示。
*/

@ccclass('CDXX2_UIController')
export class CDXX2_UIController extends Component {
    public static Instance: CDXX2_UIController = null;

    @property(Node)
    ShopPanel: Node = null;

    @property(Node)
    SetPanel: Node = null;

    // @property(Node)
    // AttributesPanel: Node = null;

    // @property(Node)
    // IntegralPanel: Node = null;

    @property(CDXX2_TipsBuy)
    TipsPanel: CDXX2_TipsBuy = null;

    @property(Node)
    MusicOpen: Node = null;

    @property(Node)
    MusicClose: Node = null;

    @property(Node)
    BuyPanel: Node = null;

    @property(CDXX2_BuyOtherPanel)
    BuyOtherPanel1: CDXX2_BuyOtherPanel = null;

    @property(CDXX2_BuyOtherPanel)
    BuyOtherPanel2: CDXX2_BuyOtherPanel = null;

    @property(CDXX2_BuyOtherPanel)
    BuyOtherPanel3: CDXX2_BuyOtherPanel = null;

    @property(CDXX2_BuyOtherPanel)
    BuyOtherPanel4: CDXX2_BuyOtherPanel = null;

    @property(CDXX2_BuyOtherPanel)
    BuyOtherPanel5: CDXX2_BuyOtherPanel = null;

    @property(CDXX2_BuyOtherPanel)
    BuyOtherPanel6: CDXX2_BuyOtherPanel = null;

    @property(CDXX2_BuyOtherPanel)
    BuyOtherPanel7: CDXX2_BuyOtherPanel = null;

    @property(CDXX2_BuyOtherPanel)
    BuyOtherPanel8: CDXX2_BuyOtherPanel = null;

    @property(CDXX2_BuyOtherPanel)
    BuyOtherPanel9: CDXX2_BuyOtherPanel = null;

    @property(CDXX2_BuyOtherPanel)
    BuyOtherPanel10: CDXX2_BuyOtherPanel = null;

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

    @property(AudioClip)
    MonsterAttackSource: AudioClip = null;  // 怪物攻击音效

    @property(Node)
    LingShiNode: Node = null;  // 灵石节点

    @property(Node)
    XianShiNode: Node = null;  // 仙石节点

    @property(Label)
    BeiLvLabel: Label = null;  // 倍率Label（显示倍率丹的倍率）

    TargetPanel: Node = null;
    IsMute: boolean = false;

    private _lingShiLabel: Label = null;
    private _xianShiLabel: Label = null;

    protected onLoad(): void {
        CDXX2_UIController.Instance = this;
        this.Music.active = !CDXX2_GameData.Instance.IsMuted;

        // 获取灵石和仙石的数值Label
        if (this.LingShiNode) {
            this._lingShiLabel = find("数值", this.LingShiNode)?.getComponent(Label);
            console.log(this._lingShiLabel);
        }
        if (this.XianShiNode) {
            this._xianShiLabel = find("数值", this.XianShiNode)?.getComponent(Label);
        }
    }

    protected start(): void {
        this.scheduleOnce(() => {
            this.showGold();
            this.showCup();
            this.showHarm();
            this.showLingShi();
            this.showXianShi();
            this.showBeiLv();
            this.updateEmpirical();
        }, 0.1);
        
        // 监听货币变化事件
        CDXX2_EventManager.Scene.on(CDXX2_MyEvent.CDXX2_STATE_SHOW, this.refreshCurrency, this);
    }

    showGold() {
        this.GoldLabel.string = CDXX2_Tool.formatNumber(CDXX2_GameData.Instance.userData.金币);
    }

    showCup() {
        const cupValue = CDXX2_GameData.Instance.userData.奖杯 ?? 0;
        this.CupLabel.string = CDXX2_Tool.formatNumber(cupValue);
    }

    showHarm() {
        this.HarmLabel.string = CDXX2_PlayerController.Instance.Harm.toString();
    }

    showLingShi() {
        if (this._lingShiLabel) {
            const lingShiValue = CDXX2_GameData.Instance.userData["灵石"] ?? 0;
            console.log(lingShiValue);
            
            this._lingShiLabel.string = CDXX2_Tool.formatNumber(lingShiValue);
        }
    }

    showXianShi() {
        if (this._xianShiLabel) {
            const xianShiValue = CDXX2_GameData.Instance.userData["仙石"] ?? 0;
            this._xianShiLabel.string = CDXX2_Tool.formatNumber(xianShiValue);
        }
    }

    showBeiLv() {
        if (this.BeiLvLabel) {
            const beiLvValue = CDXX2_GameData.GetElixirMultiplier();
            this.BeiLvLabel.string = `倍率:${beiLvValue}`;
        }
    }

    // 刷新所有货币显示
    refreshCurrency() {
        this.showGold();
        this.showLingShi();
        this.showXianShi();
        this.showBeiLv();
    }

    /**更新 显示经验值的变化 */
    updateEmpirical() {
        let needEmp = CDXX2_GameData.Instance.userData.等级 * 10;
        while (CDXX2_GameData.Instance.userData.经验 >= needEmp) {
            CDXX2_GameData.Instance.userData.经验 -= needEmp;
            CDXX2_GameData.Instance.userData.等级++;
            needEmp = CDXX2_GameData.Instance.userData.等级 * 10;
            // CDXX2_Equipment.Instance.updateGrade();
        }
        // this.EmpiricalSprite.fillRange = CDXX2_GameData.Instance.userData.经验 / needEmp;
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
                CDXX2_PlayerController.Instance.IsAuto = true;
                CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_ATTACK_START);
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
        CDXX2_GameData.Instance.IsMuted = !CDXX2_GameData.Instance.IsMuted;
        this.MusicOpen.active = !CDXX2_GameData.Instance.IsMuted;
        this.MusicClose.active = CDXX2_GameData.Instance.IsMuted;
        this.Music.active = !CDXX2_GameData.Instance.IsMuted;
    }

    PlayFire() {
        if (CDXX2_GameData.Instance.IsMuted) return;
        this.FireSource.play();
    }

    PlayHit() {
        if (CDXX2_GameData.Instance.IsMuted) return;
        this.HitSource.play();
    }

    PlayMonsterAttack() {
        if (CDXX2_GameData.Instance.IsMuted) return;
        if (this.MonsterAttackSource) {
            this.MonsterAttackSource.play();
        }
    }

    ShopItemClick(event: EventTouch) {
        const itemTs: CDXX2_ItemShop = event.currentTarget.getComponent(CDXX2_ItemShop);
        switch (itemTs.Type) {
            case CDXX2_PICKAXE.宝品剑:
                this.BuyOtherPanel1.show();
                break;
            case CDXX2_PICKAXE.暗虚剑:
                this.BuyOtherPanel2.show();
                break;
            default:
                // 其他刀使用默认购买面板
                this.BuyPanel.getComponent(CDXX2_BuyPanel).show(itemTs.Type);
                break;
        }
    }
}


