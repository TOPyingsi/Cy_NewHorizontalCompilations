import { _decorator, Component, Sprite, Label, Node, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

import { XGTW_AudioManager } from '../XGTW_AudioManager';
import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { XGTW_ItemType, XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import XGTW_GameManager from '../XGTW_GameManager';
import { GameManager } from '../../../../Scripts/GameManager';
import { XGTW_ItemData } from '../Datas/XGTW_Data';

@ccclass('XGTW_SItem')
export default class XGTW_SItem extends Component {
    Icon: Sprite | null = null;
    Label: Label | null = null;
    Quality: Node | null = null;
    data: XGTW_ItemData;
    cb: Function = null;
    protected onLoad(): void {
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.Label = NodeUtil.GetComponent("Label", this.node, Label);
        this.Quality = NodeUtil.GetNode("Quality", this.node);
    }
    Init(data, cb: Function = null) {
        this.cb = cb;
        this.data = data;

        if (XGTW_ItemType[`${data.Type}`] == XGTW_ItemType.个性化枪械) {
            this.Icon.node.angle = -45;
            this.Icon.node.setScale(-1, 1);

            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Doggie/个性化枪械/${data.Name}`).then((sf: SpriteFrame) => {
                this.Icon.spriteFrame = sf;
            });
        }
        else if (XGTW_ItemType[`${data.Type}`] == XGTW_ItemType.个性化装扮) {
            this.Icon.node.angle = 0;
            this.Icon.node.setScale(1, 1);

            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Doggie/个性化装扮/${data.Name}`).then((sf: SpriteFrame) => {
                this.Icon.spriteFrame = sf;
            });
        } else {
            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/${data.Type}/${data.Name.replace(/^\./, '')}`).then((sf: SpriteFrame) => {
                this.Icon.spriteFrame = sf;
            });
        }

        this.Label.string = `${data.Count}`;
        this.Quality.getComponent(Sprite).color = XGTW_GameManager.GetQualityColor(data.Quality);
    }
    OnButtonClick() {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);
        this.cb && this.cb(this.data);
    }
}