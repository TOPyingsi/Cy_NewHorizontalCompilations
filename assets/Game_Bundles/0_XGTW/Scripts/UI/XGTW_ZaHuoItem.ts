import { _decorator, Component, Button, Sprite, Label, Node, SpriteFrame, v3 } from 'cc';
const { ccclass, property } = _decorator;

import { XGTW_AudioManager } from '../XGTW_AudioManager';
import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import { XGTW_ItemType, XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { GameManager } from '../../../../Scripts/GameManager';
import PrefsManager from 'db://assets/Scripts/Framework/Managers/PrefsManager';
import { XGTW_ItemData } from '../Datas/XGTW_Data';

@ccclass('XGTW_ZaHuoItem')
export default class XGTW_ZaHuoItem extends Component {
    Button: Button | null = null;
    Icon: Sprite | null = null;
    Quality: Sprite | null = null;
    Price: Label | null = null;
    Name: Label | null = null;
    Bottom: Node | null = null;
    Money: Node | null = null;
    Piece: Node | null = null;
    HuiZhang: Node | null = null;

    data: XGTW_ItemData;
    cb: Function = null;

    onLoad(): void {
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.Quality = NodeUtil.GetComponent("Quality", this.node, Sprite);
        this.Price = NodeUtil.GetComponent("Price", this.node, Label);
        this.Name = NodeUtil.GetComponent("Name", this.node, Label);
        this.Bottom = NodeUtil.GetNode("Bottom", this.node);
        this.Money = NodeUtil.GetNode("Money", this.node);
        this.Piece = NodeUtil.GetNode("Piece", this.node);
        this.HuiZhang = NodeUtil.GetNode("HuiZhang", this.node);
        this.Button = this.node.getComponent(Button);
    }

    Init(data, cb: Function = null) {
        this.onLoad();

        this.data = data;
        this.cb = cb;
        this.Name.string = `${data.Name}`;

        this.Piece.active = XGTW_ItemData.GetItemType(this.data.Type) == XGTW_ItemType.碎片装扮;
        this.HuiZhang.active = this.data.Name == "能源电池";
        this.Money.active = this.data.Name == "勘察情报";

        this.Price.string = `${data.Price}`;

        if (XGTW_ItemData.GetItemType(this.data.Type) == XGTW_ItemType.碎片装扮) {
            this.Price.node.active = !PrefsManager.GetBool(`${data.Type}${data.Name}`);
            this.Piece.active = !PrefsManager.GetBool(`${data.Type}${data.Name}`);
        }

        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Quality/Quality_${data.Quality}`).then((sf: SpriteFrame) => {
            this.Quality.spriteFrame = sf;
        });

        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/${data.Type}/${data.Name.replace(/^\./, '')}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
        });
    }

    Refresh() {
        if (XGTW_ItemData.GetItemType(this.data.Type) == XGTW_ItemType.碎片装扮) {
            this.Price.node.active = !PrefsManager.GetBool(`${this.data.Type}${this.data.Name}`);
            this.Piece.active = !PrefsManager.GetBool(`${this.data.Type}${this.data.Name}`);
        }
    }

    OnButtonClick() {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);
        this.cb && this.cb(this.data);
    }
}