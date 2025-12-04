import { _decorator, Component, Sprite, Node, SpriteFrame, v3 } from 'cc';
const { ccclass, property } = _decorator;

import { XGTW_AudioManager } from '../XGTW_AudioManager';
import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { XGTW_ItemType, XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import XGTW_GameManager from '../XGTW_GameManager';
import { GameManager } from '../../../../Scripts/GameManager';
import { XGTW_ItemData, XGTW_头盔, XGTW_防弹衣, XGTW_手枪, XGTW_突击步枪, XGTW_冲锋枪, XGTW_射手步枪, XGTW_栓动步枪, XGTW_轻机枪, XGTW_霰弹枪, XGTW_投掷物, XGTW_子弹, XGTW_药品 } from '../Datas/XGTW_Data';

@ccclass('XGTW_CommonItem')
export default class XGTW_CommonItem extends Component {
    Icon: Sprite | null = null;
    Quality: Node | null = null;
    Select: Node | null = null;
    data: XGTW_ItemData;
    cb: Function = null;
    protected onLoad(): void {
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.Quality = NodeUtil.GetNode("Quality", this.node);
        this.Select = NodeUtil.GetNode("Select", this.node);
    }
    Init(data, cb: Function = null) {
        this.cb = cb;
        this.data = data;
        this.Select.active = false;

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
            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/${data.Type}/${data.Name}`).then((sf: SpriteFrame) => {
                this.Icon.spriteFrame = sf;
            });
        }

        this.Quality.getComponent(Sprite).color = XGTW_GameManager.GetQualityColor(data.Quality);
    }
    SetSelect(itemData: XGTW_ItemData) {
        this.Select.active = itemData == this.data;
    }
    头盔(data: XGTW_头盔) {
        this.data = data;
        this.Init(data);
        this.Icon.node.setScale(v3(0.5, 0.5));
    }
    防弹衣(data: XGTW_防弹衣) {
        this.data = data;
        this.Init(data);
        this.Icon.node.setScale(v3(0.8, 0.8));
    }
    手枪(data: XGTW_手枪) {
        this.data = data;
        this.Init(data);
        this.Icon.node.setScale(v3(0.8, 0.8));
    }
    突击步枪(data: XGTW_突击步枪) {
        this.data = data;
        this.Init(data);
    }
    冲锋枪(data: XGTW_冲锋枪) {
        this.data = data;
        this.Init(data);
    }
    射手步枪(data: XGTW_射手步枪) {
        this.data = data;
        this.Init(data);
    }
    栓动步枪(data: XGTW_栓动步枪) {
        this.data = data;
        this.Init(data);
    }
    轻机枪(data: XGTW_轻机枪) {
        this.data = data;
        this.Init(data);
    }
    霰弹枪(data: XGTW_霰弹枪) {
        this.data = data;
        this.Init(data);
    }
    投掷物(data: XGTW_投掷物) {
        this.data = data;
        this.Init(data);
    }
    子弹(data: XGTW_子弹) {
        this.data = data;
        this.Init(data);
        this.Icon.node.setScale(v3(0.8, 0.8));
    }
    药品(data: XGTW_药品) {
        this.data = data;
        this.Init(data);
        this.Icon.node.setScale(XGTW_ItemData.GetScale(data.Type));
    }
    OnButtonClick() {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);
        this.cb && this.cb(this.data);
    }
}