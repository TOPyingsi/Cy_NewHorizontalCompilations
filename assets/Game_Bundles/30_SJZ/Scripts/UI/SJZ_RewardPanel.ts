import { _decorator, Component, Label, Node, Event, Prefab, instantiate, math, Vec2, v2, v3, Size, resources, Vec3, Sprite, SpriteFrame, ScrollView, UITransform, Layout } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { SJZ_ItemData } from '../SJZ_Data';
import { SJZ_UIManager } from './SJZ_UIManager';
import { SJZ_Constant } from '../SJZ_Constant';
import { SJZ_DataManager } from '../SJZ_DataManager';
import SJZ_CommonItem from './SJZ_CommonItem';
import { SJZ_PoolManager } from '../SJZ_PoolManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { SJZ_Audio, SJZ_AudioManager } from '../SJZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZ_RewardPanel')
export default class SJZ_RewardPanel extends PanelBase {
    Panel: Node = null;
    Content: Node = null;
    ContentLayout: Layout;
    ScrollView: ScrollView = null;

    items: SJZ_CommonItem[] = [];
    callback: Function = null;

    protected onLoad(): void {
        this.Panel = NodeUtil.GetNode("Panel", this.node);
        this.Content = NodeUtil.GetNode("Content", this.node);
        this.ContentLayout = this.Content.getComponent(Layout);
        this.ScrollView = NodeUtil.GetComponent("ScrollView", this.node, ScrollView);
    }

    Show(data: SJZ_ItemData[], callback: Function): void {
        super.Show(this.Panel);
        this.items.forEach(e => SJZ_PoolManager.Instance.Put(e.node));
        this.items = [];

        for (let i = 0; i < data.length; i++) {
            this.scheduleOnce(() => {
                let node = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.CommonItem, this.Content);
                let item = node.getComponent(SJZ_CommonItem);
                item.InitDisplay(data[i]);
                this.items.push(item);

                this.ContentLayout.updateLayout();
                this.Content.setPosition(Vec3.ZERO);

                if (!SJZ_DataManager.PlayerData.AddItemToInventory(Tools.Clone(data[i]))) {
                    SJZ_DataManager.PlayerData.Money += data[i].Price;
                    UIManager.ShowTip(`仓库已满，转化成金钱${data[i].Price}`);
                }

            }, i * 0.1)
        }

        this.callback = callback;
    }

    OnButtonClick(event: Event) {
        SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.ButtonClick);


        switch (event.target.name) {
            case "Mask":
                SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.RewardPanel);
                break;
        }
    }
}