import { _decorator, Component, Node, Vec3 } from 'cc';
import { TLWLSJ_Explosion_Bullet } from './TLWLSJ_Explosion_Bullet';
import { TLWLSJ_MapCamera } from './TLWLSJ_MapCamera';
import { Audios, TLWLSJ_AudioManager } from './TLWLSJ_AudioManager';
import { TLWLSJ_Tool } from './TLWLSJ_Tool';

const { ccclass, property } = _decorator;

enum Ani {
    None = "",
    Boom = "shouleibaozha_texiao",
}

@ccclass('TLWLSJ_Explosion_Grenade')
export class TLWLSJ_Explosion_Grenade extends TLWLSJ_Explosion_Bullet {

    show(worldPos: Vec3, angle: number, harm: number = 0, armor: number = 0) {
        this.Harm = harm;
        this.Armor = armor;
        this.node.setWorldPosition(worldPos);
        const randAngle = TLWLSJ_Tool.GetRandom(-5, 5);
        this.node.angle = angle + randAngle;
        TLWLSJ_MapCamera.Instance.shakeCamera(6, 0.025, 15);
        TLWLSJ_AudioManager.PlaySound(Audios.Boom);
        this.playAni(Ani.Boom, false, () => {
            this.node.destroy();
        })
    }
}


