import { _decorator, Component, Vec2, v2, RigidBody2D, Node, Sprite, Animation, Collider2D, CircleCollider2D, SpriteFrame, Vec3, v3, misc, director, JsonAsset, PhysicsSystem2D, ERaycast2DType, Contact2DType, IPhysics2DContact, sp, UITransform } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { SJZ_GameManager } from './SJZ_GameManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { SJZ_Constant } from './SJZ_Constant';
import { SJZ_PoolManager } from './SJZ_PoolManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import SJZ_Bullet from './SJZ_Bullet';
import { SJZ_ItemData } from './SJZ_Data';
const { ccclass, property } = _decorator;


@ccclass('SJZ_GunFire')
export default class SJZ_GunFire extends Component {
    spine: sp.Skeleton = null;
    spineTrans: UITransform = null;

    onLoad() {
        this.spine = this.node.getComponent(sp.Skeleton);
        this.spineTrans = this.spine.node.getComponent(UITransform);
    }

    Play() {
        const trackEntry: sp.spine.TrackEntry = this.spine.setAnimation(0, "animation", false);
    }

    Stop() {
        this.spine?.clearTrack(0);
    }

    SetAniMix(anim1: string, anim2: string) {
        this.spine?.setMix(anim1, anim2, 0.2);
        this.spine?.setMix(anim2, anim1, 0.2);
    }

    protected onEnable(): void {
        this.AddSpineListener();
    }

    AddSpineListener() {
        //用来设置动画播放一次循环结束后的事件监听
        this.spine!.setCompleteListener((trackEntry) => {
            // var loopCount = Math.floor(trackEntry.trackTime / trackEntry.animationEnd);
            // console.log("[track %s][animation %s] complete: %s", trackEntry.trackIndex, animationName, loopCount);
            SJZ_PoolManager.Instance.Put(this.node);
        });
    }

    DebugSlot() {
        this.spine!.debugSlots = !this.spine?.debugSlots;
        this.spine!.debugBones = !this.spine?.debugBones;
        this.spine!.debugMesh = !this.spine?.debugMesh;
        this.spine!.useTint = !this.spine?.useTint;
    }
}