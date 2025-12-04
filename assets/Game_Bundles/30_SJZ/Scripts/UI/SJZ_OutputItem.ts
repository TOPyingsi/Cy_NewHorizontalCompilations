import { _decorator, Node, Component, EventTouch, Input, Label, resources, Sprite, SpriteFrame, tween, UITransform, v3, Vec3, UIOpacity, Tween, RichText } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { SJZ_ItemData } from '../SJZ_Data';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { SJZ_GameManager } from '../SJZ_GameManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { SJZ_PoolManager } from '../SJZ_PoolManager';
import { SJZ_Constant } from '../SJZ_Constant';
import SJZ_CommonItem from './SJZ_CommonItem';
const { ccclass, property } = _decorator;

@ccclass('SJZ_OutputItem')
export default class SJZ_OutputItem extends Component {
    Select: Node = null;
    Item: Node = null;
    Label: Label = null;

    data: SJZ_ItemData = null;
    item: SJZ_CommonItem = null;

    cb: Function = null;

    onLoad() {
        this.Select = NodeUtil.GetNode("Select", this.node);
        this.Item = NodeUtil.GetNode("Item", this.node);
        this.Label = NodeUtil.GetComponent("Label", this.node, Label);
    }

    Init(data: SJZ_ItemData, cb: Function) {
        this.data = data;
        this.cb = cb;
        this.Label.string = data.Name;
        this.Select.active = false;

        if (!this.item) {
            let node = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.CommonItem, this.Item);
            this.item = node.getComponent(SJZ_CommonItem);
            node.setPosition(Vec3.ZERO);
        }

        this.item.InitDisplay(data);
    }

    Refresh(data: SJZ_ItemData) {
        this.Select.active = data == this.data;
    }

    OnButtonClick() {
        this.cb && this.cb(this.data);
    }
}