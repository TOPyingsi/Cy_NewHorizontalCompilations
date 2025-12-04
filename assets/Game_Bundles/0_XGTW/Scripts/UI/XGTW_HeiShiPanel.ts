import { _decorator, Component, Node, Label, ScrollView, Event, Color, color, instantiate, Prefab } from 'cc';
const { ccclass, property } = _decorator;

import XGTW_HeiShiButton from "./XGTW_HeiShiButton";
import XGTW_Item from "./XGTW_Item";
import XGTW_ItemInfoPanel from "./XGTW_ItemInfoPanel";
import { XGTW_AudioManager } from '../XGTW_AudioManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import { XGTW_UIManager } from '../Framework/Managers/XGTW_UIManager';
import { EventManager } from '../../../../Scripts/Framework/Managers/EventManager';
import { XGTW_Event } from '../Framework/Managers/XGTW_Event';
import Banner from '../../../../Scripts/Banner';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { XGTW_ItemData } from '../Datas/XGTW_Data';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

@ccclass('XGTW_HeiShiPanel')
export default class XGTW_HeiShiPanel extends Component {
    public static Instance: XGTW_HeiShiPanel = null;
    ItemContent: Node | null = null;
    GunButton: Node | null = null;
    SkinButton: Node | null = null;
    Detail: Node | null = null;
    DetailUseButton: Node | null = null;
    DetailBuyButton: Node | null = null;
    DetailUnequippedButton: Node | null = null;
    JCWG: Node | null = null;
    TWMB: Node | null = null;
    ZDTX: Node | null = null;
    TTBB: Node | null = null;
    ZJWG: Node | null = null;
    ZLPH: Node | null = null;
    神秘商店: XGTW_HeiShiButton = null;
    MoneyLabel: Label | null = null;
    items: Node[] = [];
    private HeiShiButton: XGTW_HeiShiButton = null;
    private ItemScrollView: ScrollView | null = null;
    ItemInfoPanel: XGTW_ItemInfoPanel = null;
    protected onLoad(): void {
        XGTW_HeiShiPanel.Instance = this;

        this.ItemContent = NodeUtil.GetNode("ItemContent", this.node);
        this.GunButton = NodeUtil.GetNode("GunButton", this.node);
        this.SkinButton = NodeUtil.GetNode("SkinButton", this.node);

        this.Detail = NodeUtil.GetNode("Detail", this.node);
        this.DetailUseButton = NodeUtil.GetNode("DetailUseButton", this.node);
        this.DetailBuyButton = NodeUtil.GetNode("DetailBuyButton", this.node);
        this.DetailUnequippedButton = NodeUtil.GetNode("DetailUnequippedButton", this.node);
        this.ItemScrollView = NodeUtil.GetComponent("ItemScrollView", this.node, ScrollView);
        this.ItemInfoPanel = NodeUtil.GetComponent("ItemInfoPanel", this.node, XGTW_ItemInfoPanel);
        this.神秘商店 = NodeUtil.GetComponent("神秘商店", this.node, XGTW_HeiShiButton);
        this.MoneyLabel = NodeUtil.GetComponent("MoneyLabel", this.node, Label);

        this.JCWG = NodeUtil.GetNode("JCWG", this.node);
        this.TWMB = NodeUtil.GetNode("TWMB", this.node);
        this.ZDTX = NodeUtil.GetNode("ZDTX", this.node);
        this.TTBB = NodeUtil.GetNode("TTBB", this.node);
        this.ZJWG = NodeUtil.GetNode("ZJWG", this.node);
        this.ZLPH = NodeUtil.GetNode("ZLPH", this.node);
    }
    Show() {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);
        this.ItemInfoPanel.Hide();
        this.scheduleOnce(() => {
            this.神秘商店.OnButtonClick();
        })

