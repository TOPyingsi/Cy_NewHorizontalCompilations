import { _decorator, Color, Component, EventTouch, instantiate, Label, Node, Prefab, UITransform, v3 } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZGMMT_UIManager } from '../SJZGMMT_UIManager';
import { SJZGMMT_Constant } from '../SJZGMMT_Constant';
import { SJZGMMT_GameData } from '../SJZGMMT_GameData';
import { SJZGMMT_Incident } from '../SJZGMMT_Incident';
import { SJZGMMT_PropBox } from '../SJZGMMT_PropBox';
import { SJZGMMT_GameManager } from '../SJZGMMT_GameManager';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';
import Banner from 'db://assets/Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_SettleAccountsPanel')
export class SJZGMMT_SettleAccountsPanel extends PanelBase {
    @property(Node)
    public PropContent: Node = null;
    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
        this.ShowData();
    }
    start() {

    }

    OnButtonClick(event: EventTouch) {
        SJZGMMT_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "找回遗失":
                Banner.Instance.ShowVideoAd(() => {
                    SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.SettleAccountsPanel);
                    SJZGMMT_GameData.Instance.GetLostDataProp();
                })
                break;
            case "返回主页": SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.SettleAccountsPanel); break;
        }
    }

    //刷新数据
    ShowData() {
        let IsWin = SJZGMMT_GameData.Instance.GameData[0] == 0;
        this.node.getChildByPath("框/撤离成功图").active = IsWin;
        this.node.getChildByPath("框/道具框/底框/遗失物品").active = !IsWin;
        this.node.getChildByPath("框/道具框/底框/恭喜获得").active = IsWin;
        this.node.getChildByPath("框/文字/撤离失败").active = !IsWin;
        this.node.getChildByPath("框/文字/撤离成功").active = IsWin;
        this.node.getChildByPath("框/底部按钮/找回遗失").active = !IsWin;
        this.node.getChildByPath("框/底部按钮/返回主页").position = IsWin ? v3(0, 0, 0) : v3(-222, 0, 0);
        this.node.getChildByPath("框/收益/数量").getComponent(Label).color = IsWin ? new Color("00FF48") : new Color("FF0000");
        this.node.getChildByPath("框/击败敌人/数量").getComponent(Label).string = `${SJZGMMT_GameManager.KillEnemy}`;
        let PropArray: string[] = [];
        if (IsWin) {
            PropArray = [...SJZGMMT_GameData.Instance.KnapsackData];
            SJZGMMT_GameData.Instance.LoseData = [...PropArray];
            this.node.getChildByPath("框/收益/数量").getComponent(Label).string = `${SJZGMMT_Incident.GetMaxNum(SJZGMMT_Incident.GetPropValue(PropArray))}`;
            SJZGMMT_GameData.Instance.MoveAllKnapsackToWarehouse();
        } else {
            PropArray = [...SJZGMMT_GameData.Instance.KnapsackData];
            SJZGMMT_GameData.Instance.PlayerData.forEach((element, index) => {
                if (element != "无") {
                    PropArray.push(element);
                }
            });
            SJZGMMT_GameData.Instance.LoseData = [...PropArray];
            this.node.getChildByPath("框/收益/数量").getComponent(Label).string = `-${SJZGMMT_Incident.GetMaxNum(SJZGMMT_Incident.GetPropValue(PropArray))}`;
            SJZGMMT_GameData.Instance.ClearEquip();
        }
        this.PropContent.removeAllChildren();
        SJZGMMT_Incident.Loadprefab("Prefabs/UI/PropBox").then((pre: Prefab) => {
            PropArray.forEach((element, index) => {
                let nd = instantiate(pre);
                nd.setParent(this.PropContent);
                nd.getComponent(SJZGMMT_PropBox).Show(PropArray[index], 1, true);
            });
            this.PropContent.getComponent(UITransform).height = Math.ceil(this.PropContent.children.length / 4) * 228 + 15;
        })

    }


}


