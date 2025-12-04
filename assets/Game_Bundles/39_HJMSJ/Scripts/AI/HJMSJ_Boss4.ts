import { _decorator, Collider2D, Component, IPhysics2DContact, math, Node, tween, v3 } from 'cc';
import { HJMSJ_AIPlayer } from './HJMSJ_AIPlayer';
import { HJMSJ_Player } from '../Player/HJMSJ_Player';
import { HJMSJ_ATKBox } from '../Player/HJMSJ_ATKBox';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_Boss4')
export class HJMSJ_Boss4 extends HJMSJ_AIPlayer {


    override Attack() {
        if (this.isAttacking) {
            return;
        }

        this.isAttacking = true;

        tween(this.handRoot)
            .to(0.15, { eulerAngles: v3(0, 0, -70) })
            .to(0.25, { eulerAngles: v3(0, 0, 30) })
            .start();


        this.scheduleOnce(() => {
            let playerTs = this.playerNode.getComponent(HJMSJ_Player);
            //延迟时间内若玩家与AI距离仍小于阈值则玩家被攻击
            if (this.getPlayerDistance().length() < 250) {
                playerTs.onAttack(-1.5);
            }
            //无论是否攻击都重置状态
            this.isAttacking = false;

        }, 0.4);

    }

    override onMove(Dir: math.Vec3): void {
        this._dir = v3(Dir.x, Dir.y, 0);

        console.log(this._dir.x);
        // console.log(this._dir.y);
        if (this._dir.x < 0 && this.Model.eulerAngles.y === 180) {
            tween(this.Model)
                .to(0.2, { eulerAngles: v3(0, 0, 0) }, { easing: "backInOut" })
                .start();

            tween(this.handProp)
                .to(0.2, { eulerAngles: v3(0, 0, 0) }, { easing: "backInOut" })
                .call(() => {
                    this.handProp.position = v3(-100, -60, 0);
                    this.handRoot.getComponent(HJMSJ_ATKBox).Show();
                    this.forwardDir = 1;
                    // this.handPos = this.node.worldPosition;

                    // this.handPos = this.node.worldPosition.clone().add(v3(-120 * this.forwardDir, 0, 0));
                })
                .start();
        }

        if (this._dir.x > 0 && this.Model.eulerAngles.y === 0) {
            tween(this.Model)
                .to(0.2, { eulerAngles: v3(0, 180, 0) }, { easing: "backInOut" })
                .start();

            tween(this.handProp)
                .to(0.2, { eulerAngles: v3(0, 180, 0) }, { easing: "backInOut" })
                .call(() => {
                    this.handProp.position = v3(100, -60, 0);
                    this.handRoot.getComponent(HJMSJ_ATKBox).Show();
                    this.forwardDir = -1;
                    // this.handPos = this.node.worldPosition;

                    // this.handPos = this.node.worldPosition.clone().add(v3(-120 * this.forwardDir, 0, 0));

                })
                .start();

        }
    }

    override onExitContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {

    }

    override randomMove(): void {

    }

    override shake(): void {

    }
}


