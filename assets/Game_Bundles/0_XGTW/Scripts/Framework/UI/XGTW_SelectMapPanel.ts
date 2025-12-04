import { _decorator, Component, Node, Label, Event, color, Sprite } from 'cc';
const { ccclass, property } = _decorator;

import { XGTW_AudioManager } from '../../XGTW_AudioManager';
import NodeUtil from '../../../../../Scripts/Framework/Utils/NodeUtil';
import XGTW_GameManager from '../../XGTW_GameManager';
import { XGTW_Constant } from '../Const/XGTW_Constant';
import { XGTW_UIManager } from '../Managers/XGTW_UIManager';
import { Panel, UIManager } from '../../../../../Scripts/Framework/Managers/UIManager';
import { EventManager } from '../../../../../Scripts/Framework/Managers/EventManager';
import { XGTW_Event } from '../Managers/XGTW_Event';
import { GameManager } from 'db://assets/Scripts/GameManager';

@ccclass('XGTW_SelectMapPanel')
export default class XGTW_SelectMapPanel extends Component {
    DetailPanel: Node | null = null;
    MapButton_0: Node | null = null;
    MapButton_1: Node | null = null;
    MapButton_2: Node | null = null;
    ModeButton_0: Node | null = null;
    ModeButton_1: Node | null = null;
    MapDescLabel: Label | null = null;
    MapTitleBarLabel: Label | null = null;
    MapTitleLabel: Label | null = null;
    index: number = 0;
    static MapNames = ["死斗竞技场", "对峙前线", "冰河禁区"];
    protected onLoad(): void {
        this.DetailPanel = NodeUtil.GetNode("DetailPanel", this.node);
        this.MapButton_0 = NodeUtil.GetNode("MapButton_0", this.node);
        this.MapButton_1 = NodeUtil.GetNode("MapButton_1", this.node);
        this.MapButton_2 = NodeUtil.GetNode("MapButton_2", this.node);
        this.ModeButton_0 = NodeUtil.GetNode("ModeButton_0", this.node);
        this.ModeButton_1 = NodeUtil.GetNode("ModeButton_1", this.node);
        this.MapDescLabel = NodeUtil.GetComponent("MapDescLabel", this.node, Label);
        this.MapTitleBarLabel = NodeUtil.GetComponent("MapTitleBarLabel", this.node, Label);
        this.MapTitleLabel = NodeUtil.GetComponent("MapTitleLabel", this.node, Label);
    }
    Show(cb: Function = null) {
        this.RefreshButtons();
    }
    RefreshButtons(index: number = -1) {
        this.DetailPanel.active = index != -1;

        if (index != -1) {
            this.index = index;
            this.DetailPanel.getChildByName("Icons").children.forEach(e => e.active = e.name == `${index}`);
            let title = ["物资一般", "物资一般", "物资丰富"];
            this.MapTitleBarLabel.string = title[index];
            this.MapTitleLabel.string = XGTW_SelectMapPanel.MapNames[index];
            XGTW_GameManager.MapIndex = index;
            EventManager.Scene.emit(XGTW_Event.RefreshMapButtonLabel);
        }

        this.RefreshModeButtons(0);
        this.RefreshMapButtons(index);
    }
    RefreshMapButtons(index: number) {
        this.MapButton_0.getChildByName("Select").active = index == 0;
        this.MapButton_1.getChildByName("Select").active = index == 1;
        this.MapButton_2.getChildByName("Select").active = index == 2;
    }
    RefreshModeButtons(index: number) {
        if (index != -1) {
            XGTW_GameManager.Mode = index;
            NodeUtil.GetNode("Bar", this.ModeButton_0).getComponent(Sprite).color = color().fromHEX(index == 0 ? "#FFAA00" : "#838382");
            NodeUtil.GetNode("Bar", this.ModeButton_1).getComponent(Sprite).color = color().fromHEX(index == 1 ? "#FFAA00" : "#838382");
            NodeUtil.GetNode("Label", this.ModeButton_0).getComponent(Label).color = color().fromHEX(index == 0 ? "#FFAA00" : "#838382");
            NodeUtil.GetNode("Label", this.ModeButton_1).getComponent(Label).color = color().fromHEX(index == 1 ? "#FFAA00" : "#838382");
            NodeUtil.GetNode("Select", this.ModeButton_0).getComponent(Sprite).color = color().fromHEX(index == 0 ? "#5C5D62" : "#36373B");
            NodeUtil.GetNode("Select", this.ModeButton_1).getComponent(Sprite).color = color().fromHEX(index == 1 ? "#5C5D62" : "#36373B");
            this.MapDescLabel.string = index == 0 ? "被淘汰后装备不会掉落，但是除加密箱外背包的物资会掉落！" : "除加密箱外背包的物资会掉落！";
            EventManager.Scene.emit(XGTW_Event.RefreshMapButtonLabel);
        }
    }
    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);

        switch (event.target.name) {
            case "MapButton_0":
                this.RefreshButtons(0);
                break;

            case "MapButton_1":
                this.RefreshButtons(1);
                break;

            case "MapButton_2":
                this.RefreshButtons(2);
                break;

            case "ModeButton_0":
                this.RefreshModeButtons(0);
                break;

            case "ModeButton_1":
                this.RefreshModeButtons(1);
                break;

            case "StartButton":
                UIManager.ShowPanel(Panel.LoadingPanel, [GameManager.GameData, `XGTW_Lv_${this.index}`]);
                break;
            case "ReturnButton":
                XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.SelectMapPanel);
                break;
            case "StartReturnButton":
                this.DetailPanel.active = false;
                break;

        }
    }
}