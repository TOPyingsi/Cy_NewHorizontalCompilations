import { _decorator, Component, EventTouch, Label, Node, Sprite, SpriteFrame } from 'cc';
import { XYRZZ_Panel, XYRZZ_UIManager } from './XYRZZ_UIManager';
import { XYRZZ_Constant } from './Data/XYRZZ_Constant';
import { XYRZZ_Incident } from './XYRZZ_Incident';
import { XYRZZ_GameData } from './XYRZZ_GameData';
import { XYRZZ_EventManager, XYRZZ_MyEvent } from './XYRZZ_EventManager';
import { XYRZZ_AudioManager } from './XYRZZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYRZZ_PropMessage')
export class XYRZZ_PropMessage extends Component {
    public id: number = 0;
    public Level: number = 0;
    public UpLevelMoney: number = 0;

    Show(id: number) {
        this.id = id;
        //初始化数据
        if (XYRZZ_Constant.PropData[id].LevelUpMoney == 0) {//无升级道具
            this.Init(false);
        } else {//升级道具
            this.Init(true);
        }
    }
    OnbuttonClick(btn: EventTouch) {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        switch (btn.target.name) {
            case "叉号":
                XYRZZ_UIManager.Instance.HidePanel(XYRZZ_Panel.XYRZZ_PropMessage);
                break;
            case "升级":
                this.UpLevel();
                break;
        }

    }
    //点击升级
    UpLevel() {
        if (XYRZZ_GameData.Instance.PropData[this.id].Level > 99) {
            XYRZZ_UIManager.HopHint("道具等级已满,无法升级！");
            return;
        }
        if (XYRZZ_GameData.Instance.Money >= this.UpLevelMoney) {
            XYRZZ_GameData.Instance.Money -= this.UpLevelMoney;
            XYRZZ_GameData.Instance.PropData[this.id].Level += 1;
            XYRZZ_EventManager.Scene.emit(XYRZZ_MyEvent.改变单次收益);
            XYRZZ_UIManager.HopHint("升级成功！");
            this.Init(true);
        } else {
            XYRZZ_UIManager.HopHint("钱币不足，无法升级！");
        }
    }

    //显示名字图标和描述
    Init(isLevelupProp: boolean) {
        this.node.getChildByPath("框/等级").active = isLevelupProp;
        this.node.getChildByPath("框/钱币加成").active = isLevelupProp;
        this.node.getChildByPath("框/提升所需").active = isLevelupProp;
        this.node.getChildByPath("框/钞票").active = isLevelupProp;
        this.node.getChildByPath("框/钞票数量").active = isLevelupProp;
        this.node.getChildByPath("框/升级").active = isLevelupProp;
        XYRZZ_Incident.LoadSprite(`UI/背包/${XYRZZ_Constant.PropData[this.id].Name}缩略图`).then((sp: SpriteFrame) => {
            this.node.getChildByPath("框/道具图标/道具图").getComponent(Sprite).spriteFrame = sp;
        });
        this.node.getChildByPath("框/描述").getComponent(Label).string = `${XYRZZ_Constant.PropData[this.id].describe}`;
        this.node.getChildByPath("框/道具名").getComponent(Label).string = `${XYRZZ_Constant.PropData[this.id].Name}`;
        if (isLevelupProp) {//如果是升级道具
            this.Level = XYRZZ_GameData.Instance.PropData[this.id].Level;
            this.UpLevelMoney = Math.pow(this.Level, 4) * XYRZZ_Constant.PropData[this.id].LevelUpMoney;
            this.node.getChildByPath("框/等级").getComponent(Label).string = `LV.${this.Level}`;
            this.node.getChildByPath("框/钱币加成").getComponent(Label).string = `钱币加成：${this.Level * XYRZZ_Constant.PropData[this.id].MoneyBuff}%`;
            this.node.getChildByPath("框/钞票数量").getComponent(Label).string = `X${XYRZZ_Incident.GetMaxNum(this.UpLevelMoney)}`;
        }
    }
}
