import { _decorator, Component, director, instantiate, Node, Prefab, sp, v3, Vec2, Vec3 } from 'cc';
import { SJZGMMT_I_weapon } from './InterFace/SJZGMMT_I_weapon';
import { SJZGMMT_Constant } from './SJZGMMT_Constant';
import { SJZGMMT_EventManager } from './SJZGMMT_EventManager';
import { SJZGMMT_Bullet } from './SJZGMMT_Bullet';
import { SJZGMMT_PoolManager } from './SJZGMMT_PoolManager';
import { SJZGMMT_AudioManager } from './SJZGMMT_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_Gun')
export class SJZGMMT_Gun extends SJZGMMT_I_weapon {
    @property(Prefab)
    public BulletPre: Prefab = null;
    @property()
    public ATKTime: number = 0.6;//攻击大约在动画的百分比
    private _camp: number = 0;//默认阵营
    private _attack: number = 10;//默认伤害
    private _speed: number = 1;//默认攻速
    _bulletnum: number = 0;//当前子弹数量
    _Maxbulletnum: number = 0;//最大子弹数量
    private _bullettime: number = 0;//换弹时间
    private _skeleton: sp.Skeleton = null;
    _state: number = -1;
    private _animationTrack: sp.spine.TrackEntry = null;

    public fireRate: number = 0.1; // 射击间隔（秒）
    private _isReloading: boolean = false; // 是否在换弹
    private _lastShotTime: number = -1; // 上次射击时间
    private _attackInterval: number = 0.1; // 基础射击间隔
    private _muzzleNode: Node = null;

    private _pendingStop: boolean = false; // 标记是否需要在动画完成后停止攻击
    private _shouldAttackAgain: boolean = false; // 标记是否应该再次攻击
    private _isAttacking: boolean = false; // 当前是否处于攻击按键状态
    private _attackTriggered: boolean = false; // 标记攻击是否已触发

    protected onLoad(): void {
        this._WeaponData = SJZGMMT_Constant.getWeaponDataByName(this.node.name);
        this._skeleton = this.node.getChildByName("动画").getComponent(sp.Skeleton);
        this._bulletnum = this._WeaponData.弹夹容量;
        this._Maxbulletnum = this._WeaponData.弹夹容量;
        this._bullettime = this._WeaponData.换弹时间;
        this._speed = this._WeaponData.射速;
        this._muzzleNode = this.node.getChildByPath("动画/枪口位置");
        this.SetState(0);

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
        Attack = Attack / this._speed / 2;//跟随攻速动态改变伤害
        Attack = Attack * ((3 + this._bullettime) / 3);//换弹时间补偿
        this._attack = Attack;
    }

    Attack() {
        if (this._isReloading) return;
        this._isAttacking = true; // 标记当前处于攻击按键状态
        // 如果当前正在攻击，设置再次攻击标记
        if (this._state === 1) {
            this._shouldAttackAgain = true;
            // 取消待机请求
            this._pendingStop = false;
        } else {
            // 开始新的攻击
            this.SetState(1);
        }
    }
    StopAttack() {
        this._isAttacking = false; // 标记当前不再处于攻击按键状态

        // 如果当前正在攻击动画中，标记稍后停止
        if (this._state === 1) {
            this._pendingStop = true;
        }
    };
    // 射击逻辑
    private shoot(): void {
        if (this._isReloading) return; // 添加换弹状态检查
        // 检查是否有弹药
        if (this._bulletnum <= 0) {
            this.Reload(); // 自动换弹
            return;
        }
        // 创建子弹
        this.createBullet();
        this._bulletnum--;
    }
    // 创建子弹
    private async createBullet(): Promise<void> {
        if (!this.node?.activeInHierarchy) {
            return;
        }
        try {
            SJZGMMT_AudioManager.globalAudioPlay(this._WeaponData.开枪音效);
            // 计算子弹朝向
            const direction = this.node.forward;
            // 将子弹添加到场景中
            if (this.node.parent.parent.parent) {
                // 读取子弹
                const bulletNode = SJZGMMT_PoolManager.Instance.Get(this.BulletPre, this.node.parent.parent.parent
                    , this._muzzleNode.worldPosition.clone()
                );
                // 设置子弹的初始速度和方向
                const bulletScript = bulletNode.getComponent(SJZGMMT_Bullet); // 假设子弹有SJZXD_Bullet组件
                if (bulletScript) {
                    let angle = this.node.getChildByName("动画").angle;
                    if (this.node.worldScale.x < 0) {
                        angle = 180 - angle;
                    }
                    // 设置子弹属性
                    bulletScript.Setproperty(angle, this._camp, this._attack);
                }
            }

        } catch (error) {
            console.error("创建子弹失败:", error);
        }
    }

