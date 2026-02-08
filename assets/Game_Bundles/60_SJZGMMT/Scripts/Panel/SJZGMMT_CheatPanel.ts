import { _decorator, Component, director, EventTouch, Label, Node } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZGMMT_UIManager } from '../SJZGMMT_UIManager';
import { SJZGMMT_Constant } from '../SJZGMMT_Constant';
import Banner from '../../../../Scripts/Banner';
import { SJZGMMT_GameData } from '../SJZGMMT_GameData';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';
import { SJZGMMT_GameManager } from '../SJZGMMT_GameManager';
import { SJZGMMT_Unit } from '../SJZGMMT_Unit';
import { SJZGMMT_EventManager } from '../SJZGMMT_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_CheatPanel')
export class SJZGMMT_CheatPanel extends PanelBase {
    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
    }


    OnButtonClick(event: EventTouch) {
        SJZGMMT_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "关闭":
                SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.CheatPanel);
                break;
            case "增加道具":
                SJZGMMT_GameData.Instance.pushWarehouseData(
                    this.node.getChildByPath("框/获得道具/道具名/TEXT_LABEL").getComponent(Label).string,
                    Number(this.node.getChildByPath("框/获得道具/数量/TEXT_LABEL").getComponent(Label).string),
                );
                SJZGMMT_UIManager.Instance.ShowText("已添加道具");
                break;
            case "所有道具加一":
                for (let i = 0; i < SJZGMMT_Constant.PropData.length; i++) {
                    SJZGMMT_GameData.Instance.pushWarehouseData(
                        SJZGMMT_Constant.PropData[i].Name,
                        1,
                    );
                }
                SJZGMMT_UIManager.Instance.ShowText("已添加道具");
                break;
            case "超级血量":
                SJZGMMT_GameManager.Instance.PlayerNode.getComponent(SJZGMMT_Unit).Hp = 999999999;
                SJZGMMT_GameManager.Instance.PlayerNode.getComponent(SJZGMMT_Unit).MaxHp = 999999999;
                SJZGMMT_UIManager.Instance.ShowText("超级血量！");
                break;
            case "超级伤害":
                SJZGMMT_GameManager.Instance.PlayerNode.getComponent(SJZGMMT_Unit).Weapon.SetAttack(999999999)
                SJZGMMT_UIManager.Instance.ShowText("超级伤害！");
                break;
            case "超级速度":
                SJZGMMT_GameManager.Instance.PlayerNode.getComponent(SJZGMMT_Unit).AddBuff("增加移速", 1000, 999999);
                SJZGMMT_UIManager.Instance.ShowText("超级速度！");
                break;
            case "技能无CD":
                director.getScene().emit(SJZGMMT_EventManager.技能无CD);
                SJZGMMT_UIManager.Instance.ShowText("技能无CD!");
                break;
            case "关卡全解锁":
                SJZGMMT_GameData.Instance.UnlockScene = ["锢灵青铜墟", "千机悬魂殿", "渊龙沉骨陵", "鬼哭矿髓渊", "阴阳逆煞墟"];
                SJZGMMT_UIManager.Instance.ShowText("关卡全解锁!");
                break;
        }
    }
}


