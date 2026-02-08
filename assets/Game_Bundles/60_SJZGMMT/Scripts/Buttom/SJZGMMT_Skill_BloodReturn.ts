import { _decorator, Component, director, instantiate, Label, Node, Prefab, sp, Sprite, Vec3 } from 'cc';
import { SJZGMMT_Unit } from '../SJZGMMT_Unit';
import { SJZGMMT_I_SkillBtn } from '../InterFace/SJZGMMT_I_SkillBtn';
import { SJZGMMT_EventManager } from '../SJZGMMT_EventManager';
import { SJZGMMT_Bullet } from '../SJZGMMT_Bullet';
import { SJZGMMT_GameManager } from '../SJZGMMT_GameManager';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_Skill_BloodReturn')
export class SJZGMMT_Skill_BloodReturn extends SJZGMMT_I_SkillBtn {//回血技能
    public FindUnit: SJZGMMT_Unit = null;
    public FindNode: Node = null;


    public SkillTime: number = 0;//恢复时间
    public SkillMaxTime: number = 12;//最大恢复时间

    private MaskSprite: Sprite = null;
    private skeNode: Node = null;
    start() {
        this.MaskSprite = this.node.getChildByPath("图/Mask").getComponent(Sprite);
        this.skeNode = this.node.getChildByName("动画");
        director.getScene().on(SJZGMMT_EventManager.技能无CD, () => { this.SkillMaxTime = 0.1, this.SkillTime = 0 });
    }

    protected update(dt: number): void {
        if (this.SkillTime > 0) {
            this.SkillTime -= dt;
            if (this.SkillTime < 0) {
                this.SkillTime = 0;
            }
            this.MaskSprite.fillRange = this.SkillTime / this.SkillMaxTime;
        }
        if (this.skeNode.activeInHierarchy) {
            // 设置位置为FindNode
            this.skeNode.worldPosition = this.FindNode?.worldPosition.clone();
        }
    }

    OnClick() {
        if (this.SkillTime <= 0) {
            this.SkillTime = this.SkillMaxTime;
            //回血
            this.FindUnit.AddHP(this.FindUnit.MaxHp * 0.2);
            SJZGMMT_AudioManager.globalAudioPlay("贤勾技能音效");
            this.PlayAnimation();
        }
    }

    //播放动画
    public PlayAnimation() {
        this.skeNode.setParent(SJZGMMT_GameManager.Instance.GameNode);
        this.skeNode.active = true;
        this.skeNode.getComponent(sp.Skeleton).setAnimation(0, "animation", false);
        this.skeNode.getComponent(sp.Skeleton).setCompleteListener((trackEntry) => {
            this.skeNode.active = false;
        })
    }
}


