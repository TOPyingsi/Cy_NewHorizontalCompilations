import { _decorator, Node, Event, tween, v3, Tween, Label, Sprite, SpriteFrame, Vec3, input, Input, EventTouch, ConfigurableConstraint, Vec2, v2, BoxCollider2D, Contact2DType, Collider2D, IPhysics2DContact } from 'cc';
import { AudioManager, Audios } from 'db://assets/Scripts/Framework/Managers/AudioManager';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { Bacon_Constant } from './Bacon_Constant';
import Banner from 'db://assets/Scripts/Banner';
import { Bacon_Manager } from './Bacon_Manager';
import { Bacon_Joint } from './Bacon_Joint';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

const { ccclass, property } = _decorator;

@ccclass('Bacon_GamePanel')
export default class Bacon_GamePanel extends PanelBase {
    Pan: Node = null;
    PanSp: Sprite = null;
    PanCollider: BoxCollider2D = null;
    HandPos: Node = null;
    Lvs: Node = null;
    LvLabel: Label = null;
    ForcePoint: Node = null;
    Hand: Node = null;
    HandThum: Node = null;

    force: number = 0.1;

    protected onLoad(): void {
        this.Pan = NodeUtil.GetNode("Pan", this.node);
        this.HandPos = NodeUtil.GetNode("HandPos", this.node);
        this.Hand = NodeUtil.GetNode("Hand", this.node);
        this.HandThum = NodeUtil.GetNode("HandThum", this.node);
        this.Lvs = NodeUtil.GetNode("Lvs", this.node);
        this.LvLabel = NodeUtil.GetComponent("LvLabel", this.node, Label);
        this.PanCollider = NodeUtil.GetComponent("PanSp", this.node, BoxCollider2D);
        this.PanSp = NodeUtil.GetComponent("PanSp", this.node, Sprite);
        this.ForcePoint = NodeUtil.GetNode("ForcePoint", this.node);

        // 监听触摸事件
        this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        this.PanCollider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.PanCollider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    protected start(): void {
        this.RefreshPan();
    }

    Show() {
        this.node.active = true;
        Bacon_Manager.Instance.ResetBacon();
        Bacon_Manager.Instance.ResetLv();

        this.LvLabel.string = `第 ${Bacon_Manager.Lv} 关`;

        let lv = Bacon_Manager.FakeLv;

        for (let i = 0; i < this.Lvs.children.length; i++) {
            const e = this.Lvs.children[i];
            e.active = e.name == `${lv}`;
        }

        this.StartHandAni(() => {
            Bacon_Manager.canReleaseBacon = true;
        });

        this.RefreshPan();
    }

    StartHandAni(endCb: Function) {
        Tween.stopAllByTarget(this.Hand);
        Tween.stopAllByTarget(this.HandThum);
        tween(this.Hand).to(0.2, { position: v3(650, 250, 0) }).call(() => {
            tween(this.HandThum).to(0.1, { eulerAngles: v3(0, 0, -10) }).call(() => {
                endCb && endCb();
            }).start();
        }).start();
    }

    EndHandAni() {
        Tween.stopAllByTarget(this.Hand);
        Tween.stopAllByTarget(this.HandThum);
        tween(this.HandThum).to(0.1, { eulerAngles: v3(0, 0, 0) }).start();
        tween(this.Hand).to(0.2, { position: v3(170, 250, 0) }).start();
    }

    onTouchStart(event: EventTouch) {
        Banner.Instance.VibrateShort();
        if (Bacon_Manager.canReleaseBacon) {
            Bacon_Manager.Instance.ReleaseBacon();
        } else {
            Tween.stopAllByTarget(this.Pan);
            tween(this.Pan).to(0.2, { eulerAngles: v3(0, 0, 15) }).start();
            let applyForce = this.baconJoints.length > 0;
            if (applyForce) Bacon_Manager.Instance.bacon.AddForce(this.ForcePoint);
        }
    }

    onTouchEnd(event: EventTouch) {
        Tween.stopAllByTarget(this.Pan);
        tween(this.Pan).to(0.1, { eulerAngles: v3(0, 0, -15) }).start();
    }

    baconJoints: Bacon_Joint[] = [];

    ClearBaconColliders() {
        this.baconJoints = [];
    }

    RefreshPan() {
        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Sprites/Skins/Pan_${Bacon_Manager.GetDefaultPan()}`).then((sf: SpriteFrame) => {
            this.PanSp.spriteFrame = sf;
        });
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
        if (otherCollider.node.name == "BaconJoint") {
            let baconJoint = otherCollider.node.getComponent(Bacon_Joint);
            if (baconJoint) this.baconJoints.push(baconJoint);
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体结束接触时被调用一次
        if (otherCollider.node.name == "BaconJoint") {
            let baconJoint = otherCollider.node.getComponent(Bacon_Joint);
            if (baconJoint) this.baconJoints = this.baconJoints.filter((e) => e !== baconJoint);
        }
    }

    OnButtonClick(event: Event) {
        AudioManager.Instance.PlayCommonSFX(Audios.ButtonClick);

        switch (event.target.name) {
            case "FreeGetButton":
                UIManager.ShowBundlePanel(GameManager.GameData.DefaultBundle, Bacon_Constant.UI.BaconShopPanel);
                break;
            case "InfiniteButton":
                UIManager.ShowBundlePanel(GameManager.GameData.DefaultBundle, Bacon_Constant.UI.BaconGetPanel);
                break;
            case "NextLvButton":
                Banner.Instance.ShowVideoAd(() => {
                    Bacon_Manager.Lv++;
                    Bacon_Manager.Instance.gamePanel.Show();
                });
                break;
            case "PauseButton":
                UIManager.ShowBundlePanel(GameManager.GameData.DefaultBundle, Bacon_Constant.UI.BaconPausePanel);
                break;
        }
    }

    onDestroy() {
        // 移除触摸事件监听
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    protected onEnable(): void {
        EventManager.on(Bacon_Constant.Event_RefreshPan, this.RefreshPan, this);
    }

    protected onDisable(): void {
        EventManager.off(Bacon_Constant.Event_RefreshPan, this.RefreshPan, this);
    }
}
