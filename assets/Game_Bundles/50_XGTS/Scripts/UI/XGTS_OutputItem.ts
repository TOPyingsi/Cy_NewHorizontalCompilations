import { _decorator, Node, Component, EventTouch, Input, Label, resources, Sprite, SpriteFrame, tween, UITransform, v3, Vec3, UIOpacity, Tween, RichText } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { XGTS_ItemData } from '../XGTS_Data';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { XGTS_GameManager } from '../XGTS_GameManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { XGTS_PoolManager } from '../XGTS_PoolManager';
import { XGTS_Constant } from '../XGTS_Constant';
import XGTS_CommonItem from './XGTS_CommonItem';
const { ccclass, property } = _decorator;

@ccclass('XGTS_OutputItem')
export default class XGTS_OutputItem extends Component {
    Select: Node = null;
    Item: Node = null;
    Label: Label = null;

    data: XGTS_ItemData = null;
    item: XGTS_CommonItem = null;

    cb: Function = null;

    onLoad() {
        this.Select = NodeUtil.GetNode("Select", this.node);
        this.Item = NodeUtil.GetNode("Item", this.node);
        this.Label = NodeUtil.GetComponent("Label", this.node, Label);
    }

    Init(data: XGTS_ItemData, cb: Function) {
        this.data = data;
        this.cb = cb;
        this.Label.string = data.Name;
        this.Select.active = false;

        if (!this.item) {
            let node = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.CommonItem, this.Item);
            this.item = node.getComponent(XGTS_CommonItem);
            node.setPosition(Vec3.ZERO);
        }

        this.item.InitDisplay(data);
    }

    Refresh(data: XGTS_ItemData) {
        this.Select.active = data == this.data;
    }

    OnButtonClick() {
        this.cb && this.cb(this.data);
    }
}