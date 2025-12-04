import { _decorator, Node, Component, EventTouch, Input, Label, resources, Sprite, SpriteFrame, tween, UITransform, v3, Vec3, UIOpacity, Tween, RichText, Button } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { SJZ_ItemData, SJZ_ItemType } from '../SJZ_Data';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { SJZ_GameManager } from '../SJZ_GameManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { SJZ_Audio, SJZ_AudioManager } from '../SJZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZ_CommonItem')
export default class SJZ_CommonItem extends Component {
    Background: Sprite | null = null;
    Icon: Sprite | null = null;
    NameLabel: Label | null = null;
    DescLabel: RichText | null = null;
    Button: Button = null;

    data: SJZ_ItemData = null;

    callback: Function = null;


    onLoad() {
        this.NameLabel = NodeUtil.GetComponent("NameLabel", this.node, Label);
        this.Background = NodeUtil.GetComponent("Background", this.node, Sprite);
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.DescLabel = NodeUtil.GetComponent("DescLabel", this.node, RichText);

        this.Button = this.node.getComponent(Button);
    }

    Refresh() {
        this.NameLabel.string = this.data.Name;

        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Items/${this.data.ImageId}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
            SJZ_GameManager.SetImagePreferScale(this.Icon, 100, 100);
        });

        this.Background.color = SJZ_GameManager.GetColorHexByQuality(this.data.Quality);

        if (this.data.Type == SJZ_ItemType.Ammo) {
            this.DescLabel.string = `${this.data.Count}`;
        } else if (SJZ_ItemData.IsConsumable(this.data.Type)) {
            this.DescLabel.string = `${this.data.ConsumableData.Durability}`;
        }
        else {
            this.DescLabel.string = this.data.Desc;
        }
    }

    InitDisplay(data: SJZ_ItemData) {
        this.data = data;
        this.Button.enabled = false;
        this.Icon.spriteFrame = null;

        this.Refresh();
    }

    SetDescStr(str: string) {
        this.DescLabel.string = str;
    }

    Init(data: SJZ_ItemData, callback: Function) {
        this.data = data;
        this.callback = callback;
        this.Button.enabled = true;
        this.Refresh();
    }

    OnButtonClick() {
        SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.ButtonClick);

        this.callback && this.callback(this.data);
    }
}