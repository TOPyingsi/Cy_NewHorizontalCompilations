import { _decorator, Button, Component, EventTouch, instantiate, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { XYRZZ_Constant } from './XYRZZ_Constant';
import { XYRZZ_GameData } from '../XYRZZ_GameData';
import { XYRZZ_Incident } from '../XYRZZ_Incident';
import { XYRZZ_Panel, XYRZZ_UIManager } from '../XYRZZ_UIManager';
import { XYRZZ_GameManager } from '../Game/XYRZZ_GameManager';
import { XYRZZ_MainPlayer } from '../XYRZZ_MainPlayer';
import { XYRZZ_AudioManager } from '../XYRZZ_AudioManager';
import Banner from '../../../../Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('XYRZZ_FigurePanel')
export class XYRZZ_FigurePanel extends Component {


    public plaerNum: number = 4;//一共有多少角色
    public Index: number = 0;//一共有多少角色
    public IndexOfFishingPole: number[] = [0, 1, 2, 3];//角色对应的钓法ID
    Show() {
        this.ShowPanel();
    }

    //按钮事件
    OnbuttonClick(btn: EventTouch) {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        switch (btn.target.name) {
            case "左翻页":
                this.Index--;
                this.ShowPanel();
                break;
            case "右翻页":
                this.Index++;
                this.ShowPanel();
                break;
            case "叉号":
                XYRZZ_UIManager.Instance.HidePanel(XYRZZ_Panel.XYRZZ_FigurePanel);
                break;
            case "解锁":
                Banner.Instance.ShowVideoAd(() => {
                    let FishingPoleName: string = XYRZZ_Constant.PlayerData[this.Index].FishingPoleName;//技能名字
                    XYRZZ_Constant.GetTableData(XYRZZ_GameData.Instance.FishingPoleDataLevel, "Name", FishingPoleName).Level = 1;
                    XYRZZ_UIManager.HopHint("解锁成功！");
                    this.ShowPanel();
                })
                break;
            case "上场":
                XYRZZ_GameData.Instance.GameData[0] = this.Index;
                XYRZZ_GameManager.Instance.SetMainPlayer();
                this.ShowPanel();
                XYRZZ_UIManager.HopHint("上场成功！");
                break;
            case "升级":
                XYRZZ_UIManager.Instance.ShowPanel(XYRZZ_Panel.XYRZZ_FishingPoleMessage, [this.IndexOfFishingPole[this.Index]]);
                break;
        }

    }



    //角色翻页
    ShowPanel() {
        this.ButtomShow();
        this.node.getChildByPath("框/进度").getComponent(Label).string = `-${this.Index + 1}/${this.plaerNum}-`;
        let Name: string = XYRZZ_Constant.PlayerData[this.Index].Name;//名字
        this.node.getChildByPath("框/名字").getComponent(Label).string = Name;
        let FishingPoleName: string = XYRZZ_Constant.PlayerData[this.Index].FishingPoleName;//技能名字
        let FishingPoleLevel: number = XYRZZ_Constant.GetTableData(XYRZZ_GameData.Instance.FishingPoleDataLevel, "Name", FishingPoleName).Level;//技能等级
        this.node.getChildByPath("框/LV").getComponent(Label).string = `LV.${FishingPoleLevel}`;
        this.node.getChildByPath("框/技能框/技能名").getComponent(Label).string = `自带钓法：${FishingPoleName}`;
        XYRZZ_Incident.LoadSprite("UI/人物界面/" + Name).then((sp: SpriteFrame) => {
            this.node.getChildByPath("框/人").getComponent(Sprite).spriteFrame = sp;
        });
        this.ShowButtom(XYRZZ_Constant.GetTableData(XYRZZ_Constant.FishingPoleData, "Name", FishingPoleName).Data);
        //显示解锁还是上场升级
        if (FishingPoleLevel == 0) {
            this.node.getChildByPath("框/解锁").active = true;
            this.node.getChildByPath("框/上场").active = false;
            this.node.getChildByPath("框/升级").active = false;
        } else {
            this.node.getChildByPath("框/解锁").active = false;
            this.node.getChildByPath("框/上场").active = true;
            this.node.getChildByPath("框/升级").active = true;
        }
    }

    //左右按钮判断
    ButtomShow() {
        if (this.Index == 0) {
            this.node.getChildByPath("框/左翻页").getComponent(Sprite).grayscale = true;
            this.node.getChildByPath("框/左翻页").getComponent(Button).enabled = false;
        } else {
            this.node.getChildByPath("框/左翻页").getComponent(Sprite).grayscale = false;
            this.node.getChildByPath("框/左翻页").getComponent(Button).enabled = true;
        }
        if (this.Index == this.plaerNum - 1) {
            this.node.getChildByPath("框/右翻页").getComponent(Sprite).grayscale = true;
            this.node.getChildByPath("框/右翻页").getComponent(Button).enabled = false;
        } else {
            this.node.getChildByPath("框/右翻页").getComponent(Sprite).grayscale = false;
            this.node.getChildByPath("框/右翻页").getComponent(Button).enabled = true;
        }
    }

    //根据指令生成按键
    ShowButtom(Data: string) {
        let Content: Node = this.node.getChildByPath("框/技能框/Content");
        Content.removeAllChildren();
        XYRZZ_Incident.Loadprefab("Prefabs/按键").then((prefab: Prefab) => {
            for (let i = 0; i < Data.length; i++) {
                let pre = instantiate(prefab);
                pre.setParent(Content);
                XYRZZ_Incident.LoadSprite("UI/人物界面/" + Data.charAt(i)).then((sp: SpriteFrame) => {
                    pre.getComponent(Sprite).spriteFrame = sp;
                })
            }
        })
    }
}


