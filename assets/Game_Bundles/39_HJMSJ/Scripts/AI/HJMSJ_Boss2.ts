import { _decorator, Collider2D, Component, IPhysics2DContact, math, Node, tween, v3 } from 'cc';
import { HJMSJ_AIPlayer } from './HJMSJ_AIPlayer';
import { HJMSJ_Player } from '../Player/HJMSJ_Player';
import { HJMSJ_ATKBox } from '../Player/HJMSJ_ATKBox';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_Boss2')
export class HJMSJ_Boss2 extends HJMSJ_AIPlayer {

    protected DropPropArr: { Name: string, Num: number, Percent: number }[] = [
        { Name: "绿宝石", Num: 10, Percent: 1 },
        { Name: "钻石", Num: 10, Percent: 1 },
        { Name: "钻石剑", Num: 1, Percent: 0.2 },
    ];

    override Attack() {
        if (this.isAttacking) {
            return;
        }

        this.isAttacking = true;
        this.chasePlayer = false;

        let leftHand = this.handProp.getChildByName("leftHand");
        let rightHand = this.handProp.getChildByName("rightHand");

        let leftEffect = leftHand.getChildByName("拖尾");
        leftEffect.active = true;

        let rightEffect = rightHand.getChildByName("拖尾");
        rightEffect.active = true;

        tween(leftHand)
            .by(0.2, { eulerAngles: v3(0, 0, 360) })
            .start();

        tween(rightHand)
            .by(0.2, { eulerAngles: v3(0, 0, 360) })
            .start();

        this.scheduleOnce(() => {
            let playerTs = this.playerNode.getComponent(HJMSJ_Player);
            //延迟时间内若玩家与AI距离仍小于阈值则玩家被攻击
            if (this.getPlayerDistance().length() < this.MinDistance) {
                let playerPos = this.getPlayerDir();
                playerTs.onAttack(-this.ATK, playerPos);
                playerTs.Shake(7, 0.5);
            }
            //无论是否攻击都重置状态
            this.isAttacking = false;

        }, 0.25);

        this.scheduleOnce(() => {
            this.chasePlayer = true;
        }, 0.8);

        this.scheduleOnce(() => {
            rightEffect.active = false;
            leftEffect.active = false;
        }, 0.5);

    }

    override onMove(Dir: math.Vec3): void {
        this._dir = v3(Dir.x, Dir.y, 0);

        if (this._dir.x < 0 && this.Model.eulerAngles.y === 180) {
            tween(this.Model)
                .to(0.2, { eulerAngles: v3(0, 0, 0) }, { easing: "backInOut" })
                .start();

            tween(this.handProp)
                .to(0.2, { eulerAngles: v3(0, 0, 0) }, { easing: "backInOut" })
                .call(() => {
                    this.handProp.position = v3(0, 0, 0);
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
                    this.handProp.position = v3(0, 0, 0);
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


