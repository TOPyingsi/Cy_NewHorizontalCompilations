import { _decorator, Component, RigidBody2D, Sprite, Animation, Vec2, RigidBody } from 'cc';
const { ccclass, property } = _decorator;

import NodeUtil from '../../../Scripts/Framework/Utils/NodeUtil';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import XGTW_GrenadeListener from './XGTW_GrenadeListener';

@ccclass('XGTW_Grenade')
export default class XGTW_Grenade extends Component {
    rigidbody: RigidBody2D | null = null;
    Sp: Sprite | null = null;
    Boom: Animation | null = null;
    grenadeListener: XGTW_GrenadeListener = null;
    onLoad() {
        this.Sp = NodeUtil.GetComponent("Sp", this.node, Sprite);
        this.Boom = NodeUtil.GetComponent("Boom", this.node, Animation);
        this.rigidbody = this.node.getComponent(RigidBody2D);
        this.grenadeListener = this.Sp.getComponent(XGTW_GrenadeListener);
    }
    protected onEnable(): void {
        this.Boom.on(Animation.EventType.FINISHED, this.Put, this);
    }
    protected onDisable(): void {
        this.Boom?.off(Animation.EventType.FINISHED, this.Put, this);
    }
    Put() {
        this.scheduleOnce(() => {
            PoolManager.PutNode(this.node);
        });
    }
    Throw(dir: Vec2) {
        this.rigidbody.applyLinearImpulse(dir.multiplyScalar(2000), Vec2.ZERO, true);

        this.scheduleOnce(() => {
            this.Boom.play();
        }, 3);
    }
}