import { _decorator, Node, Component, Contact2DType, IPhysics2DContact, Prefab, resources, RigidBody2D, Sprite, tween, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { MTRNX_Water_JK_DSR } from './MTRNX_Water_JK_DSR';
import { MTRNX_Water_PoolManager } from '../Utils/MTRNX_Water_PoolManager';
import { MTRNX_Water_AudioManager } from '../MTRNX_Water_AudioManager';
import { MTRNX_Water_ResourceUtil } from '../Utils/MTRNX_Water_ResourceUtil';
import { MTRNX_Water_GameManager } from '../MTRNX_Water_GameManager';
import { MTRNX_Water_HEX } from '../Data/MTRNX_Water_Constant';
import { MTRNX_Water_DSRSkillEffect } from '../MTRNX_Water_DSRSkillEffect';

const { ccclass, property } = _decorator;


@ccclass('MTRNX_Water_JK_DSR_AniEvent')
export class MTRNX_Water_JK_DSR_AniEvent extends Component {

    @property
    trapTime = 0.2;

    unit: MTRNX_Water_JK_DSR;

    effectNds: Node[] = [];

    start() {
        this.unit = this.node.parent.getComponent(MTRNX_Water_JK_DSR);
    }

    protected onDisable(): void {
        this.ClearEffecNds();
    }

    ClearEffecNds() {
        this.effectNds.forEach(e => e && MTRNX_Water_PoolManager.Instance.PutNode(e));
    }

    LightHit(num1: number) {
        MTRNX_Water_AudioManager.AudioClipPlay("刺啦", 0.5);

        for (let i = 0; i < this.unit.skillList.length; i++) {
            const element = this.unit.skillList[i];
            if (!element.node) return;

            MTRNX_Water_ResourceUtil.LoadPrefab(`Bullet/DSRSkillEffect`).then((prefab: Prefab) => {
                if (!element.node || !this.unit) return;

                let node = MTRNX_Water_PoolManager.Instance.GetNode(prefab, MTRNX_Water_GameManager.Instance.GameNode.getChildByName("子弹层"));
                let position = v3(element.node.worldPosition.x, element.node.worldPosition.y + element.node.getComponent(UITransform).height / 4);

                let hex, scale = Vec3.ONE;
                if (this.unit.Id == 17) {
                    hex = MTRNX_Water_HEX.电视人受击激光;
                    scale = Vec3.ONE.clone().multiplyScalar(0.5);
                }
                if (this.unit.Id == 18) {
                    hex = MTRNX_Water_HEX.白色;
                    scale = Vec3.ONE;
                }
                if (this.unit.Id == 19) {
                    hex = MTRNX_Water_HEX.女电视人受击激光;
                    scale = Vec3.ONE.clone().multiplyScalar(0.8);
                }

                node.getComponent(MTRNX_Water_DSRSkillEffect).Init(hex, scale);
                node.setWorldPosition(position);
                this.effectNds.push(node);
                this.scheduleOnce(() => {
                    if (this.effectNds.indexOf(node) != -1) {
                        this.effectNds.splice(this.effectNds.indexOf(node), 1);
                    }
                    MTRNX_Water_PoolManager.Instance.PutNode(node);
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