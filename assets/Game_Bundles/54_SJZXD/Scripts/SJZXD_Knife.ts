import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, sp, v3, Vec3 } from 'cc';
import { SJZXD_I_weapon } from './InterFace/SJZXD_I_weapon';
import { SJZXD_Unit } from './SJZXD_Unit';
import { SJZXD_AudioManager } from './SJZXD_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_Knife')
export class SJZXD_Knife extends SJZXD_I_weapon {
    @property()
    public ATKTime: number = 0.6;//攻击大约在动画的百分比

    private AttackBox: Node = null;
    private AttackBoxStartPos: Vec3 = v3();
    private _camp: number = 0;//默认阵营
    private _attack: number = 10;//默认伤害
    private _speed: number = 1;//默认攻速
    private _skeleton: sp.Skeleton = null;
    _bulletnum: number = 0;//当前子弹数量
    _Maxbulletnum: number = 0;//最大子弹数量
    _state: number = -1;

    private _isPlaying: boolean = false;
    private _animationTrack: sp.spine.TrackEntry = null;

    private _pendingStop: boolean = false; // 标记是否需要在动画完成后停止攻击
    private _shouldAttackAgain: boolean = false; // 标记是否应该再次攻击
    private _isAttacking: boolean = false; // 当前是否处于攻击按键状态
    protected onLoad(): void {
        this._skeleton = this.node.getComponent(sp.Skeleton);
    }
    protected start(): void {
        this.AttackBox = this.node.getChildByName("AttackBox");
        this.AttackBoxStartPos = this.AttackBox.position.clone();
        this.AttackBox.getComponent(Collider2D).on(Contact2DType.BEGIN_CONTACT, this.onStartContact, this);
        this.SetState(0);
    }
    //触碰到单位
    onStartContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.node.getComponent(SJZXD_Unit)) {
            if (otherCollider.node.getComponent(SJZXD_Unit)?.Camp != this._camp) {
                otherCollider.node.getComponent(SJZXD_Unit).TakeDamage(this._attack / this._speed);
            }
        }
    }

    //下达攻击指令
    Attack() {
        this._isAttacking = true; // 标记当前处于攻击按键状态

        // 如果当前正在攻击，设置再次攻击标记，但不立即执行
        if (this._state === 1) {
            this._shouldAttackAgain = true;
            // 取消待机请求
            this._pendingStop = false;
        } else {
            // 开始新的攻击
            this.SetState(1);
        }
    }
    //停止攻击指令
    StopAttack() {
        this._isAttacking = false; // 标记当前不再处于攻击按键状态

        // 如果当前正在攻击动画中，标记稍后停止
        if (this._state === 1 && this._isPlaying) {
            this._pendingStop = true;
        } else {
            // 如果不在攻击状态，直接切换到待机
            this.SetState(0);
        }
    }
    //设置武器速度
    SetSpeed(Speed: number) {
        this._speed = Speed;
        // 如果当前正在播放攻击动画，则更新播放速度
        if (this._state === 1 && this._animationTrack) {
            this._animationTrack.timeScale = this._speed;
        }
    }
    //设置武器阵营
    SetCamp(Camp: number) {
        this._camp = Camp;
    }
    //设置武器伤害
    SetAttack(Attack: number) {
        this._attack = Attack;
    }


    //改变状态（0为待机1为攻击）
    SetState(state: number) {
        if (this._state == state) return;
        this._state = state;
        if (state == 0) {
            this._skeleton.setAnimation(0, "daiji", true);
            this._isPlaying = false;
            this._pendingStop = false; // 重置待机标记
        } else {
            // 播放攻击动画
            this._animationTrack = this._skeleton.setAnimation(0, "gongji", false); // 设置为false，播放一次
            this._animationTrack.timeScale = this._speed; // 根据攻速设置播放速度

            // 监听动画播放进度
            this._skeleton.setCompleteListener((trackEntry) => {
                if (trackEntry.animation.name === "gongji") {
                    // 动画播放完成，检查是否需要停止攻击或继续攻击
                    if (this._pendingStop) {
                        // 如果有停止请求，切换到待机状态
                        this._pendingStop = false;
                        this.SetState(0);
                    } else if (this._shouldAttackAgain || this._isAttacking) {
                        // 如果有再次攻击标记或当前仍在攻击按键状态，继续攻击
                        this._shouldAttackAgain = false;
                        this._animationTrack = this._skeleton.setAnimation(0, "gongji", false);
                        this._animationTrack.timeScale = this._speed;
                    } else {
                        // 否则切换到待机状态
                        this.SetState(0);
                    }
                }
            });

            // 监听动画事件，用于在特定时间点触发攻击
            this._skeleton.setStartListener((trackEntry) => {
                if (trackEntry.animation.name === "gongji") {
                    this.scheduleOnce(() => {
                        this.onAttackTrigger(); // 触发攻击
                    }, (trackEntry.animationEnd - trackEntry.animationStart) * this.ATKTime / this._speed); // 在动画60%处触发攻击
                }
            });

            this._isPlaying = true;
        }
    }

    // 攻击触发
    private onAttackTrigger() {
        SJZXD_AudioManager.globalAudioPlay("近战攻击");
        this.AttackBox.active = true;
        this.AttackBox.position = this.AttackBoxStartPos.clone();
        this.scheduleOnce(() => {
            this.AttackBox.active = false;
        })
    }
}


