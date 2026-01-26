import { _decorator, Color, Component, EventTouch, instantiate, Label, Node, Prefab, UITransform } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZXD_UIManager } from '../SJZXD_UIManager';
import { SJZXD_Constant } from '../SJZXD_Constant';
import { SJZXD_GameData } from '../SJZXD_GameData';
import { SJZXD_Incident } from '../SJZXD_Incident';
import { SJZXD_PropBox } from '../SJZXD_PropBox';
import { SJZXD_GameManager } from '../SJZXD_GameManager';
import { SJZXD_AudioManager } from '../SJZXD_AudioManager';
import Banner from 'db://assets/Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_SettleAccountsPanel')
export class SJZXD_SettleAccountsPanel extends PanelBase {
    @property(Node)
    public PropContent: Node = null;
    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
        this.ShowData();
    }
    start() {

    }

    OnButtonClick(event: EventTouch) {
        SJZXD_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "找回遗失":
                Banner.Instance.ShowVideoAd(() => {
                    SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.SettleAccountsPanel);
                    SJZXD_GameData.Instance.GetLostDataProp();
                })
                break;
            case "返回主页": SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.SettleAccountsPanel); break;
        }
    }

    //刷新数据
    ShowData() {
        let IsWin = SJZXD_GameData.Instance.GameData[0] == 0;
        this.node.getChildByPath("框/底纹/撤离失败底纹").active = !IsWin;
        this.node.getChildByPath("框/底纹/撤离成功底纹").active = IsWin;
        this.node.getChildByPath("框/道具框/底框/遗失物品").active = !IsWin;
        this.node.getChildByPath("框/道具框/底框/恭喜获得").active = IsWin;
        this.node.getChildByPath("框/文字/撤离失败").active = !IsWin;
        this.node.getChildByPath("框/文字/撤离成功").active = IsWin;
        this.node.getChildByPath("框/底部按钮/找回遗失").active = !IsWin;
        this.node.getChildByPath("框/收益/数量").getComponent(Label).color = IsWin ? new Color("00FF48") : new Color("FF0000");
        this.node.getChildByPath("框/击败敌人/数量").getComponent(Label).string = `${SJZXD_GameManager.KillEnemy}`;
        let PropArray: string[] = [];
        if (IsWin) {
            PropArray = [...SJZXD_GameData.Instance.KnapsackData];
            SJZXD_GameData.Instance.LoseData = [...PropArray];
            this.node.getChildByPath("框/收益/数量").getComponent(Label).string = `${SJZXD_Incident.GetMaxNum(SJZXD_Incident.GetPropValue(PropArray))}`;
            SJZXD_GameData.Instance.MoveAllKnapsackToWarehouse();
        } else {
            PropArray = [...SJZXD_GameData.Instance.KnapsackData];
            SJZXD_GameData.Instance.PlayerData.forEach((element, index) => {
                if (element != "无") {
                    PropArray.push(element);
                }
            });
            SJZXD_GameData.Instance.LoseData = [...PropArray];
            this.node.getChildByPath("框/收益/数量").getComponent(Label).string = `-${SJZXD_Incident.GetMaxNum(SJZXD_Incident.GetPropValue(PropArray))}`;
            SJZXD_GameData.Instance.ClearEquip();
        }
        this.PropContent.removeAllChildren();
        SJZXD_Incident.Loadprefab("Prefabs/UI/PropBox").then((pre: Prefab) => {
            PropArray.forEach((element, index) => {
                let nd = instantiate(pre);
                nd.setParent(this.PropContent);
                nd.getComponent(SJZXD_PropBox).Show(PropArray[index], 1, true);
            });
            this.PropContent.getComponent(UITransform).height = Math.ceil(this.PropContent.children.length / 4) * 228 + 15;
        })

    }


}


