import { _decorator, Color, Component, director, EventTouch, Label, Node, Sprite, SpriteFrame } from 'cc';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { SJZXD_UIManager } from '../SJZXD_UIManager';
import { SJZXD_Constant } from '../SJZXD_Constant';
import { SJZXD_Incident } from '../SJZXD_Incident';
import { SJZXD_GameData } from '../SJZXD_GameData';
import { SJZXD_EventManager } from '../SJZXD_EventManager';
import { SJZXD_AudioManager } from '../SJZXD_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_BoxroomUpPanel')
export class SJZXD_BoxroomUpPanel extends PanelBase {
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
        this.Level = SJZXD_GameData.Instance.GetBoxroomLevelByName(Name);
        this.PropNum = SJZXD_GameData.Instance.getWarehouseNum(Name);
        this.PropUpNum = this.Level * 2 + 1;
        SJZXD_UIManager.Instance.GetPropSprite(Name).then((sp: SpriteFrame) => {
            this.node.getChildByPath("框/小图框/小图").getComponent(Sprite).spriteFrame = sp;
        })
        let data = SJZXD_Constant.getPropDataByName(Name);
        SJZXD_Incident.LoadSprite("Sprites/仓库/" + SJZXD_Constant.QuaLityList[data.quality]).then((sp: SpriteFrame) => {
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
        SJZXD_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "关闭":
                SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.BoxroomUpPanel);
                break;
            case "取出":
                let num = this.Level * this.Level;
                SJZXD_GameData.Instance.pushWarehouseData(this.Name, num);
                SJZXD_GameData.Instance.BoxroomLevelToZero(this.Name);
                director.getScene().emit(SJZXD_EventManager.收藏馆物品变动, this.Name);
                SJZXD_UIManager.Instance.ShowText("已全部取出到仓库！");
                SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.BoxroomUpPanel);
                break;
            case "升级":
                if (this.PropNum >= this.PropUpNum) {
                    SJZXD_GameData.Instance.UpBoxroomLevel(this.Name);
                    SJZXD_GameData.Instance.SubWarehouseData(this.Name, this.PropUpNum);
                    SJZXD_UIManager.Instance.ShowText("升级成功！");
                    director.getScene().emit(SJZXD_EventManager.收藏馆物品变动, this.Name);
                    SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.BoxroomUpPanel);
                } else {
                    SJZXD_UIManager.Instance.ShowText("数量不足！");
                }
                break;
        }
    }

}


