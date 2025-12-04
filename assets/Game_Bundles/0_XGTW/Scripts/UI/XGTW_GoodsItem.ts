import { _decorator, Component, Button, Sprite, Label, Node, v3, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { XGTW_ItemType } from '../Framework/Const/XGTW_Constant';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { GameManager } from '../../../../Scripts/GameManager';
import { XGTW_ItemData } from '../Datas/XGTW_Data';

@ccclass('XGTW_GoodsItem')
export default class XGTW_GoodsItem extends Component {
    Button: Button | null = null;
    Icon: Sprite | null = null;
    Name: Label | null = null;
    Desc: Label | null = null;
    Selected: Node | null = null;
    Locked: Node | null = null;
    Get: Node | null = null;
    data: XGTW_ItemData;
    cb: Function = null;
    protected onLoad(): void {
        this.Button = this.node.getComponent(Button);
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.Name = NodeUtil.GetComponent("Name", this.node, Label);
        this.Desc = NodeUtil.GetComponent("Desc", this.node, Label);
        this.Selected = NodeUtil.GetNode("Selected", this.node);
        this.Locked = NodeUtil.GetNode("Locked", this.node);
        this.Get = NodeUtil.GetNode("Get", this.node);
    }
    Init(data: XGTW_ItemData, cb: Function) {
        this.Reset();
        this.data = data;
        this.cb = cb;
        this.Name.string = `${this.data.Name}`;
        this.Desc.string = `${this.data.Count} `;

        let scale = 1;
        if (data.Type == XGTW_ItemType[XGTW_ItemType.头盔]) scale = 0.4;
        if (data.Type == XGTW_ItemType[XGTW_ItemType.防弹衣]) scale = 0.6;
        if (data.Type == XGTW_ItemType[XGTW_ItemType.手枪]) scale = 0.8;
        if (data.Type == XGTW_ItemType[XGTW_ItemType.突击步枪]) scale = 0.8;
        if (data.Type == XGTW_ItemType[XGTW_ItemType.冲锋枪]) scale = 0.8;
        if (data.Type == XGTW_ItemType[XGTW_ItemType.射手步枪]) scale = 0.8;
        if (data.Type == XGTW_ItemType[XGTW_ItemType.栓动步枪]) scale = 0.8;
        if (data.Type == XGTW_ItemType[XGTW_ItemType.轻机枪]) scale = 0.8;
        if (data.Type == XGTW_ItemType[XGTW_ItemType.霰弹枪]) scale = 0.8;
        if (data.Type == XGTW_ItemType[XGTW_ItemType.子弹]) scale = 0.6;
        if (data.Type == XGTW_ItemType[XGTW_ItemType.战利品]) scale = 0.6;
        if (data.Type == XGTW_ItemType[XGTW_ItemType.药品]) scale = 0.6;
        if (data.Type == XGTW_ItemType[XGTW_ItemType.金钱]) scale = 0.5;

        this.Icon.node.setScale(v3(scale, scale));

        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/${data.Type}/${data.Name}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
        });
    }
    InitBlank() {
        this.Reset();
        this.Button.enabled = false;
    }
    InitSimple(data: XGTW_ItemData) {
        this.Reset();
        this.Button.enabled = false;
        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/${data.Type}/${data.Name}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
        });
    }
    Reset() {
        this.data = null;
        this.cb = null;
        this.Button.enabled = true;
        this.Name.string = ``;
        this.Desc.string = ``;
        this.Icon.spriteFrame = null;
        this.Selected.active = false;
        this.Get.active = false;
        this.Locked.active = false;
    }
    SetSelected(data: XGTW_ItemData) {
        this.Selected.active = data == this.data;
    }
    OnButtonClick() {
        if (this.Get.active) return;
        if (this.Locked.active) {
            UIManager.ShowTip("获得进阶手册可解锁更多奖励");
            return;
        }
        this.cb && this.cb(this.data);
    }
}