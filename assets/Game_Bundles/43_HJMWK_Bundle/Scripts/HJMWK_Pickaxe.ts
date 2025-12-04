import { _decorator, Collider, Collider2D, Component, floatToHalf, Node, Tween, tween, Vec3 } from 'cc';
import HJMWK_PlayerController from './HJMWK_PlayerController';
import { HJMWK_GameData } from './HJMWK_GameData';
import { HJMWK_GameManager } from './HJMWK_GameManager';
const { ccclass, property } = _decorator;

@ccclass('HJMWK_Pickaxe')
export class HJMWK_Pickaxe extends Component {

    time: number = 0.5;
    collider2D: Collider2D = null;
    private _playing: boolean = false;
    private _attack: boolean = false;

    protected onLoad(): void {
        this.collider2D = this.getComponent(Collider2D);
        if (HJMWK_GameManager.Instance.AutoAttack) {
            this.attack();
        }
    }

    protected update(dt: number): void {
        this.node.setPosition(Vec3.ZERO);
        if ((HJMWK_PlayerController.Instance.node.scale.x < 0 && this.collider2D.offset.x > 0) || (HJMWK_PlayerController.Instance.node.scale.x > 0 && this.collider2D.offset.x < 0)) {
            this.collider2D.offset.x = - this.collider2D.offset.x;
            this.collider2D.apply();
        }
    }

    attackStart() {
        if (this._attack) return;
        this._attack = true;
        this.attack();
    }

    attackEnd() {
        if (HJMWK_GameManager.Instance.AutoAttack) return;
        this._attack = false;
        // Tween.stopAllByTarget(this.node);
        // this.node.angle = 0;
    }

    attack() {
        if (this._playing) return;
        this._playing = true;
        tween(this.node)
            .by(this.time / (3 + 3 * HJMWK_GameData.Instance.userData["挖矿速度"] * 0.1), { angle: 35 })
            .by(this.time / (3 + 3 * HJMWK_GameData.Instance.userData["挖矿速度"] * 0.1), { angle: -60 })
            .call(() => {
                this.inflict();
            })
            .by(this.time / (3 + 3 * HJMWK_GameData.Instance.userData["挖矿速度"] * 0.1), { angle: 25 })
            .call(() => {
                this._playing = false;
                if (!this._attack) return;
                this.attack();
            })
            .start();
    }

    inflict() {
        this.collider2D.enabled = true;
        this.collider2D.apply();
        this.scheduleOnce(() => {
            this.collider2D.enabled = false;
            this.collider2D.apply();
        })
    }
}


