import { _decorator, Collider2D, Component, IPhysics2DContact, Node, RenderTexture } from 'cc';
import { TLWLSJ_EnemyController } from './TLWLSJ_EnemyController';
import { TLWLSJ_GameManager } from './TLWLSJ_GameManager';
import TLWLSJ_PlayerController from './TLWLSJ_PlayerController'; const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_Enemy_Monster')
export class TLWLSJ_Enemy_Monster extends TLWLSJ_EnemyController {
    protected onLoad(): void {
        super.onLoad();
    }

    protected start(): void {
        super.start();
    }

    attack() {
        if (this.IsAttack || !this.InRange || this.IsDie) return;
        this.IsAttack = true;
        this.showTips();
        this.scheduleOnce(() => {
            this.IsAttack = false;
            this.hideTips();
            if (!this.InRange || TLWLSJ_GameManager.Instance.IsPause) return;//玩家不在攻击范围内 --- 暂停游戏
            this.attack();
            //对玩家造成伤害
            TLWLSJ_PlayerController.Instance.hit(this.Harm);
        }, 1);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
        this.InRange = true;
        this.attack();
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
        this.InRange = false;
    }

}


