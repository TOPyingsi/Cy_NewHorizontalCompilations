import { _decorator, Component, Sprite, Label, Node, SpriteFrame, Color } from 'cc';
const { ccclass, property } = _decorator;

import { XGTW_AudioManager } from '../XGTW_AudioManager';
import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { XGTW_ColorHex, XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import { XGTW_UIManager } from '../Framework/Managers/XGTW_UIManager';
import { GameManager } from '../../../../Scripts/GameManager';
import { XGTW_ItemData } from '../Datas/XGTW_Data';

@ccclass('XGTW_SpecialSkinItem')
export default class XGTW_SpecialSkinItem extends Component {
    Background: Sprite | null = null;
    Icon: Sprite | null = null;
    Name: Label | null = null;
    Bottom: Node | null = null;
    data: XGTW_ItemData;
    protected onLoad(): void {
        this.Background = NodeUtil.GetComponent("Background", this.node, Sprite);
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.Name = NodeUtil.GetComponent("Name", this.node, Label);
        this.Bottom = NodeUtil.GetNode("Bottom", this.node);
    }
    Init(data) {
        this.data = data;

        this.Name.string = `${data.Name}`;
        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/GunBG_${data.Name}`).then((sf: SpriteFrame) => {
            this.Background.spriteFrame = sf;
        });

        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/${data.Type}/${data.Name}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
        });

        let color = new Color();
        let scale = 1.5;
        if (data.Name == `AX50-龙影`) {
            Color.fromHEX(color, XGTW_ColorHex.RED);
        }

        if (data.Name == `FAL-赛博涂鸦`) {
            Color.fromHEX(color, XGTW_ColorHex.PURPLE);
        }

        if (data.Name == `MPX-白金之星`) {
            Color.fromHEX(color, XGTW_ColorHex.GOLD);
        }

        if (data.Name == `G18C-矩形几何`) {
            Color.fromHEX(color, XGTW_ColorHex.BROWN);
            scale = 0.8;
        }

        this.Icon.node.setScale(-scale, scale);
        this.Bottom.getComponent(Sprite).color = color;
    }
    OnButtonClick() {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);
        XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.SpecialSkinDetailPanel, [this.data]);
    }
}