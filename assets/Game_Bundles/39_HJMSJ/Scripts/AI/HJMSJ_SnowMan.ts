import { _decorator, Collider2D, Component, IPhysics2DContact, math, Node, tween, v3 } from 'cc';
import { HJMSJ_AIPlayer } from './HJMSJ_AIPlayer';
import { HJMSJ_Player } from '../Player/HJMSJ_Player';
import { HJMSJ_ATKBox } from '../Player/HJMSJ_ATKBox';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_SnowMan')
export class HJMSJ_SnowMan extends HJMSJ_AIPlayer {


    override Attack() {
        if (this.isAttacking) {
            return;
        }

        this.isAttacking = true;

        // tween(this.handRoot)
        //     .to(0.15, { eulerAngles: v3(0, 0, -70) })
        //     .to(0.25, { eulerAngles: v3(0, 0, 30) })
        //     .start();


        this.scheduleOnce(() => {
            let playerTs = this.playerNode.getComponent(HJMSJ_Player);
            //延迟时间内若玩家与AI距离仍小于阈值则玩家被攻击
            if (this.getPlayerDistance().length() < this.MinDistance) {
                let playerPos = this.getPlayerDir();
                playerTs.repelDistance = 100;
                playerTs.onAttack(-this.ATK, playerPos);
                playerTs.Shake(2, 0.3);
            }
            //无论是否攻击都重置状态
            this.isAttacking = false;

        }, 0.4);

    }

    override onMove(Dir: math.Vec3): void {
        this._dir = v3(Dir.x, Dir.y, 0);

        if (this._dir.x < 0 && this.Model.eulerAngles.y === 0) {
            tween(this.Model)
                .to(0.2, { eulerAngles: v3(0, 180, 0) }, { easing: "backInOut" })
                .start();

            tween(this.handProp)
                .to(0.2, { eulerAngles: v3(0, 180, 0) }, { easing: "backInOut" })
                .call(() => {
                    this.forwardDir = -1;
                    // this.handPos = this.node.worldPosition;

                    // this.handPos = this.node.worldPosition.clone().add(v3(-120 * this.forwardDir, 0, 0));
                })
                .start();
        }

        if (this._dir.x > 0 && this.Model.eulerAngles.y === 180) {
            tween(this.Model)
                .to(0.2, { eulerAngles: v3(0, 0, 0) }, { easing: "backInOut" })
                .start();

            tween(this.handProp)
                .to(0.2, { eulerAngles: v3(0, 0, 0) }, { easing: "backInOut" })
                .call(() => {
                    this.forwardDir = 1;
                    // this.handPos = this.node.worldPosition;

                    // this.handPos = this.node.worldPosition.clone().add(v3(-120 * this.forwardDir, 0, 0));

                })
                .start();

        }
    }

    override DropProp(): void {

    }

    override shake(): void {

    }
}