    //换弹
    Reload() {
        if (this._isReloading || this._bulletnum === this._Maxbulletnum) return;
        SJZGMMT_AudioManager.globalAudioPlay("换弹音效");
        this._isReloading = true;
        // 在换弹时停止攻击动画
        this.SetState(0);
        // 换弹
        setTimeout(() => {
            this._bulletnum = this._Maxbulletnum;
            this._isReloading = false;
            // 换弹完成后，如果仍在攻击状态，则重新开始攻击
            if (this._isAttacking) {
                this.SetState(1);
            }
        }, this._bullettime * 1000);
        if (this.node.parent.parent.name == "Player") {
            director.getScene().emit(SJZGMMT_EventManager.主角换弹, this._bullettime);
        }
    };
    // 检查是否需要换弹
    public needReload(): boolean {
        return this._bulletnum <= 0 && !this._isReloading;
    }
    // 获取当前弹药百分比
    public getAmmoPercentage(): number {
        return this._bulletnum / this._Maxbulletnum;
    }

    //武器旋转到指定敌人
    public SetWeaponRotation(EnemyPos: Vec3) {
        // 获取敌人相对于当前节点的位置
        let dir = EnemyPos.clone().subtract(this._skeleton.node.worldPosition.clone());
        // 计算世界空间中的角度
        let angle = Math.atan2(dir.y, dir.x) * 180 / Math.PI;
        // 如果朝左翻转了，需要调整角度
        if (this.node.parent.scale.x < 0) {
            // 当角色翻转时，调整武器角度
            angle = 180 - angle;
        }
        this._skeleton.node.angle = angle;
    }
    //武器旋转到指定角度
    public SetWeaponRotationToAngle(Angle: number) {
        if (this.node.parent.scale.x < 0) {
            // 当角色翻转时，调整武器角度
            Angle = 180 - Angle;
        }
        this._skeleton.node.angle = Angle;
    }
    //武器翻转角度
    public SetWeaponFlip() {
        this.SetWeaponRotationToAngle(180 - this._skeleton.node.angle);
    }

    SetState(state: number) {
        if (!this.node?.activeInHierarchy) {
            return;
        }
        if (this._state == state) return;
        this._state = state;
        if (state == 0) {
            this._skeleton.setAnimation(0, "daiji", true);
            this._attackTriggered = false;
            this._pendingStop = false; // 重置待机标记
        } else {
            // 监听动画事件，用于在特定时间点触发射击
            this._skeleton?.setStartListener((trackEntry) => {
                if (trackEntry.animation.name === "gongji") {
                    this._attackTriggered = false;
                    this.scheduleOnce(() => {
                        if (!this._attackTriggered) {
                            this._attackTriggered = true;
                            this.onAttackTrigger(); // 触发射击
                        }
                    }, (trackEntry.animationEnd - trackEntry.animationStart) * this.ATKTime / this._speed); // 在动画指定时间处触发射击
                }
            });
            if (this._bulletnum <= 0) {
                this.Reload(); // 自动换弹
                this.SetState(0);
                return;
            }
            // 播放攻击动画
            this._animationTrack = this._skeleton?.setAnimation(0, "gongji", false); // 设置为false，播放一次
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
                        // 重新开始攻击动画，需要先切换到待机再切换回攻击
                        this._skeleton.setCompleteListener(null); // 移除之前的监听器
                        this.SetState(0); // 先切换到待机状态
                        this.scheduleOnce(() => {
                            this.SetState(1); // 然后重新开始攻击
                        }, 0.01); // 很短的延迟确保状态切换生效
                    } else {
                        // 否则切换到待机状态
                        this.SetState(0);
                    }
                }
            });


        }
    }

    private onAttackTrigger() {
        if (this._isReloading) return;

        // 检查是否有弹药
        if (this._bulletnum <= 0) {
            this.Reload(); // 自动换弹
            return;
        }

        // 检查是否可以射击（基于射速）
        const currentTime = Date.now() / 1000;
        const timeSinceLastShot = currentTime - this._lastShotTime;
        const effectiveFireRate = this._attackInterval / this._speed; // 根据攻速调整
        if (timeSinceLastShot >= effectiveFireRate) {
            this.shoot();
            this._lastShotTime = currentTime;
        }
    }
}


