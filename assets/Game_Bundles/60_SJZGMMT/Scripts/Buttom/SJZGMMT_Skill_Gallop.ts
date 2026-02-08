import { _decorator, Component, director, instantiate, Label, Node, Prefab, sp, Sprite, v3, Vec3 } from 'cc';
import { SJZGMMT_Unit } from '../SJZGMMT_Unit';
import { SJZGMMT_I_SkillBtn } from '../InterFace/SJZGMMT_I_SkillBtn';
import { SJZGMMT_EventManager } from '../SJZGMMT_EventManager';
import { SJZGMMT_GameManager } from '../SJZGMMT_GameManager';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_Skill_Gallop')
export class SJZGMMT_Skill_Gallop extends SJZGMMT_I_SkillBtn {//无敌炮火技能
    public FindUnit: SJZGMMT_Unit = null;
    public FindNode: Node = null;


    public SkillTime: number = 0;//恢复时间
    public SkillMaxTime: number = 25;//最大恢复时间

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
            SJZGMMT_AudioManager.globalAudioPlay("游侠技能音效");
            this.FindUnit.AddBuff("增加移速", 400, 5);
            this.PlayAnimation();
        }
    }

    //播放动画
    public PlayAnimation() {
        this.skeNode.setParent(SJZGMMT_GameManager.Instance.GameNode);
        this.skeNode.active = true;
        this.skeNode.getComponent(sp.Skeleton).setAnimation(0, "animation", true);
        this.scheduleOnce(() => {
            this.skeNode.active = false;
        }, 5)
    }

}


