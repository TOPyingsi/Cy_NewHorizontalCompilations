import { _decorator, Node, Component, EventTouch, Input, Label, resources, Sprite, SpriteFrame, tween, UITransform, v3, Vec3, UIOpacity, Tween, RichText, Button } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { XGTS_GameManager } from '../XGTS_GameManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { XGTS_DataManager } from '../XGTS_DataManager';
import { XGTS_Audio, XGTS_AudioManager } from '../XGTS_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XGTS_SkinItem')
export default class XGTS_SkinItem extends Component {
    Icon: Sprite | null = null;
    NameLabel: Label | null = null;
    LockIcon: Node = null;
    Selected: Node = null;

    skinName: string = null;

    callback: Function = null;

    onLoad() {
        this.NameLabel = NodeUtil.GetComponent("NameLabel", this.node, Label);
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.LockIcon = NodeUtil.GetNode("LockIcon", this.node);
        this.Selected = NodeUtil.GetNode("Selected", this.node);
    }

    Init(skinName: string, callback: Function) {
        this.skinName = skinName;
        this.callback = callback;

        this.Selected.active = false;
        this.NameLabel.string = `${skinName}`;

        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Items/${skinName}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
            XGTS_GameManager.SetImagePreferScale(this.Icon, 370, 150);
        });

        this.LockIcon.active = !XGTS_DataManager.GetGunSkinUnlock(skinName);
    }

    SetSelect(skinName: string) {
        this.Selected.active = skinName == this.skinName;
    }

    OnButtonClick() {
        XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.ButtonClick);

        if (!XGTS_DataManager.GetGunSkinUnlock(this.skinName)) return;
        this.callback && this.callback(this.skinName);
    }
}