import { _decorator, AudioSource, Component, Node, RigidBody2D, v2, Vec2, Vec3 } from 'cc';
import TLWLSJ_PlayerController from './TLWLSJ_PlayerController'; import { TLWLSJ_Shop } from './TLWLSJ_Shop';
import { TLWLSJ_PrefsManager } from './TLWLSJPrefsManager';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_Gold')
export class TLWLSJ_Gold extends Component {

    RigidBody2D: RigidBody2D = null;
    Target: Node = null;

    IsRemove: boolean = false;

    AudioSource: AudioSource = null;

    protected onLoad(): void {
        this.RigidBody2D = this.node.getComponent(RigidBody2D);
        this.AudioSource = this.getComponent(AudioSource);
    }

    protected start(): void {
        this.Target = TLWLSJ_PlayerController.Instance.node;
    }

    protected update(dt: number): void {
        if (this.IsRemove) return;
        const dis: number = Vec3.distance(this.node.getWorldPosition(), this.Target.getWorldPosition());
        if (dis <= 80) {
            this.removeSelf();
        } else if (dis <= 400) {
            this.tracePlayer(dis / 10);
        } else {
            this.RigidBody2D.linearVelocity = Vec2.ZERO;
        }
    }

    tracePlayer(dis: number) {
        const dir = this.Target.getWorldPosition().subtract(this.node.getWorldPosition()).normalize();
        const speed = 70 / dis;
        this.RigidBody2D.linearVelocity = v2(dir.x * speed, dir.y * speed);
    }

    removeSelf() {
        this.IsRemove = true;
        this.AudioSource.play();
        this.scheduleOnce(() => { this.node.destroy(); }, 0.1);
        TLWLSJ_PrefsManager.Instance.userData.Gold += 10;
        TLWLSJ_PrefsManager.Instance.saveData();
    }
}


