import { _decorator, Component, EventTouch, Node, NodeEventType, ParticleSystem2D, tween, v3, Vec3 } from 'cc';
import { BHPD_GameMgr } from '../BHPD_GameMgr';
const { ccclass, property } = _decorator;

@ccclass('BHPD_Iron')
export class BHPD_Iron extends Component {

    public steamParticle: ParticleSystem2D = null;
    private startPos: Vec3 = Vec3.ZERO;
    start() {
        this.startPos = this.node.worldPosition.clone();
        this.steamParticle = this.node.getChildByName("蒸汽").getComponent(ParticleSystem2D);

        this.node.on(NodeEventType.TOUCH_START, this.touchStart, this);
        this.node.on(NodeEventType.TOUCH_MOVE, this.touchMove, this)
        this.node.on(NodeEventType.TOUCH_END, this.touchEnd, this);
    }

    touchStart(event: EventTouch) {
        const touchPos = v3(event.getUILocation().x, event.getUILocation().y);
        this.node.worldPosition = touchPos;
    }

    touchMove(event: EventTouch) {
        const touchPos = v3(event.getUILocation().x, event.getUILocation().y);
        this.node.worldPosition = touchPos;

        if (BHPD_GameMgr.instance.couldFire) {
            BHPD_GameMgr.instance.onIronMove(touchPos);
        }
    }

    touchEnd(event: EventTouch) {
        this.node.worldPosition = this.startPos;
        this.closeSteam();
    }

    showIron() {
        tween(this.node)
            .to(0.5, { position: v3(-200, 0, 0) })
            .call(() => {
                this.startPos = this.node.worldPosition.clone();
            })
            .start();
    }

    ResetPos() {
        this.closeSteam();
        this.node.worldPosition = v3(this.startPos.x, - 800, this.startPos.z);
    }

    showSteam() {
        if (!this.steamParticle.node.active) {
            this.steamParticle.node.active = true;
            this.steamParticle.resetSystem();
        }
    }

    closeSteam() {
        this.steamParticle.stopSystem();
        this.steamParticle.node.active = false;
    }
}


