import { _decorator, Component, EventTouch, instantiate, Node, Prefab, v3 } from 'cc';
import { XYMJDWY_Constant } from '../XYMJDWY_Constant';
import { XYMJDWY_OnHookBox } from '../XYMJDWY_OnHookBox';
import { XYMJDWY_GameData } from '../XYMJDWY_GameData';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJDWY_OnHookPanel')
export class XYMJDWY_OnHookPanel extends Component {
    @property(Prefab)
    private BoxFab: Prefab = null;
    private Time: number = 8;//倒计时
    private MaxTime: number = 8;//每隔多少时间获得一个物品

    public AwardData: string[] = [];
    start() {
        XYMJDWY_Constant.PropData.reduce((acc, curr) => {
            if (curr.type === "回收物") {
                this.AwardData.push(curr.Name);
            }
            return acc;
        });
    }
    OnbuttomClick(btn: EventTouch) {
        switch (btn.target.name) {
            case "返回":
                this.node.active = false;
                break;
        }
    }


    update(deltaTime: number) {
        this.Time -= deltaTime;
        if (this.Time <= 0) {
            this.Time = this.MaxTime;
            //获得奖励
            this.GetAward();
        }


    }

    GetAward() {
        let AwardName: string = this.AwardData[Math.floor(Math.random() * this.AwardData.length)];
        if (XYMJDWY_GameData.Instance.pushKnapsackData(AwardName, 1)) {
            let box = instantiate(this.BoxFab);
            box.setParent(this.node);
            box.setPosition(v3(0, 0, 0));
            box.getComponent(XYMJDWY_OnHookBox).Init(AwardName);
            UIManager.ShowTip("获得道具:" + AwardName);
        } else {
            UIManager.ShowTip("背包已满，请及时清理！");
        }
    }
}


