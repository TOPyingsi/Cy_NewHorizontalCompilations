import { _decorator, Node, Component, EventTouch, Input, Label, resources, Sprite, SpriteFrame, tween, UITransform, v3, Vec3, UIOpacity, Tween, RichText, Button } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { XGTS_ItemData, XGTS_ItemType } from '../XGTS_Data';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { XGTS_GameManager } from '../XGTS_GameManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { XGTS_Audio, XGTS_AudioManager } from '../XGTS_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XGTS_CommonItem')
export default class XGTS_CommonItem extends Component {
    Background: Sprite | null = null;
    Icon: Sprite | null = null;
    NameLabel: Label | null = null;
    DescLabel: RichText | null = null;
    Button: Button = null;

    data: XGTS_ItemData = null;

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
            XGTS_GameManager.SetImagePreferScale(this.Icon, 100, 100);
        });

        this.Background.color = XGTS_GameManager.GetColorHexByQuality(this.data.Quality);

        if (this.data.Type == XGTS_ItemType.Ammo) {
            this.DescLabel.string = `${this.data.Count}`;
        } else if (XGTS_ItemData.IsConsumable(this.data.Type)) {
            this.DescLabel.string = `${this.data.ConsumableData.Durability}`;
        }
        else {
            this.DescLabel.string = this.data.Desc;
        }
    }

    InitDisplay(data: XGTS_ItemData) {
        this.data = data;
        this.Button.enabled = false;
        this.Icon.spriteFrame = null;

        this.Refresh();
    }

    SetDescStr(str: string) {
        this.DescLabel.string = str;
    }

    Init(data: XGTS_ItemData, callback: Function) {
        this.data = data;
        this.callback = callback;
        this.Button.enabled = true;
        this.Refresh();
    }

    OnButtonClick() {
        XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.ButtonClick);

        this.callback && this.callback(this.data);
    }
}