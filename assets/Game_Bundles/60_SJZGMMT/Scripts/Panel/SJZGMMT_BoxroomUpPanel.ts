import { _decorator, Color, Component, director, EventTouch, Label, Node, Sprite, SpriteFrame } from 'cc';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { SJZGMMT_UIManager } from '../SJZGMMT_UIManager';
import { SJZGMMT_Constant } from '../SJZGMMT_Constant';
import { SJZGMMT_Incident } from '../SJZGMMT_Incident';
import { SJZGMMT_GameData } from '../SJZGMMT_GameData';
import { SJZGMMT_EventManager } from '../SJZGMMT_EventManager';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_BoxroomUpPanel')
export class SJZGMMT_BoxroomUpPanel extends PanelBase {
    private Name: string = "";
    private Level: number = 0;
    private PropNum: number = 0;//仓库数量
    private PropUpNum: number = 0;//升级需要的数量
    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
        this.Init(args[0]);

    }
    //初始化
    Init(Name: string) {
        this.Name = Name;
        this.Level = SJZGMMT_GameData.Instance.GetBoxroomLevelByName(Name);
        this.PropNum = SJZGMMT_GameData.Instance.getWarehouseNum(Name);
        this.PropUpNum = this.Level * 2 + 1;
        SJZGMMT_UIManager.Instance.GetPropSprite(Name).then((sp: SpriteFrame) => {
            this.node.getChildByPath("框/小图框/小图").getComponent(Sprite).spriteFrame = sp;
        })
        let data = SJZGMMT_Constant.getPropDataByName(Name);
        SJZGMMT_Incident.LoadSprite("Sprites/仓库/" + SJZGMMT_Constant.QuaLityList[data.quality]).then((sp: SpriteFrame) => {
            this.node.getChildByPath("框/小图框").getComponent(Sprite).spriteFrame = sp;
        })
        this.node.getChildByPath("框/名称").getComponent(Label).string = Name;
        this.node.getChildByPath("框/描述").getComponent(Label).string = data.description;
        this.node.getChildByPath("框/升级/数量").getComponent(Label).string = `${this.PropNum}/${this.PropUpNum}`;
        if (this.PropNum >= this.PropUpNum) {
            this.node.getChildByPath("框/升级/数量").getComponent(Label).color = new Color(0, 255, 0, 255);
        } else {
            this.node.getChildByPath("框/升级/数量").getComponent(Label).color = new Color(255, 0, 0, 255);
        }
        if (this.Level >= 3) {
            this.node.getChildByPath("框/已满级").active = true;
            this.node.getChildByPath("框/升级").active = false;
        } else {
            this.node.getChildByPath("框/已满级").active = false;
            this.node.getChildByPath("框/升级").active = true;
        }
    }

    OnButtonClick(event: EventTouch) {
        SJZGMMT_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "关闭":
                SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.BoxroomUpPanel);
                break;
            case "取出":
                let num = this.Level * this.Level;
                SJZGMMT_GameData.Instance.pushWarehouseData(this.Name, num);
                SJZGMMT_GameData.Instance.BoxroomLevelToZero(this.Name);
                director.getScene().emit(SJZGMMT_EventManager.收藏馆物品变动, this.Name);
                SJZGMMT_UIManager.Instance.ShowText("已全部取出到仓库！");
                SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.BoxroomUpPanel);
                break;
            case "升级":
                if (this.PropNum >= this.PropUpNum) {
                    SJZGMMT_GameData.Instance.UpBoxroomLevel(this.Name);
                    SJZGMMT_GameData.Instance.SubWarehouseData(this.Name, this.PropUpNum);
                    SJZGMMT_UIManager.Instance.ShowText("升级成功！");
                    director.getScene().emit(SJZGMMT_EventManager.收藏馆物品变动, this.Name);
                    SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.BoxroomUpPanel);
                } else {
                    SJZGMMT_UIManager.Instance.ShowText("数量不足！");
                }
                break;
        }
    }

}


