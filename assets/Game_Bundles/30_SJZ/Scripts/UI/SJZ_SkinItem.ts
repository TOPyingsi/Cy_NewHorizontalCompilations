import { _decorator, Node, Component, EventTouch, Input, Label, resources, Sprite, SpriteFrame, tween, UITransform, v3, Vec3, UIOpacity, Tween, RichText, Button } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { SJZ_GameManager } from '../SJZ_GameManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { SJZ_DataManager } from '../SJZ_DataManager';
import { SJZ_Audio, SJZ_AudioManager } from '../SJZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZ_SkinItem')
export default class SJZ_SkinItem extends Component {
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
            SJZ_GameManager.SetImagePreferScale(this.Icon, 370, 150);
        });

        this.LockIcon.active = !SJZ_DataManager.GetGunSkinUnlock(skinName);
    }

    SetSelect(skinName: string) {
        this.Selected.active = skinName == this.skinName;
    }

    OnButtonClick() {
        SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.ButtonClick);

        if (!SJZ_DataManager.GetGunSkinUnlock(this.skinName)) return;
        this.callback && this.callback(this.skinName);
    }
}