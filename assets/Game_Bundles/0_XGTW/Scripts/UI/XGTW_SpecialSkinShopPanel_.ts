import { _decorator, Component, Node, Label, ScrollView, Event } from 'cc';
const { ccclass, property } = _decorator;

import XGTW_SeasonItem from "./XGTW_SeasonItem";
import XGTW_ValueBar from "./XGTW_ValueBar";
import { XGTW_AudioManager } from '../XGTW_AudioManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import PrefsManager from '../../../../Scripts/Framework/Managers/PrefsManager';
import { XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import { XGTW_UIManager } from '../Framework/Managers/XGTW_UIManager';
import Banner from '../../../../Scripts/Banner';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';
import { GameManager } from 'db://assets/Scripts/GameManager';

@ccclass('XGTW_SpecialSkinShopPanel_')
export default class XGTW_SpecialSkinShopPanel_ extends Component {
    ItemContent: Node | null = null;
    SeasonButton: Node | null = null;
    SeasonLvLabel: Label | null = null;
    ValueBar: XGTW_ValueBar = null;
    ScrollView: ScrollView | null = null;
    items: XGTW_SeasonItem[] = [];
    protected onLoad(): void {
        this.ItemContent = NodeUtil.GetNode("ItemContent", this.node);
        this.SeasonButton = NodeUtil.GetNode("SeasonButton", this.node);
        this.SeasonLvLabel = NodeUtil.GetComponent("SeasonLvLabel", this.node, Label);
        this.ValueBar = NodeUtil.GetComponent("ValueBar", this.node, XGTW_ValueBar);
        this.ScrollView = NodeUtil.GetComponent("ScrollView", this.node, ScrollView);
    }
    Show() {
        // Banner_Main.Instance.ShowNativeAd();
        this.RefreshItems();
        this.RefreshTitle();
        this.SeasonButton.active = !PrefsManager.GetBool(XGTW_Constant.Key.UnlockSeason);
        this.ScrollView.scrollToPercentHorizontal(XGTW_DataManager.SeasonLv / 80, 0.1, true);
    }
    RefreshTitle() {
        this.SeasonLvLabel.string = `${XGTW_DataManager.SeasonLv}`;
        this.ValueBar.SetAll(XGTW_DataManager.EXP % 1000 / 1000, `${XGTW_DataManager.EXP % 1000} /1000`);
    }
    RefreshItems() {
        if (!this.items || this.items.length == 0) {
            const scroll = () => { this.ScrollView.scrollToPercentHorizontal(XGTW_DataManager.SeasonLv / 80, 0.1, true) };

            for (let i = 0; i < XGTW_DataManager.SeasonDatas.length; i++) {
                const data = XGTW_DataManager.SeasonDatas[i];
                PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/SeasonItem", this.ItemContent).then((node: Node) => {
                    let item = node.getComponent(XGTW_SeasonItem);
                    item.Init(i + 1, data);
                    this.items.push(item);
                    if (i >= XGTW_DataManager.SeasonDatas.length - 1) scroll();
                });
            }
        } else {
            this.items.forEach(e => e.Refresh());
        }
    }
    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);

        switch (event.target.name) {
            case "ReturnButton":
                XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.SeasonPanel);
                break;
            case "SeasonButton":
                Banner.Instance.ShowVideoAd(() => {
                    PrefsManager.SetBool(XGTW_Constant.Key.UnlockSeason, true);
                    this.SeasonButton.active = false;
                    this.RefreshItems();
                    this.RefreshTitle();
                });
                break;
        }
    }
}