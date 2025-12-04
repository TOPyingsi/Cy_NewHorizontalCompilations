import { _decorator, Component, Node, Label, UIOpacity, Sprite, Color, color } from 'cc';
const { ccclass, property } = _decorator;

import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { XGTW_ItemType } from '../Framework/Const/XGTW_Constant';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';
import XGTW_HeiShiPanel from './XGTW_HeiShiPanel';

@ccclass('XGTW_HeiShiButton')
export default class XGTW_HeiShiButton extends Component {
    @property({ type: [Node] })
    Buttons: Node[] = [];
    @property(Node)
    Order: Node = null;
    @property
    isSub: boolean = false;
    BG_SMSD: Node | null = null;
    BG_Normal: Node | null = null;
    BG_Sub: Node | null = null;
    Label: Label | null = null;
    isOn: boolean = false;

    onLoad() {
        this.BG_SMSD = NodeUtil.GetNode("BG_SMSD", this.node);
        this.BG_Normal = NodeUtil.GetNode("BG_Normal", this.node);
        this.BG_Sub = NodeUtil.GetNode("BG_Sub", this.node);
        this.Label = NodeUtil.GetComponent("Label", this.node, Label);

        if (this.isSub) this.Label.node.getComponent(UIOpacity).opacity = 150;
    }

    start() {
        this.BG_SMSD.active = false;
        this.BG_Normal.active = false;
        this.BG_Sub.active = false;
    }

    SetSelect(select: boolean) {
        if (this.node.name == "神秘商店") {
            this.BG_SMSD.active = select;
        } else {
            this.scheduleOnce(() => {
                this.BG_Normal.active = !this.isSub && select;
                this.BG_Sub.active = this.isSub && select;

            });
        }
        if (!this.isSub) this.Label.color = select ? Color.BLACK : color().fromHEX("#A4D0DB");
    }

    OnButtonClick() {
        XGTW_HeiShiPanel.Instance.ItemInfoPanel.Hide();
        this.isOn = !this.isOn;

        this.SetSelect(true);

        this.Buttons.forEach(e => e.active = this.isOn);

        if (this.Buttons.length > 0) {
            let str = this.Label.string;
            str = str.slice(0, -1);
            this.Label.string = `${str}${this.isOn ? "▼" : "▲"}`
        }

        //按钮点击分类
        if (this.node.name == "神秘商店") {
            let itemDatas = [];
            XGTW_DataManager.ItemDatas.get(XGTW_ItemType.神秘商店).forEach(e => itemDatas.push((e as any).GetItemData()));
            XGTW_HeiShiPanel.Instance.RefreshItems(itemDatas);
        } else if (this.node.name == "热卖新品") {
            let itemDatas = [];
            itemDatas.push(...XGTW_DataManager.ItemDatas.get(XGTW_ItemType.热卖新品));
            XGTW_HeiShiPanel.Instance.RefreshItems(itemDatas);
        } else if (this.node.name == "抽奖礼包") {
            let itemDatas = XGTW_DataManager.ItemDatas.get(XGTW_ItemType.抽奖礼包);
            XGTW_HeiShiPanel.Instance.RefreshItems(itemDatas);
        } else if (this.node.name == "快捷装备") {
            let itemDatas = [];
            XGTW_DataManager.ItemDatas.get(XGTW_ItemType.快捷装备).forEach(e => itemDatas.push((e as any).GetItemData()));
            XGTW_HeiShiPanel.Instance.RefreshItems(itemDatas);
        } else {
            let bullets = ["5.56毫米子弹", "7.62毫米子弹", "9毫米子弹", ".45口径子弹", "12口径子弹", ".300马格南子弹", ".50口径子弹", ".408口径子弹", "弩箭"];
            if (bullets.find(e => e == this.node.name)) {
                XGTW_HeiShiPanel.Instance.RefreshItems(XGTW_DataManager.ItemDatas.get(XGTW_ItemType.子弹).filter(e => e.Name == this.node.name));
            } else if (this.Buttons.length <= 0) {
                XGTW_HeiShiPanel.Instance.RefreshItems(XGTW_DataManager.ItemDatas.get(XGTW_ItemType[this.node.name]));
            } else {
                this.Buttons[0].getComponent(XGTW_HeiShiButton).OnButtonClick();
            }
        }

        if (this.isOn && this.Buttons.length > 0) {
            this.Buttons[0].getComponent(XGTW_HeiShiButton).OnButtonClick();
        } else {
            XGTW_HeiShiPanel.Instance.SetHeiShiButton(this);
        }
    }
}