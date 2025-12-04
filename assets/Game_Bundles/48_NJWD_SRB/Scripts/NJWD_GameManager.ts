import { _decorator, Animation, Camera, Collider, Component, director, geometry, Label, Node, ParticleSystem, PhysicsSystem, quat, Quat, randomRange, randomRangeInt, RigidBody, Sprite, Tween, tween, v3, Vec3, view } from 'cc';
import { NJWD_Events, NJWD_UI } from './NJWD_UI';
import { NJWD_Walls } from './NJWD_Walls';
import { NJWD_AudioManager } from './NJWD_AudioManager';
import { EasingType } from 'db://assets/Scripts/Framework/Utils/TweenUtil';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { NJWD_Player } from './NJWD_Player';
const { ccclass, property } = _decorator;

@ccclass('NJWD_GameManager')
export class NJWD_GameManager extends Component {

    private static instance: NJWD_GameManager;
    public static get Instance(): NJWD_GameManager {
        return this.instance;
    }

    @property(Camera)
    UICamera: Camera;

    @property(ParticleSystem)
    blood: ParticleSystem;

    @property(Node)
    laser: Node;

    @property(Node)
    brokenBricks: Node;

    @property(Node)
    bullet: Node;

    @property([Node])
    ufos: Node[] = [];

    @property([Node])
    player1: Node[] = [];

    @property([Node])
    player2: Node[] = [];

    @property([Node])
    guns: Node[] = [];

    @property([NJWD_Player])
    players: NJWD_Player[] = [];

    private playerHp = 100;
    public get PlayerHp(): number {
        return this.playerHp;
    }
    public set PlayerHp(value: number) {
        this.playerHp = value;
        if (this.playerHp <= 0) {
            this.playerHp = 0;
            this.FinishBullet(0);
        }
        else this.scheduleOnce(() => { NJWD_UI.Instance.ShootEnd(); }, 1);
        EventManager.emit(NJWD_Events.Hurt);
    }

    private enemyHp = 100;
    public get EnemyHp(): number {
        return this.enemyHp;
    }
    public set EnemyHp(value: number) {
        this.enemyHp = value;
        if (this.enemyHp <= 0) {
            this.enemyHp = 0;
            this.FinishBullet(0);
        }
        else this.scheduleOnce(() => { NJWD_UI.Instance.ShootEnd(); }, 1);
        EventManager.emit(NJWD_Events.Hurt);
    }

    isReady = false;
    isUfo = false;
    hunter = -1;

    protected onLoad(): void {
        NJWD_GameManager.instance = this;
        PhysicsSystem.instance.gravity = v3(0, -20);
    }

    protected start(): void {
    }

    protected update(dt: number): void {
        this.UFOMove();
    }

    protected onDestroy(): void {
        PhysicsSystem.instance.gravity = v3(0, -80);
    }

    ReadyShoot() {
        if (this.isReady) return;
        this.isReady = true;

        if (this.hunter != -1) {
            this.players[this.hunter].camera.getComponent(Camera).fov = 45;
            this.UFOCancel();
        }
        this.hunter = this.hunter == 0 ? 1 : 0;
        for (let i = 0; i < this.player1.length; i++) {
            const element = this.player1[i];
            element.active = this.hunter == i;
        }
        for (let i = 0; i < this.player2.length; i++) {
            const element = this.player2[i];
            element.active = this.hunter != i;
        }
        NJWD_UI.Instance.ReadyShoot();
    }

    Shoot() {
        NJWD_AudioManager.Instance.PlayShoot();
        let ray = new geometry.Ray;
        ray.o = this.players[this.hunter].camera.getWorldPosition();
        ray.d = this.players[this.hunter].camera.forward;
        let isBrick = false;
        let isHuman = false;
        if (PhysicsSystem.instance.raycast(ray, 0xffffffff, 100, true)) {
            let results = PhysicsSystem.instance.raycastResults;
            for (let i = 0; i < results.length; i++) {
                const element = results[i];
                if (element.collider.node.name == "Brick" && element.collider.node.parent.getComponent(NJWD_Walls)) {
                    if (isBrick) continue;
                    isBrick = true;
                    let brick = element.collider.node;
                    brick.parent.getComponent(NJWD_Walls).Hit(brick);
                }
                else if (element.collider.isTrigger) {
                    if (isHuman) continue;
                    isHuman = true;
                    NJWD_UI.Instance.isHit = true;
                    let name = element.collider.node.name;
                    let damage = 100;
                    if (name == "Chest") damage = 30;
                    else if (name == "Limb") damage = 10;
                    EventManager.emit(NJWD_Events.ShowHit, damage);
                    const hitPoint = element.hitPoint.clone();
                    if (this.hunter == 0) {
                        this.EnemyHp -= damage;
                        if (this.EnemyHp > 0) {
                            this.blood.node.setWorldPosition(hitPoint);
                            this.blood.play();
                        }
                        else this.Execute(hitPoint);
                    }
                    else {
                        this.PlayerHp -= damage;
                        if (this.PlayerHp > 0) {
                            this.blood.node.setWorldPosition(hitPoint);
                            this.blood.play();
                        }
                        else this.Execute(hitPoint);
                    }
                }
            }
        }
    }

    Execute(hitPoint: Vec3) {
        NJWD_UI.Instance.Execute();
        this.bullet.setWorldPosition(this.guns[this.hunter].getWorldPosition());
        this.bullet.lookAt(hitPoint, this.bullet.up);
        tween(this.bullet)
            .to(3, { worldPosition: hitPoint })
            .call(() => {
                this.blood.node.setWorldPosition(hitPoint);
                this.blood.play();
                if (this.hunter == 0) this.player2[1].getComponent(Animation).play("Die");
                else this.player1[1].getComponent(Animation).play("Die");
                this.bullet.active = false;
                NJWD_AudioManager.Instance.PlayHurt();
            })
            .start();
    }

    FinishBullet(num: number) {
        this.scheduleOnce(() => {
            if (num == 0) NJWD_UI.Instance.Win();
            else NJWD_UI.Instance.Fail();
        }, 5);
    }

    UFOFind() {
        this.isUfo = true;
        this.ufos[this.hunter].children[1].active = false;
        Tween.stopAllByTarget(this.ufos[this.hunter]);
        tween(this.ufos[this.hunter])
            .to(1.5, { x: this.hunter == 0 ? this.player2[1].x : this.player1[1].x }, { easing: EasingType.backOut })
            .call(() => { this.ufos[this.hunter].children[1].active = true; })
            .delay(5)
            .call(() => {
                this.ufos[this.hunter].children[1].active = false;
                this.isUfo = false;
            })
            .to(1.5, { x: -50 }, { easing: EasingType.backIn })
            .start();
    }

    UFOMove() {
        if (this.hunter == -1) return;
        if (this.ufos[this.hunter].children[1].active) {
            let pos = this.ufos[this.hunter].getWorldPosition();
            pos.x = this.hunter == 0 ? this.player2[1].x : this.player1[1].x;
            this.ufos[this.hunter].setWorldPosition(pos);
        }
    }

    UFOCancel() {
        this.isUfo = false;
        this.ufos[this.hunter].children[1].active = false;
        Tween.stopAllByTarget(this.ufos[this.hunter]);
        let pos = this.ufos[this.hunter].getWorldPosition();
        pos.x = -50;
        this.ufos[this.hunter].setWorldPosition(pos);
    }

}
