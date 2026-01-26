import { _decorator, Component, director, instantiate, Label, Node, Prefab, Sprite, v3, Vec3 } from 'cc';
import { SJZXD_Unit } from '../SJZXD_Unit';
import { SJZXD_I_SkillBtn } from '../InterFace/SJZXD_I_SkillBtn';
import { SJZXD_EventManager } from '../SJZXD_EventManager';
import { SJZXD_Bullet } from '../SJZXD_Bullet';
import { SJZXD_GameManager } from '../SJZXD_GameManager';
import { SJZXD_Skill_LieHuoFengTian } from '../Skill/SJZXD_Skill_LieHuoFengTian';
import { SJZXD_AudioManager } from '../SJZXD_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_Skill_bomb')
export class SJZXD_Skill_bomb extends SJZXD_I_SkillBtn {//无敌炮火技能
    @property(Prefab)
    public SkillPre: Prefab = null;

    public FindUnit: SJZXD_Unit = null;
    public FindNode: Node = null;

    public SkillAttack: number = 100;//技能基础伤害
    public SkillTime: number = 0;//恢复时间
    public SkillMaxTime: number = 20;//最大恢复时间
    private Lineofsight: Node = null;
    private MaskSprite: Sprite = null;

    start() {
        this.MaskSprite = this.node.getChildByPath("通用摇杆/JoystickBase/Mask").getComponent(Sprite);
        this.Lineofsight = this.node.getChildByPath("技能范围");

        this.Lineofsight.active = false; // 初始时隐藏瞄准圈
        this.Lineofsight.setParent(SJZXD_GameManager.Instance.GameNode);
        director.getScene().on(SJZXD_EventManager.通用摇杆移动未归一化, (tip, dir) => {
            if (tip == "技能_烈火焚天") {
                this.onMove(dir);
            }
        });
        director.getScene().on(SJZXD_EventManager.通用摇杆停止, (tip) => {
            if (tip == "技能_烈火焚天") {
                this.onStopMove();
            }
        });
        director.getScene().on(SJZXD_EventManager.技能无CD, () => { this.SkillMaxTime = 0.1, this.SkillTime = 0 });
    }

    protected update(dt: number): void {

        if (this.SkillTime > 0) {
            this.SkillTime -= dt;
            if (this.SkillTime <= 0) {
                this.SkillTime = 0;
            }
            this.MaskSprite.fillRange = (this.SkillTime / this.SkillMaxTime);
        }

        if (this.Lineofsight.activeInHierarchy) {
            // 限制dir的最大长度以保持圆形范围
            const maxLength = 100; // 圆形范围的最大半径
            if (this.dir.length() > maxLength) {
                this.dir.normalize().multiplyScalar(maxLength); // 将向量标准化后再乘以最大长度
            }
            this.Lineofsight.worldPosition = this.FindNode?.worldPosition.clone().add(this.dir.clone().multiplyScalar(5));
        }
    }
    private dir: Vec3 = v3();
    onMove(Dir: Vec3) {
        // 检查CD
        if (this.SkillTime > 0) return;
        // 激活并显示瞄准线
        this.Lineofsight.active = true;

        if (this.Lineofsight.activeInHierarchy) {
            this.dir = Dir;
        }
    }

    onStopMove() {
        // 隐藏瞄准线
        this.Lineofsight.active = false;
        // 检查技能CD
        if (this.SkillTime > 0) {
            return;
        }
        //召唤天火
        this.ShootBullet();
    }

    private PosArray: Vec3[] = [v3(-100, 0), v3(-0, 0), v3(100, 0), v3(0, 100), v3(0, 0), v3(0, -100),];
    // 召唤天火
    ShootBullet() {
        this.SkillTime = this.SkillMaxTime;
        SJZXD_AudioManager.globalAudioPlay("不死勾技能音效");
        let bullet = instantiate(this.SkillPre);
        bullet.setParent(SJZXD_GameManager.Instance.GameNode);
        bullet.setWorldPosition(this.Lineofsight.worldPosition.clone());
        bullet.getComponent(SJZXD_Skill_LieHuoFengTian).Show(this.FindUnit.Camp, this.SkillAttack);
    }

}


