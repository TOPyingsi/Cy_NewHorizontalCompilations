import { _decorator, Component, Label, math, Node, NodeEventType, Sprite, SpriteFrame } from 'cc';
import { HJMSJ_GameData } from '../HJMSJ_GameData';
import { HJMSJ_Incident } from '../HJMSJ_Incident';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { HJMSJ_BagMgr } from '../Bag/HJMSJ_BagMgr';
import { HJMSJ_GameMgr } from '../HJMSJ_GameMgr';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_LevelProp')
export class HJMSJ_LevelProp extends Component {
    @property()
    public propNum: number = 0;

    @property()
    public propName: string = "";

    @property()
    public needNum: number = 0;

    protected start(): void {

        if (HJMSJ_GameData.Instance.level >= this.needNum) {
            let index = this.needNum / 100 * 10 - 1;
            console.log("index", index);
            if (HJMSJ_GameData.Instance.levelReward[index]) {
                let labelComp = this.node.getChildByName("获得状态").getComponent(Label);
                labelComp.string = "已获得";
                HJMSJ_Incident.LoadSprite("Sprites/新手村/等级奖励/" + this.propName).then((sp: SpriteFrame) => {
                    let spriteComp = this.node.getChildByName("道具图片").getComponent(Sprite);
                    spriteComp.spriteFrame = sp;
                })
            }
        }

        this.node.on(NodeEventType.TOUCH_END, this.onClick, this);
    }


    onClick() {
        let labelComp = this.node.getChildByName("获得状态").getComponent(Label);

        if (labelComp.string === "已获得") {
            UIManager.ShowTip("该奖励已领取!");
            return;
        }

        if (HJMSJ_GameData.Instance.level >= this.needNum) {
            let flag = HJMSJ_GameData.Instance.pushKnapsackData(this.propName, this.propNum, HJMSJ_BagMgr.curBagID);
            if (flag) {
                HJMSJ_GameMgr.instance.BagMgrTs.pushPropByName(this.propName, this.propNum);
                let index = this.needNum / 100 * 10 - 1;
                HJMSJ_GameData.Instance.levelReward[index] = true;

                let labelComp = this.node.getChildByName("获得状态").getComponent(Label);
                labelComp.string = "已获得";
                HJMSJ_Incident.LoadSprite("Sprites/新手村/等级奖励/" + this.propName).then((sp: SpriteFrame) => {
                    let spriteComp = this.node.getChildByName("道具图片").getComponent(Sprite);
                    spriteComp.spriteFrame = sp;
                })
            }
            else {
                UIManager.ShowTip("背包已满!");
            }
        }
        else {
            UIManager.ShowTip("请先升级到" + this.needNum + "级!");
        }
    }
}


