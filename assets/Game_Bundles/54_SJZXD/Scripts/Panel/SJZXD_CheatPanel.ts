import { _decorator, Component, director, EventTouch, Label, Node } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZXD_UIManager } from '../SJZXD_UIManager';
import { SJZXD_Constant } from '../SJZXD_Constant';
import Banner from '../../../../Scripts/Banner';
import { SJZXD_GameData } from '../SJZXD_GameData';
import { SJZXD_AudioManager } from '../SJZXD_AudioManager';
import { SJZXD_GameManager } from '../SJZXD_GameManager';
import { SJZXD_Unit } from '../SJZXD_Unit';
import { SJZXD_EventManager } from '../SJZXD_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_CheatPanel')
export class SJZXD_CheatPanel extends PanelBase {
    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
    }


    OnButtonClick(event: EventTouch) {
        SJZXD_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "关闭":
                SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.CheatPanel);
                break;
            case "增加道具":
                SJZXD_GameData.Instance.pushWarehouseData(
                    this.node.getChildByPath("框/获得道具/道具名/TEXT_LABEL").getComponent(Label).string,
                    Number(this.node.getChildByPath("框/获得道具/数量/TEXT_LABEL").getComponent(Label).string),
                );
                SJZXD_UIManager.Instance.ShowText("已添加道具");
                break;
            case "所有道具加一":
                for (let i = 0; i < SJZXD_Constant.PropData.length; i++) {
                    SJZXD_GameData.Instance.pushWarehouseData(
                        SJZXD_Constant.PropData[i].Name,
                        1,
                    );
                }
                SJZXD_UIManager.Instance.ShowText("已添加道具");
                break;
            case "超级血量":
                SJZXD_GameManager.Instance.PlayerNode.getComponent(SJZXD_Unit).Hp = 999999999;
                SJZXD_GameManager.Instance.PlayerNode.getComponent(SJZXD_Unit).MaxHp = 999999999;
                SJZXD_UIManager.Instance.ShowText("超级血量！");
                break;
            case "超级伤害":
                SJZXD_GameManager.Instance.PlayerNode.getComponent(SJZXD_Unit).Weapon.SetAttack(999999999)
                SJZXD_UIManager.Instance.ShowText("超级伤害！");
                break;
            case "超级速度":
                SJZXD_GameManager.Instance.PlayerNode.getComponent(SJZXD_Unit).AddBuff("增加移速", 1000, 999999);
                SJZXD_UIManager.Instance.ShowText("超级速度！");
                break;
            case "技能无CD":
                director.getScene().emit(SJZXD_EventManager.技能无CD);
                SJZXD_UIManager.Instance.ShowText("技能无CD!");
                break;
            case "关卡全解锁":
                SJZXD_GameData.Instance.UnlockScene = ["荒野营地", "沙漠遗迹", "修狗小镇", "军事基地", "实验室"];
                SJZXD_UIManager.Instance.ShowText("关卡全解锁!");
                break;
        }
    }
}


