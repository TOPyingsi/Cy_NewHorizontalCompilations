import { _decorator, color, Color, Component, EventTouch, Label, Node, Sprite, SpriteFrame } from 'cc';
import { XYRZZ_Panel, XYRZZ_UIManager } from './XYRZZ_UIManager';
import { XYRZZ_Constant } from './Data/XYRZZ_Constant';
import { XYRZZ_GameData } from './XYRZZ_GameData';
import { XYRZZ_Incident } from './XYRZZ_Incident';
import { XYRZZ_AudioManager } from './XYRZZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYRZZ_Handbook')
export class XYRZZ_Handbook extends Component {
    public FishMaxNumber: number = 0;//鱼的数量
    public Index: number = 0;//当前所在页码

    Show() {
        this.FishMaxNumber = XYRZZ_Constant.FishData.length;
        this.ShowUI();
    }

    OnbuttonClick(btn: EventTouch) {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        switch (btn.target.name) {
            case "叉号":
                XYRZZ_UIManager.Instance.HidePanel(XYRZZ_Panel.XYRZZ_Handbook);
                break;
            case "左翻页":
                this.Index--;
                if (this.Index < 0) this.Index = this.FishMaxNumber - 1;
                this.ShowUI();
                break;
            case "右翻页":
                this.Index++;
                if (this.Index >= this.FishMaxNumber) this.Index = 0;
                this.ShowUI();
                break;
        }

    }

    //根据页码刷新当前页面
    ShowUI() {
        let Islook: boolean = XYRZZ_GameData.Instance.FishRecord[this.Index] > 0 ? true : false;//鱼是否已经钓过
        let data = XYRZZ_Constant.FishData[this.Index];
        if (Islook) {//处理主图
            this.node.getChildByPath("框/鱼背景/鱼图").getComponent(Sprite).color = new Color(255, 255, 255, 255);
            this.node.getChildByPath("框/鱼背景/大问号").active = false;
        } else {
            this.node.getChildByPath("框/鱼背景/鱼图").getComponent(Sprite).color = new Color(0, 0, 0, 120);
            this.node.getChildByPath("框/鱼背景/大问号").active = true;
        }
        if (Islook) {
            this.node.getChildByPath("框/描述框/捕获前标").getComponent(Sprite).color = new Color(66, 183, 157, 255);
            this.node.getChildByPath("框/描述框/是否捕获").getComponent(Label).color = new Color(0, 0, 0, 255);
            this.node.getChildByPath("框/描述框/捕获标识").active = true;
        } else {
            this.node.getChildByPath("框/描述框/捕获前标").getComponent(Sprite).color = new Color(193, 42, 31, 255);
            this.node.getChildByPath("框/描述框/是否捕获").getComponent(Label).color = new Color(193, 42, 31, 255);
            this.node.getChildByPath("框/描述框/捕获标识").active = false;
        }
        XYRZZ_Incident.LoadSprite(`UI/图鉴鱼/${this.Index}`).then((sp: SpriteFrame) => {
            this.node.getChildByPath("框/鱼背景/鱼图").getComponent(Sprite).spriteFrame = sp;
        })
        XYRZZ_Incident.LoadSprite(`龙骨/鱼竿/${data.restrain}`).then((sp: SpriteFrame) => {
            this.node.getChildByPath("框/鱼竿克制/鱼竿图").getComponent(Sprite).spriteFrame = sp;
        })
        this.node.getChildByPath("框/畸变品种/畸变鱼图").getComponent(Sprite).color = new Color(255, 255, 255, 255);

        if (data.variation != "") {//有畸变
            let id = XYRZZ_Constant.FishData.indexOf(XYRZZ_Constant.GetTableData(XYRZZ_Constant.FishData, "Name", data.variation));
            XYRZZ_Incident.LoadSprite(`UI/图鉴鱼/${id}`).then((sp: SpriteFrame) => {
                this.node.getChildByPath("框/畸变品种/畸变鱼图").getComponent(Sprite).spriteFrame = sp;
            })
            if (XYRZZ_GameData.Instance.FishRecord[id] == 0) {//畸变鱼没解锁
                this.node.getChildByPath("框/畸变品种/畸变鱼图").getComponent(Sprite).color = new Color(0, 0, 0, 120);
            }
        } else {
            this.node.getChildByPath("框/畸变品种/畸变鱼图").getComponent(Sprite).spriteFrame = null;
        }

        this.node.getChildByPath("框/鱼名字").getComponent(Label).string = `${data.Name}`;
        this.node.getChildByPath("框/描述框/地区").getComponent(Label).string = `${data.place}`;
        this.node.getChildByPath("框/描述框/是否捕获").getComponent(Label).string = Islook == true ? "已捕获" : "未捕获";
        this.node.getChildByPath("框/描述框/描述").getComponent(Label).string = `${data.describe}`;
        if (Islook) {
            this.node.getChildByPath("框/单价框/Label").getComponent(Label).string = `$  ${data.price}元/斤`;
            this.node.getChildByPath("框/体重框/Label").getComponent(Label).string = `${data.weight}斤`;
        } else {
            this.node.getChildByPath("框/单价框/Label").getComponent(Label).string = `$  ???元/斤`;
            this.node.getChildByPath("框/体重框/Label").getComponent(Label).string = `???斤`;
        }
        this.node.getChildByPath("框/页码").getComponent(Label).string = `${this.Index + 1}/${this.FishMaxNumber}`;
    }

}


