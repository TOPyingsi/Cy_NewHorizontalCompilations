import { _decorator, Component, Label, Node, Event, Prefab, instantiate, math, Vec2, v2, v3, Size, resources, Vec3, Sprite, SpriteFrame, ScrollView, UITransform, Layout } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { XGTS_ItemData } from '../XGTS_Data';
import { XGTS_UIManager } from './XGTS_UIManager';
import { XGTS_Constant } from '../XGTS_Constant';
import { XGTS_DataManager } from '../XGTS_DataManager';
import XGTS_CommonItem from './XGTS_CommonItem';
import { XGTS_PoolManager } from '../XGTS_PoolManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { XGTS_Audio, XGTS_AudioManager } from '../XGTS_AudioManager';
import { XGTS_GameManager } from '../XGTS_GameManager';
const { ccclass, property } = _decorator;

@ccclass('XGTS_RewardPanel')
export default class XGTS_RewardPanel extends PanelBase {
    Panel: Node = null;
    Content: Node = null;
    ContentLayout: Layout;
    ScrollView: ScrollView = null;

    items: XGTS_CommonItem[] = [];
    callback: Function = null;

    protected onLoad(): void {
        this.Panel = NodeUtil.GetNode("Panel", this.node);
        this.Content = NodeUtil.GetNode("Content", this.node);
        this.ContentLayout = this.Content.getComponent(Layout);
        this.ScrollView = NodeUtil.GetComponent("ScrollView", this.node, ScrollView);
    }

    Show(data: XGTS_ItemData[], callback: Function): void {
        super.Show(this.Panel);
        this.items.forEach(e => XGTS_PoolManager.Instance.Put(e.node));
        this.items = [];

        for (let i = 0; i < data.length; i++) {
            this.scheduleOnce(() => {
                let node = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.CommonItem, this.Content);
                let item = node.getComponent(XGTS_CommonItem);
                item.InitDisplay(data[i]);
                this.items.push(item);

                this.ContentLayout.updateLayout();
                this.Content.setPosition(Vec3.ZERO);

                 let playerNum = 0;
                if (XGTS_GameManager.IsDoubleMode) {
                    playerNum = 1;
                }

                if (!XGTS_DataManager.PlayerDatas[playerNum].AddItemToInventory(Tools.Clone(data[i]))) {//TODO LCH_奖励是否平分？
                    if(XGTS_GameManager.IsDoubleMode){
                        XGTS_DataManager.PlayerDatas[1].Money += data[i].Price/2;
                        XGTS_DataManager.PlayerDatas[2].Money += data[i].Price/2;
                    }else{
                        XGTS_DataManager.PlayerDatas[0].Money += data[i].Price;
                    }
                    // XGTS_DataManager.PlayerData.Money += data[i].Price;
                    UIManager.ShowTip(`仓库已满，转化成金钱${data[i].Price}`);
                }

            }, i * 0.1)
        }

        this.callback = callback;
    }

    OnButtonClick(event: Event) {
        XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.ButtonClick);


        switch (event.target.name) {
            case "Mask":
                XGTS_UIManager.Instance.HidePanel(XGTS_Constant.Panel.RewardPanel);
                break;
        }
    }
}