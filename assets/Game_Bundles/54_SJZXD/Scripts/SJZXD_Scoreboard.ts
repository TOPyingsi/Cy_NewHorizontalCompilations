import { _decorator, Camera, Component, director, instantiate, Label, Node, Prefab, Screen, tween, UITransform, v3 } from 'cc';
import { SJZXD_EventManager } from './SJZXD_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_Scoreboard')
export class SJZXD_Scoreboard extends Component {
    @property(Prefab)
    skullPrefab: Prefab = null;
    @property(Camera)
    UICamera: Camera = null;
    private Score: number = 0;//分数
    start() {
        director.getScene().on(SJZXD_EventManager.AI单位死亡, this.AddScore, this);
    }
    AddScore(nd: Node) {
        this.Score += 1;
        let skull = instantiate(this.skullPrefab);
        skull.setParent(this.node);
        // 将世界坐标转换为屏幕坐标
        let worldPos = nd.getWorldPosition();
        let screenPos = this.UICamera.convertToUINode(worldPos, this.node);
        skull.setPosition(screenPos);
        skull.scale = v3(0.5, 0.5, 0.5);
        tween(skull)
            .to(0.4, { scale: v3(1, 1, 1) }, { easing: "backOut" })
            .to(0.8, { position: v3(-70, 0, 0) }, { easing: "backIn" })
            .call(() => {
                this.node.getChildByName("计数").getComponent(Label).string = this.Score.toString();
            })
            .start();

    }
}


