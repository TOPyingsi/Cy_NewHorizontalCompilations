import { _decorator, Component, director, Label, Node, NodeEventType, Sprite, SpriteFrame } from 'cc';
import { HJMSJ_Incident } from '../HJMSJ_Incident';
import { HJMSJ_GameData } from '../HJMSJ_GameData';
import { HJMSJ_GameMgr } from '../HJMSJ_GameMgr';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_Role')
export class HJMSJ_Role extends Component {

    private skinSprite: Sprite = null;
    private skinNameLabel: Label = null;
    private skinStateLabel: Label = null;
    private wearStateLabel: Label = null;


    private skinName: string = "";
    private skinValue: number = 0;
    private skinState: string = "未获得";
    private wearState: string = "未佩戴";
    private skinType: string = "";

    start() {

    }

    onClick() {
        if (this.wearState === "已穿戴") {
            return;
        }

        if (this.skinState === "未获得") {
            let playerPropNum = HJMSJ_GameData.Instance.GetPropNum("绿宝石");
            if (playerPropNum >= this.skinValue) {
                if (HJMSJ_GameData.Instance.SubKnapsackData("绿宝石", this.skinValue)) {
                    HJMSJ_GameMgr.instance.BagMgrTs.subPropByName("绿宝石", this.skinValue);
                    HJMSJ_GameData.Instance.buySkin(this.skinName);

                    UIManager.ShowTip("购买" + this.skinName + "成功！");
                    director.getScene().emit("哈基米世界_刷新皮肤数据");
                }
            }
            else {
                UIManager.ShowTip("购买失败,绿宝石不足！");
            }
        }
        else {
            HJMSJ_GameData.Instance.changeSkin(this.skinName);
            UIManager.ShowTip("已成功穿戴" + this.skinName);
            director.getScene().emit("哈基米世界_刷新皮肤数据");
        }
    }

    initData(data: any) {
        this.skinSprite = this.node.getChildByName("皮肤图片").getComponent(Sprite);
        this.skinNameLabel = this.node.getChildByName("皮肤名").getComponent(Label);
        this.skinStateLabel = this.node.getChildByName("获得状态").getComponent(Label);
        this.wearStateLabel = this.node.getChildByName("穿戴状态").getComponent(Label);

        this.skinName = data.Name;
        this.skinValue = data.SkinValue;
        this.skinState = data.SkinState;
        this.wearState = data.WearState;
        this.skinType = data.SkinType;

        this.skinNameLabel.string = this.skinName;
        this.skinStateLabel.string = this.skinState;
        this.wearStateLabel.string = this.wearState;

        if (this.skinState == "未获得") {
            this.wearStateLabel.string = this.skinValue.toString() + "个绿宝石解锁";
        } else {
            this.wearStateLabel.string = this.wearState.toString();
        }

        this.node.on(NodeEventType.TOUCH_END, this.onClick, this);

        HJMSJ_Incident.LoadSprite("Sprites/角色/" + this.skinName).then((sp: SpriteFrame) => {
            this.skinSprite.spriteFrame = sp;
        });
    }

    refreshData(data) {
        this.skinName = data.Name;
        this.skinValue = data.SkinValue;
        this.skinState = data.SkinState;
        this.wearState = data.WearState;
        this.skinType = data.SkinType;

        this.skinNameLabel.string = this.skinName;
        this.skinStateLabel.string = this.skinState;
        this.wearStateLabel.string = this.wearState;

        if (this.skinState == "未获得") {
            this.wearStateLabel.string = this.skinValue.toString() + "个绿宝石解锁";
        } else {
            this.wearStateLabel.string = this.wearState.toString();
        }
    }
}



