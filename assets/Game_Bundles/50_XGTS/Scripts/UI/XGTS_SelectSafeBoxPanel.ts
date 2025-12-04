import { _decorator, Component, Label, Node, Event, Prefab, instantiate, math, Vec2, v2, v3, Size, resources, Vec3, Sprite, SpriteFrame } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { XGTS_ItemData } from '../XGTS_Data';
import { XGTS_UIManager } from './XGTS_UIManager';
import { XGTS_Constant } from '../XGTS_Constant';
import { XGTS_DataManager } from '../XGTS_DataManager';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import Banner from 'db://assets/Scripts/Banner';
import { XGTS_Audio, XGTS_AudioManager } from '../XGTS_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XGTS_SelectSafeBoxPanel')
export default class XGTS_SelectSafeBoxPanel extends PanelBase {
    Panel: Node = null;

    Buttons: Node = null;

    callback: Function = null;

    playerNum: number = 0;

    protected onLoad(): void {
        this.Panel = NodeUtil.GetNode("Panel", this.node);
        this.Buttons = NodeUtil.GetNode("Buttons", this.node);
    }

    Show(callback: Function,playerNum:number): void {
        this.playerNum = playerNum;
        super.Show(this.Panel);
        this.callback = callback;
        this.Refresh();
    }

    Refresh() {
        for (let i = 0; i < this.Buttons.children.length; i++) {
            let node = this.Buttons.children[i];
            let btnStr = "";
            let unlock = false;
            switch (node.name) {
                case "SafeBox_0":
                    unlock = true;
                    btnStr = "普通安全箱";
                    break;
                case "SafeBox_1":
                    unlock = XGTS_DataManager.GetSafeBoxUnlock(node.name);
                    if (unlock) {
                        btnStr = "进阶安全箱";
                    } else {
                        btnStr = `(${XGTS_DataManager.GetSafeBoxAdTimes(node.name)}/3)进阶安全箱`;
                    }
                    break;
                case "SafeBox_2":
                    unlock = XGTS_DataManager.GetSafeBoxUnlock(node.name);
                    if (unlock) {
                        btnStr = "高级安全箱";
                    } else {
                        btnStr = `(${XGTS_DataManager.GetSafeBoxAdTimes(node.name)}/6)高级安全箱`;
                    }
                    break;
                case "SafeBox_3":
                    unlock = XGTS_DataManager.GetSafeBoxUnlock(node.name);
                    if (unlock) {
                        btnStr = "顶级安全箱";
                    } else {
                        btnStr = `(${XGTS_DataManager.GetSafeBoxAdTimes(node.name)}/9)顶级安全箱`;
                    }
                    break;
            }

            node.getChildByName("ButtonLabel").getComponent(Label).string = btnStr;
            node.getChildByName("Lock").active = !unlock;
            node.getChildByName("Ad").active = !unlock;
        }
    }

    OnButtonClick(event: Event) {
        XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.ButtonClick);


        switch (event.target.name) {
            case "Mask":
                XGTS_UIManager.Instance.HidePanel(XGTS_Constant.Panel.SelectSafeBoxPanel);
                break;
            case "SafeBox_0":
                if (XGTS_DataManager.PlayerDatas[this.playerNum].SafeBox.ItemData.length > 0) {
                    UIManager.ShowTip("安全箱内还有物品");
                    return;
                }
                XGTS_DataManager.PlayerDatas[this.playerNum].SafeBox = { width: 2, height: 1, ItemData: XGTS_DataManager.PlayerDatas[this.playerNum].SafeBox.ItemData };
                this.callback && this.callback();
                XGTS_UIManager.Instance.HidePanel(XGTS_Constant.Panel.SelectSafeBoxPanel);
                XGTS_DataManager.SaveData();
                break;
            case "SafeBox_1":
                if (XGTS_DataManager.GetSafeBoxUnlock(event.target.name)) {
                    if (XGTS_DataManager.PlayerDatas[this.playerNum].SafeBox.ItemData.length > 0) {
                        UIManager.ShowTip("安全箱内还有物品");
                        return;
                    }
                    XGTS_DataManager.PlayerDatas[this.playerNum].SafeBox = { width: 2, height: 2, ItemData: XGTS_DataManager.PlayerDatas[this.playerNum].SafeBox.ItemData };
                    this.callback && this.callback();
                    XGTS_UIManager.Instance.HidePanel(XGTS_Constant.Panel.SelectSafeBoxPanel);
                    XGTS_DataManager.SaveData();
                } else {
                    Banner.Instance.ShowVideoAd(() => {
                        let count = XGTS_DataManager.GetSafeBoxAdTimes(event.target.name);
                        XGTS_DataManager.SetSafeBoxAdTimes(event.target.name, count + 1);
                        this.Refresh();
                    });
                }
                break;
            case "SafeBox_2":
                if (XGTS_DataManager.GetSafeBoxUnlock(event.target.name)) {
                    if (XGTS_DataManager.PlayerDatas[this.playerNum].SafeBox.ItemData.length > 0) {
                        UIManager.ShowTip("安全箱内还有物品");
                        return;
                    }
                    XGTS_DataManager.PlayerDatas[this.playerNum].SafeBox = { width: 3, height: 2, ItemData: XGTS_DataManager.PlayerDatas[this.playerNum].SafeBox.ItemData };
                    this.callback && this.callback();
                    XGTS_UIManager.Instance.HidePanel(XGTS_Constant.Panel.SelectSafeBoxPanel);
                    XGTS_DataManager.SaveData();
                } else {
                    Banner.Instance.ShowVideoAd(() => {
                        let count = XGTS_DataManager.GetSafeBoxAdTimes(event.target.name);
                        XGTS_DataManager.SetSafeBoxAdTimes(event.target.name, count + 1);
                        this.Refresh();
                    });
                }
                break;
            case "SafeBox_3":
                if (XGTS_DataManager.GetSafeBoxUnlock(event.target.name)) {
                    if (XGTS_DataManager.PlayerDatas[this.playerNum].SafeBox.ItemData.length > 0) {
                        UIManager.ShowTip("安全箱内还有物品");
                        return;
                    }
                    XGTS_DataManager.PlayerDatas[this.playerNum].SafeBox = { width: 3, height: 3, ItemData: XGTS_DataManager.PlayerDatas[this.playerNum].SafeBox.ItemData };
                    this.callback && this.callback();
                    XGTS_UIManager.Instance.HidePanel(XGTS_Constant.Panel.SelectSafeBoxPanel);
                    XGTS_DataManager.SaveData();
                } else {
                    Banner.Instance.ShowVideoAd(() => {
                        let count = XGTS_DataManager.GetSafeBoxAdTimes(event.target.name);
                        XGTS_DataManager.SetSafeBoxAdTimes(event.target.name, count + 1);
                        this.Refresh();
                    });
                }
                break;
        }
    }
}