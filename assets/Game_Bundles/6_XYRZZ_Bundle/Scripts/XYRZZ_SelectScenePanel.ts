import { _decorator, Color, color, Component, EventTouch, Label, Node, Sprite, SpriteFrame } from 'cc';
import { XYRZZ_Panel, XYRZZ_UIManager } from './XYRZZ_UIManager';
import { XYRZZ_Incident } from './XYRZZ_Incident';
import { XYRZZ_GameData } from './XYRZZ_GameData';
import { XYRZZ_AudioManager } from './XYRZZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYRZZ_SelectScenePanel')
export class XYRZZ_SelectScenePanel extends Component {
    public placeName: string[] = ["荒废水库", "海峡大坝", "东海水域", "无极西湖", "贺强渔场", "蓬莱海域", "昆仑仙海", "混沌海域"];
    public placeNum: number = 0;
    public Index: number = 0;
    Show() {
        this.placeNum = this.placeName.length;
        this.ShowUI();
    }

    OnbuttonClick(btn: EventTouch) {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        switch (btn.target.name) {
            case "叉号":
                XYRZZ_UIManager.Instance.HidePanel(XYRZZ_Panel.XYRZZ_SelectScenePanel);
                break;
            case "左翻页":
                this.Index--;
                if (this.Index < 0) this.Index = this.placeNum - 1;
                this.ShowUI();
                break;
            case "右翻页":
                this.Index++;
                if (this.Index >= this.placeNum) this.Index = 0;
                this.ShowUI();
                break;
            case "进入区域":
                let FishId: number[] = [this.Index * 3, this.Index * 3 + 1, this.Index * 3 + 2];
                let num = FishId[Math.floor(Math.random() * 3)];
                XYRZZ_UIManager.Instance.HidePanel(XYRZZ_Panel.XYRZZ_SelectScenePanel);
                XYRZZ_UIManager.Instance.ShowPanel(XYRZZ_Panel.XYRZZ_CombatPanel, [num]);
                break;
        }

    }

    //根据index刷新界面
    ShowUI() {
        XYRZZ_Incident.LoadSprite("UI/选关界面/渔场图/" + this.placeName[this.Index]).then((sp: SpriteFrame) => {
            this.node.getChildByPath("图片").getComponent(Sprite).spriteFrame = sp;
        })
        let FishId: number[] = [this.Index * 3, this.Index * 3 + 1, this.Index * 3 + 2];
        let UnLookNumber: number = 0;//解锁数量
        FishId.forEach((id, index) => {
            XYRZZ_Incident.LoadSprite("UI/图鉴鱼/" + id).then((sp: SpriteFrame) => {
                this.node.getChildByPath("鱼" + index).getComponent(Sprite).spriteFrame = sp;
            })
            if (XYRZZ_GameData.Instance.FishRecord[id] > 0) {//解锁
                this.node.getChildByPath("鱼" + index).getComponent(Sprite).color = new Color(255, 255, 255, 255);
                UnLookNumber++;
            } else {//未解锁
                this.node.getChildByPath("鱼" + index).getComponent(Sprite).color = new Color(0, 0, 0, 180);
            }
        })
        this.node.getChildByPath("绿色背景/解锁鱼数量").getComponent(Label).string = `钓到的种类(${UnLookNumber}/3)`;
        this.node.getChildByPath("区域文字框/区域文字").getComponent(Label).string = `区域编号：${this.Index + 1}`;
    }


}


