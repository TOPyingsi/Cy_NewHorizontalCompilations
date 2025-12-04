import { _decorator, Component, director, Label, Node, SkeletalAnimation, tween, v3 } from 'cc';
import { DiggingAHole_Prison_GameUI } from './DiggingAHole_Prison_GameUI';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('DiggingAHole_Prison_NPC')
export class DiggingAHole_Prison_NPC extends Component {
    private Model: Node = null;
    public Ismanhunt: boolean = false;//是否在追捕模式

    start() {
        this.Model = this.node.getChildByName("模型");
        director.getScene().on('掘地求财_开始交易流程', this.GoShop, this);
        director.getScene().on('掘地求财_关闭商店', this.ExitShop, this);

        this.schedule(() => {
            if (this.Ismanhunt && !DiggingAHole_Prison_GameUI.Instance.isFinish) {
                if (DiggingAHole_Prison_GameUI.Instance.blanketState == false) {
                    UIManager.ShowTip("狱警发现了你毯子下的地洞！")
                    DiggingAHole_Prison_GameUI.Instance.node.getChildByPath("WinPanel/lose/失败原因").getComponent(Label).string = "失败原因:\n狱警发现了掀开的地毯！"
                    DiggingAHole_Prison_GameUI.Instance.GameOver(false);
                    return;
                }
                if (DiggingAHole_Prison_GameUI.Instance.IsOnRoom == false) {
                    UIManager.ShowTip("狱警发现了你不在房间内！")
                    DiggingAHole_Prison_GameUI.Instance.node.getChildByPath("WinPanel/lose/失败原因").getComponent(Label).string = "失败原因:\n狱警发现了你不在房间内！"
                    DiggingAHole_Prison_GameUI.Instance.GameOver(false);
                    return;
                }
            }
        }, 1)
    }

    //来收货
    GoShop() {
        DiggingAHole_Prison_GameUI.Instance.Tip();
        this.GoDoor(() => {
            this.node.getChildByName("商店").active = true;
        })
    }

    //关闭商店
    ExitShop() {
        this.GoBack();
        this.node.getChildByName("商店").active = false;
        //开门
        director.getScene().emit('掘地求财_开门');
        UIManager.ShowTip("你只有30秒的时间可以交易！")
        this.scheduleOnce(() => {
            this.GoExitDoor();
        }, 30)
    }

    //来关门
    GoExitDoor() {
        DiggingAHole_Prison_GameUI.Instance.Tip();
        this.GoDoor(() => {
            director.getScene().emit('掘地求财_关门');
            this.GoBack();
            DiggingAHole_Prison_GameUI.Instance.flowdeal = false;
        })
    }
    //前往门前
    GoDoor(callback?: Function) {
        this.node.getChildByName("模型").active = true;
        tween(this.node)
            .to(0.5, { eulerAngles: v3(0, 90, 0) })
            .call(() => { this.AniPlay("running") })
            .to(10, { position: v3(3.2, -0.17, -1.5) })
            .to(0.5, { eulerAngles: v3(0, 180, 0) })
            .call(() => { this.AniPlay("idle"); this.Ismanhunt = true; if (callback) callback(); })
            .start();
    }
    //回到原位
    GoBack(callback?: Function) {
        tween(this.node)
            .to(0.5, { eulerAngles: v3(0, -90, 0) })
            .call(() => { this.AniPlay("running"); this.Ismanhunt = false })
            .to(10, { position: v3(-10.5, -0.17, -1.5) })
            .call(() => { this.AniPlay("idle"); if (callback) callback(); this.node.getChildByName("模型").active = false; })
            .start();
    }

    AniPlay(AniName: string) {
        this.Model.getComponent(SkeletalAnimation).play(AniName);
    }
}


