import { _decorator, Component, director, EventTouch, Node, tween, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_BOSSMap')
export class HJMSJ_BOSSMap extends Component {


    start() {
        director.getScene().on("哈基米世界_交互", (InteractTarget: string) => {
            if (InteractTarget === "BOSS地图") {
                this.open();
            }
        }, this);

        director.getScene().on("哈基米世界_更换Boss地图", this.close, this);
    }

    onBtnClick(event: EventTouch) {
        if (event.target.name === "退出页面") {
            this.close();
        }
    }

    open() {
        this.node.getChildByName("bg").active = true;
        this.node.getChildByName("地图界面").active = true;

        let uiOp = this.getComponent(UIOpacity);
        tween(uiOp)
            .to(0.3, { opacity: 255 })
            .start();
    }

    close() {
        let uiOp = this.getComponent(UIOpacity);
        tween(uiOp)
            .to(0.3, { opacity: 0 })
            .call(() => {
                this.node.getChildByName("bg").active = false;
                this.node.getChildByName("地图界面").active = false;
            })
            .start();
    }
}


