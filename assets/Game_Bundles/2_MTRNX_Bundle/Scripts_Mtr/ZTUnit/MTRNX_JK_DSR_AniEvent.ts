import { _decorator, Node, Component, Contact2DType, IPhysics2DContact, Prefab, resources, RigidBody2D, Sprite, tween, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { MTRNX_JK_DSR } from './MTRNX_JK_DSR';
import { MTRNX_PoolManager } from '../Utils/MTRNX_PoolManager';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
import { MTRNX_ResourceUtil } from '../Utils/MTRNX_ResourceUtil';
import { MTRNX_GameManager } from '../MTRNX_GameManager';
import { MTRNX_HEX } from '../Data/MTRNX_Constant';
import { MTRNX_DSRSkillEffect } from '../MTRNX_DSRSkillEffect';

const { ccclass, property } = _decorator;


@ccclass('MTRNX_JK_DSR_AniEvent')
export class MTRNX_JK_DSR_AniEvent extends Component {

    @property
    trapTime = 0.2;

    unit: MTRNX_JK_DSR;

    effectNds: Node[] = [];

    start() {
        this.unit = this.node.parent.getComponent(MTRNX_JK_DSR);
    }

    protected onDisable(): void {
        this.ClearEffecNds();
    }

    ClearEffecNds() {
        this.effectNds.forEach(e => e && MTRNX_PoolManager.Instance.PutNode(e));
    }

    LightHit(num1: number) {
        MTRNX_AudioManager.AudioClipPlay("刺啦", 0.5);

        for (let i = 0; i < this.unit.skillList.length; i++) {
            const element = this.unit.skillList[i];
            if (!element.node) return;

            MTRNX_ResourceUtil.LoadPrefab(`Bullet/DSRSkillEffect`).then((prefab: Prefab) => {
                if (!element.node || !this.unit) return;

                let node = MTRNX_PoolManager.Instance.GetNode(prefab, MTRNX_GameManager.Instance.GameNode.getChildByName("子弹层"));
                let position = v3(element.node.worldPosition.x, element.node.worldPosition.y + element.node.getComponent(UITransform).height / 4);

                let hex, scale = Vec3.ONE;
                if (this.unit.Id == 17) {
                    hex = MTRNX_HEX.电视人受击激光;
                    scale = Vec3.ONE.clone().multiplyScalar(0.5);
                }
                if (this.unit.Id == 18) {
                    hex = MTRNX_HEX.白色;
                    scale = Vec3.ONE;
                }
                if (this.unit.Id == 19) {
                    hex = MTRNX_HEX.女电视人受击激光;
                    scale = Vec3.ONE.clone().multiplyScalar(0.8);
                }

                node.getComponent(MTRNX_DSRSkillEffect).Init(hex, scale);
                node.setWorldPosition(position);
                this.effectNds.push(node);
                this.scheduleOnce(() => {
                    if (this.effectNds.indexOf(node) != -1) {
                        this.effectNds.splice(this.effectNds.indexOf(node), 1);
                    }
                    MTRNX_PoolManager.Instance.PutNode(node);
                }, this.trapTime);
            });

            element.Trapped(this.trapTime);
            element.Hurt(num1);
        }
    }

    LightEnd() {
        this.node.active = false;
        this.unit.Attack();
        this.ClearEffecNds();
    }

    //#endregion

}