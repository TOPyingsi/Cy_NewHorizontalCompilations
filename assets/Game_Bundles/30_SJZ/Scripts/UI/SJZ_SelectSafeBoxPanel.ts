import { _decorator, Component, Label, Node, Event, Prefab, instantiate, math, Vec2, v2, v3, Size, resources, Vec3, Sprite, SpriteFrame } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { SJZ_ItemData } from '../SJZ_Data';
import { SJZ_UIManager } from './SJZ_UIManager';
import { SJZ_Constant } from '../SJZ_Constant';
import { SJZ_DataManager } from '../SJZ_DataManager';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import Banner from 'db://assets/Scripts/Banner';
import { SJZ_Audio, SJZ_AudioManager } from '../SJZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZ_SelectSafeBoxPanel')
export default class SJZ_SelectSafeBoxPanel extends PanelBase {
    Panel: Node = null;

    Buttons: Node = null;

    callback: Function = null;

    protected onLoad(): void {
        this.Panel = NodeUtil.GetNode("Panel", this.node);
        this.Buttons = NodeUtil.GetNode("Buttons", this.node);
    }

    Show(callback: Function): void {
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
                    unlock = SJZ_DataManager.GetSafeBoxUnlock(node.name);
                    if (unlock) {
                        btnStr = "进阶安全箱";
                    } else {
                        btnStr = `(${SJZ_DataManager.GetSafeBoxAdTimes(node.name)}/3)进阶安全箱`;
                    }
                    break;
                case "SafeBox_2":
                    unlock = SJZ_DataManager.GetSafeBoxUnlock(node.name);
                    if (unlock) {
                        btnStr = "高级安全箱";
                    } else {
                        btnStr = `(${SJZ_DataManager.GetSafeBoxAdTimes(node.name)}/6)高级安全箱`;
                    }
                    break;
                case "SafeBox_3":
                    unlock = SJZ_DataManager.GetSafeBoxUnlock(node.name);
                    if (unlock) {
                        btnStr = "顶级安全箱";
                    } else {
                        btnStr = `(${SJZ_DataManager.GetSafeBoxAdTimes(node.name)}/9)顶级安全箱`;
                    }
                    break;
            }

            node.getChildByName("ButtonLabel").getComponent(Label).string = btnStr;
            node.getChildByName("Lock").active = !unlock;
            node.getChildByName("Ad").active = !unlock;
        }
    }

    OnButtonClick(event: Event) {
        SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.ButtonClick);


        switch (event.target.name) {
            case "Mask":
                SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.SelectSafeBoxPanel);
                break;
            case "SafeBox_0":
                if (SJZ_DataManager.PlayerData.SafeBox.ItemData.length > 0) {
                    UIManager.ShowTip("安全箱内还有物品");
                    return;
                }
                SJZ_DataManager.PlayerData.SetSafeBox(2, 1);
                this.callback && this.callback();
                SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.SelectSafeBoxPanel);
                SJZ_DataManager.SaveData();
                break;
            case "SafeBox_1":
                if (SJZ_DataManager.GetSafeBoxUnlock(event.target.name)) {
                    if (SJZ_DataManager.PlayerData.SafeBox.ItemData.length > 0) {
                        UIManager.ShowTip("安全箱内还有物品");
                        return;
                    }

                    SJZ_DataManager.PlayerData.SetSafeBox(2, 2);
                    this.callback && this.callback();
                    SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.SelectSafeBoxPanel);
                    SJZ_DataManager.SaveData();
                } else {
                    Banner.Instance.ShowVideoAd(() => {
                        let count = SJZ_DataManager.GetSafeBoxAdTimes(event.target.name);
                        SJZ_DataManager.SetSafeBoxAdTimes(event.target.name, count + 1);
                        this.Refresh();
                    });
                }
                break;
            case "SafeBox_2":
                if (SJZ_DataManager.GetSafeBoxUnlock(event.target.name)) {
                    if (SJZ_DataManager.PlayerData.SafeBox.ItemData.length > 0) {
                        UIManager.ShowTip("安全箱内还有物品");
                        return;
                    }
                    SJZ_DataManager.PlayerData.SetSafeBox(3, 2);
                    this.callback && this.callback();
                    SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.SelectSafeBoxPanel);
                    SJZ_DataManager.SaveData();
                } else {
                    Banner.Instance.ShowVideoAd(() => {
                        let count = SJZ_DataManager.GetSafeBoxAdTimes(event.target.name);
                        SJZ_DataManager.SetSafeBoxAdTimes(event.target.name, count + 1);
                        this.Refresh();
                    });
                }
                break;
            case "SafeBox_3":
                if (SJZ_DataManager.GetSafeBoxUnlock(event.target.name)) {
                    if (SJZ_DataManager.PlayerData.SafeBox.ItemData.length > 0) {
                        UIManager.ShowTip("安全箱内还有物品");
                        return;
                    }
                    SJZ_DataManager.PlayerData.SetSafeBox(3, 3);
                    this.callback && this.callback();
                    SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.SelectSafeBoxPanel);
                    SJZ_DataManager.SaveData();
                } else {
                    Banner.Instance.ShowVideoAd(() => {
                        let count = SJZ_DataManager.GetSafeBoxAdTimes(event.target.name);
                        SJZ_DataManager.SetSafeBoxAdTimes(event.target.name, count + 1);
                        this.Refresh();
                    });
                }
                break;
        }
    }
}