import { _decorator, Component, ERigidBody2DType, Graphics, instantiate, Node, Prefab, v2, v3, Vec2, Vec3 } from 'cc';
import { Bacon_Joint } from './Bacon_Joint';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { AudioManager } from 'db://assets/Scripts/Framework/Managers/AudioManager';
import { BaconAudio, Bacon_Manager } from './Bacon_Manager';
const { ccclass, property } = _decorator;

@ccclass('Bacon_Item')
export class Bacon_Item extends Component {
    Graphics_0: Graphics = null;
    Graphics_1: Graphics = null;
    Graphics_2: Graphics = null;

    jointCount = 13;
    connectedAnchor: Vec2 = v2(15, 0);

    baconJoints: Bacon_Joint[] = [];
    head: Bacon_Joint = null;

    protected onLoad(): void {
        this.Graphics_0 = NodeUtil.GetComponent("Graphics_0", this.node, Graphics);
        this.Graphics_1 = NodeUtil.GetComponent("Graphics_1", this.node, Graphics);
        this.Graphics_2 = NodeUtil.GetComponent("Graphics_2", this.node, Graphics);

        for (let i = 0; i < this.baconJoints.length; i++) {
            PoolManager.PutNode(this.baconJoints[i].node);
        }

        const initBacon = () => {
            for (let i = 0; i < this.baconJoints.length; i++) {

                let joint = this.baconJoints[i];
                joint.joint.enabled = i != 0;

                if (i == 0) {
                    this.head = joint;
                    joint.node.setRotationFromEuler(v3(0, 0, -90));
                    joint.rigid.type = ERigidBody2DType.Static;
                    joint.collider.radius = 1;
                }

                if (i > 0) {
                    joint.joint.connectedAnchor = this.connectedAnchor;
                    joint.joint.connectedBody = this.baconJoints[i - 1].rigid;
                }

                joint.joint.apply();
            }
        }

        let count = 0;
        for (let i = 0; i < this.jointCount; i++) {
            BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `BaconJoint`).then((prefab: Prefab) => {
                let node = instantiate(prefab);
                node.setParent(this.node);
                let joint = node.getComponent(Bacon_Joint);
                this.baconJoints.push(joint);
                count++;
                if (count >= this.jointCount) {
                    initBacon();
                }
            });

        }
    }

    ResetBacon(position: Vec3) {
        if (this.head) {
            this.scheduleOnce(() => {
                this.node.active = false;
                this.head.node.setRotationFromEuler(v3(0, 0, -90));
                this.head.rigid.type = ERigidBody2DType.Static;
                this.head.collider.radius = 1;

                let y = 5;
                for (let i = 0; i < this.baconJoints.length; i++) {
                    this.baconJoints[i].node.setWorldPosition(v3(position.x, position.y - y * i));
                }

                this.node.active = true;
            });
        }
    }

    ReleasBacon() {
        if (this.head) {
            this.head.rigid.type = ERigidBody2DType.Dynamic;
            this.head.collider.radius = 25;
        }
    }

    AddForce(forcePoint: Node) {
        for (let i = 0; i < this.baconJoints.length; i++) {
            const e = this.baconJoints[i];
            const dir = e.node.worldPosition.clone().subtract(forcePoint.worldPosition.clone()).normalize();
            dir.multiplyScalar(1.15);
            e.rigid.applyLinearImpulseToCenter(v2(dir.x, dir.y), true);
        }

        this.scheduleOnce(() => {
            AudioManager.Instance.PlaySFX(Bacon_Manager.Instance.audios[BaconAudio.throw]);
        }, 0.1)
    }

    update(deltaTime: number) {
        this.Graphics_0.clear();
        this.Graphics_1.clear();
        this.Graphics_2.clear();

        for (let i = 0; i < this.baconJoints.length; i++) {
            let pos = this.baconJoints[i].node.position;
            if (i == 0) {
                this.Graphics_0.moveTo(pos.x, pos.y);
                this.Graphics_1.moveTo(pos.x, pos.y + 10);
                this.Graphics_2.moveTo(pos.x, pos.y + 17.5);
            } else if (i == this.baconJoints.length - 1) {
                this.Graphics_0.lineTo(pos.x, pos.y);
                this.Graphics_1.lineTo(pos.x, pos.y + 10);
                this.Graphics_2.lineTo(pos.x, pos.y + 17.5);
                this.Graphics_0.stroke();
                this.Graphics_1.stroke();
                this.Graphics_2.stroke();
            } else {
                this.Graphics_0.lineTo(pos.x, pos.y);
                this.Graphics_1.lineTo(pos.x, pos.y + 10);
                this.Graphics_2.lineTo(pos.x, pos.y + 17.5);
            }
        }
    }
}


