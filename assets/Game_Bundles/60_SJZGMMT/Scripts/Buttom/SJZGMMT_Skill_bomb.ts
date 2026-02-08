import { _decorator, Component, director, instantiate, Label, Node, Prefab, sp, Sprite, v3, Vec3 } from 'cc';
import { SJZGMMT_Unit } from '../SJZGMMT_Unit';
import { SJZGMMT_I_SkillBtn } from '../InterFace/SJZGMMT_I_SkillBtn';
import { SJZGMMT_EventManager } from '../SJZGMMT_EventManager';
import { SJZGMMT_Bullet } from '../SJZGMMT_Bullet';
import { SJZGMMT_GameManager } from '../SJZGMMT_GameManager';
import { SJZGMMT_AttackBox } from '../SJZGMMT_AttackBox';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_Skill_bomb')
export class SJZGMMT_Skill_bomb extends SJZGMMT_I_SkillBtn {//金钟罩技能
    public FindUnit: SJZGMMT_Unit = null;
    public FindNode: Node = null;
    public SkillTime: number = 0;//恢复时间
    public SkillMaxTime: number = 20;//最大恢复时间
    public Attack: number = 250;//三次波动，每次造成的伤害
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
            this.PlayAnimation();
        }
    }
    //播放动画
    public PlayAnimation() {
        this.skeNode.setParent(SJZGMMT_GameManager.Instance.GameNode);
        this.skeNode.active = true;
        this.skeNode.getComponent(sp.Skeleton).setAnimation(0, "animation", false);
        this.Show(this.FindUnit.Camp, this.Attack + (this.FindUnit.Attack * 0.1));
    }
    Show(camp: number, attack: number) {
        this.skeNode.getComponent(sp.Skeleton).setAnimation(0, "animation", true);
        this.scheduleOnce(() => {
            this.skeNode.active = false;
        }, 4.2)
        this.FindUnit.AddBuff("防御力增加", 999999999, 4.2);
    }

}


