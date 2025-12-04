import { _decorator, AnimationComponent, Component, director, Node, Sprite, tween, UIOpacity } from 'cc';
import { ZSTSB_GameMgr } from './ZSTSB_GameMgr';
const { ccclass, property } = _decorator;

@ccclass('ZSTSB_Loading')
export class ZSTSB_Loading extends Component {


    start() {
        director.getScene().on("钻石填色本_开始切换场景", this.openUI, this);
        director.getScene().on("钻石填色本_切换场景结束", this.closeUI, this);
        director.getScene().on("钻石填色本_加载进度", (process: number) => {
            this.updateProcess(process);
        }, this);
    }

    update(deltaTime: number) {

    }

    openUI() {
        this.node.getChildByName("BG").active = true;
        let uiOp = this.node.getChildByName("BG").getComponent(UIOpacity);

        tween(uiOp)
            .to(0.2, { opacity: 255 })
            // .call(() => {
            //     let ani = this.node.getChildByName("BG").getComponent(AnimationComponent);
            //     let state = ani.getState("Loading");
            //     if (state && !state.isPlaying) {
            //         ani.play("Loading");
            //     }
            // })
            .start();
    }

    closeUI() {

        let uiOp = this.node.getChildByName("BG").getComponent(UIOpacity);
        let fill = this.node.getChildByName("BG").getChildByName("加载条");
        let sprite = fill.getComponent(Sprite);

        tween(uiOp)
            .to(0.2, { opacity: 0 })
            .call(() => {
                this.node.getChildByName("BG").active = false;
                sprite.fillRange = 0;
            })
            .start();
    }

    process: number = 0;
    updateProcess(process: number) {
        let fill = this.node.getChildByName("BG").getChildByName("加载条");
        let sprite = fill.getComponent(Sprite);
        if (this.process > process) {
            return;
        }

        if (process >= 1) {
            this.scheduleOnce(() => {
                this.closeUI();
            }, 0.7);
        }
        sprite.fillRange = process;

        console.log(process);
    }
}