        this.RefreshMoney();
    }
    SetHeiShiButton(heiShiButton: XGTW_HeiShiButton) {
        //重置之前的选择
        if (this.HeiShiButton && this.HeiShiButton != heiShiButton) {
            this.HeiShiButton.SetSelect(false);
            if (this.HeiShiButton.Order) this.HeiShiButton.Order.getComponent(XGTW_HeiShiButton).SetSelect(false);
        }

        this.HeiShiButton = heiShiButton;

        if (this.HeiShiButton && this.HeiShiButton.Order) {
            this.HeiShiButton.Order.getComponent(XGTW_HeiShiButton).SetSelect(true);
        }
    }
    RefreshItems(items: XGTW_ItemData[]) {
        this.ItemScrollView.stopAutoScroll();
        this.ItemScrollView.scrollToTop();

        let Refresh = () => {
            for (let i = 0; i < this.items.length; i++) {
                if (i > items.length - 1) {
                    this.items[i].active = false; continue;
                }

                this.items[i].active = true;
                let item = this.items[i].getComponent(XGTW_Item);
                item.Init(items[i], this.ShowInfoPanel.bind(this))
            }
        }

        if (this.items.length < items.length) {
            let loadCount = items.length - this.items.length;
            for (let i = 0; i < items.length - this.items.length; i++) {
                BundleManager.GetBundle(GameManager.GameData.DefaultBundle).load("Prefabs/UI/Item", (err: any, prefab: Prefab) => {
                    let node = instantiate(prefab);
                    node.setParent(this.ItemContent);
                    this.items.push(node);

                    loadCount--;
                    if (loadCount <= 0) {
                        Refresh();
                    }
                });
            }
        } else {
            Refresh();
        }
    }
    ShowInfoPanel(data: XGTW_ItemData) {
        this.ItemInfoPanel.Show(data, true);
    }
    RefreshDetailButtonState(state: string) {
        this.ItemInfoPanel.Hide();
        this.JCWG.getChildByName("Select").active = state == "JCWG";
        this.TWMB.getChildByName("Select").active = state == "TWMB";
        this.ZDTX.getChildByName("Select").active = state == "ZDTX";
        this.TTBB.getChildByName("Select").active = state == "TTBB";
        this.ZJWG.getChildByName("Select").active = state == "ZJWG";
        this.ZLPH.getChildByName("Select").active = state == "ZLPH";
        this.JCWG.getChildByName("Label").getComponent(Label).color = state == "JCWG" ? Color.WHITE : color().fromHEX("#999999");
        this.TWMB.getChildByName("Label").getComponent(Label).color = state == "TWMB" ? Color.WHITE : color().fromHEX("#999999");
        this.ZDTX.getChildByName("Label").getComponent(Label).color = state == "ZDTX" ? Color.WHITE : color().fromHEX("#999999");
        this.TTBB.getChildByName("Label").getComponent(Label).color = state == "TTBB" ? Color.WHITE : color().fromHEX("#999999");
        this.ZJWG.getChildByName("Label").getComponent(Label).color = state == "ZJWG" ? Color.WHITE : color().fromHEX("#999999");
        this.ZLPH.getChildByName("Label").getComponent(Label).color = state == "ZLPH" ? Color.WHITE : color().fromHEX("#999999");
    }
    RefreshMoney() {
        this.MoneyLabel.string = `${XGTW_DataManager.Money}`;
    }
    OnButtonClick(event: Event) {
        this.ItemInfoPanel.Hide();
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);
        switch (event.target.name) {
            case "JCWG":
                this.RefreshDetailButtonState(event.target.name);
                break;
            case "TWMB":
                this.RefreshDetailButtonState(event.target.name);
                break;
            case "ZDTX":
                this.RefreshDetailButtonState(event.target.name);
                break;
            case "TTBB":
                this.RefreshDetailButtonState(event.target.name);
                break;
            case "ZJWG":
                this.RefreshDetailButtonState(event.target.name);
                break;
            case "ZLPH":
                this.RefreshDetailButtonState(event.target.name);
                break;
            case "ReturnButton":
                XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.HeiShiPanel);
                break;
            case "AddMoneyButton":
                Banner.Instance.ShowVideoAd(() => {
                    XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.GetMoney);
                    XGTW_DataManager.Money += 20000;
                });
        }
    }
    protected onEnable(): void {
        EventManager.on(XGTW_Event.RefreshMoney, this.RefreshMoney, this);
    }
    protected onDisable(): void {
        EventManager.off(XGTW_Event.RefreshMoney, this.RefreshMoney, this);
    }
}