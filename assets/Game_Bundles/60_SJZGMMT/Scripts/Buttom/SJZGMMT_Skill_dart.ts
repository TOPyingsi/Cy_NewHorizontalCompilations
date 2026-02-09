import { _decorator, Component, director, instantiate, Label, Node, Prefab, Sprite, Vec3 } from 'cc';
import { SJZGMMT_Unit } from '../SJZGMMT_Unit';
import { SJZGMMT_I_SkillBtn } from '../InterFace/SJZGMMT_I_SkillBtn';
import { SJZGMMT_EventManager } from '../SJZGMMT_EventManager';
import { SJZGMMT_Bullet } from '../SJZGMMT_Bullet';
import { SJZGMMT_GameManager } from '../SJZGMMT_GameManager';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_Skill_dart')
export class SJZGMMT_Skill_dart extends SJZGMMT_I_SkillBtn {//飞镖技能
    @property(Prefab)
    public SkillPre: Prefab = null;

    public FindUnit: SJZGMMT_Unit = null;
    public FindNode: Node = null;

    public SkillAttack: number = 500;//技能基础伤害
    public SkillNum: number = 9;//技能次数
    public SkillMaxNum: number = 9;//技能最大次数
    public SkillTime: number = 6;//恢复时间
    public SkillMaxTime: number = 6;//最大恢复时间
    private numLabel: Label = null;
    private Lineofsight: Node = null;
    private TimeSprite: Sprite = null;

    start() {
        this.numLabel = this.node.getChildByPath("其他/剩余次数").getComponent(Label);
        this.Lineofsight = this.node.getChildByPath("其他/瞄准线");
        this.TimeSprite = this.node.getChildByPath("其他/技能次数进度条").getComponent(Sprite);
        this.Lineofsight.active = false; // 初始时隐藏瞄准线
        this.Lineofsight.setParent(SJZGMMT_GameManager.Instance.GameNode);
        director.getScene().on(SJZGMMT_EventManager.通用摇杆移动, (tip, dir) => {
            if (tip == "技能_致命飞镖") {
                this.onMove(dir);
            }
        });
        director.getScene().on(SJZGMMT_EventManager.通用摇杆停止, (tip) => {
            if (tip == "技能_致命飞镖") {
                this.onStopMove();
            }
        });
        // 更新初始次数显示
        this.updateNum();
        director.getScene().on(SJZGMMT_EventManager.技能无CD, () => { this.SkillMaxTime = 0.1, this.SkillTime = 0 });
    }

    protected update(dt: number): void {
        if (this.Lineofsight.activeInHierarchy) {
            // 设置瞄准线位置为FindNode的世界坐标
            this.Lineofsight.worldPosition = this.FindNode?.worldPosition.clone();
        }
        if (this.SkillNum < this.SkillMaxNum) {
            this.SkillTime -= dt;
            this.TimeSprite.fillRange = (1 - this.SkillTime / this.SkillMaxTime);
            if (this.SkillTime <= 0) {
                this.SkillTime = this.SkillMaxTime;
                this.SkillNum++;
                this.updateNum();
                this.TimeSprite.fillRange = 1;
            }
        }
    }

    onMove(Dir: Vec3) {
        // 检查是否还有技能使用次数
        if (this.SkillNum <= 0) return;
        // 激活并显示瞄准线
        this.Lineofsight.active = true;
        // 计算角度（弧度转角度）
        const angle = Math.atan2(Dir.y, Dir.x) * 180 / Math.PI;
        this.Lineofsight.angle = angle;
    }

    onStopMove() {
        // 隐藏瞄准线
        this.Lineofsight.active = false;
        // 检查是否有技能使用次数
        if (this.SkillNum <= 0) {
            console.log("技能次数不足");
            return;
        }
        // 发射子弹
        SJZGMMT_AudioManager.globalAudioPlay("道士技能音效");
        this.ShootBullet(this.Lineofsight.angle);
        this.ShootBullet(this.Lineofsight.angle + 15);
        this.ShootBullet(this.Lineofsight.angle - 15);
    }
    // 发射子弹的方法
    ShootBullet(angle: number) {
        if (this.SkillNum <= 0 || !this.SkillPre) return;
        // 减少技能使用次数
        this.SkillNum--;
        this.updateNum();
        // 读取子弹
        const bulletNode = instantiate(this.SkillPre);
        // 设置子弹的初始速度和方向
        const bulletScript = bulletNode.getComponent(SJZGMMT_Bullet);
        if (bulletScript) {
            // 设置子弹属性
            bulletScript.Setproperty(angle, this.FindUnit.Camp, this.SkillAttack);
        }
        // 将子弹添加到场景中
        SJZGMMT_GameManager.Instance.GameNode.addChild(bulletNode);
        bulletNode.setWorldPosition(this.FindNode.worldPosition.clone());

    }
    //刷新剩余次数显示
    updateNum() {
        this.numLabel.string = this.SkillNum.toString();
    }
}


