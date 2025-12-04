import { _decorator, Animation, Camera, CCInteger, clamp, Component, director, Event, EventTouch, Label, Node, ParticleSystem, RigidBody, Size, size, Sprite, tween, UIOpacity, UITransform, v3, Vec2, Vec3 } from 'cc';
import { NJWD_GameManager } from './NJWD_GameManager';
import { NJWD_UI, NJWD_Events } from './NJWD_UI';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
const { ccclass, property } = _decorator;

@ccclass('NJWD_Player')
export class NJWD_Player extends Component {

    @property(CCInteger)
    id: number = 0;

    @property(RigidBody)
    movePlayer: RigidBody;

    @property(ParticleSystem)
    particle: ParticleSystem;

    @property(Node)
    moveButtons: Node;

    @property(Node)
    shootPanel: Node;

    @property(Node)
    panel: Node;

    @property(Node)
    ammos: Node;

    @property(Node)
    shoot: Node;

    @property(Node)
    move: Node;

    @property(Node)
    switchBan: Node;

    @property(Node)
    fade: Node;

    @property(Node)
    hit: Node;

    @property(Node)
    camera: Node;

    @property(Node)
    cameraCenter: Node;

    @property([Node])
    cameraPoints: Node[] = [];

    @property([Node])
    hps: Node[] = [];

    moveX = 0;
    canMove = true;
    lastPos: Vec2;

    protected onLoad(): void {
        this.ControlEvent();
        this.FunctionEvent();
    }

    protected update(dt: number): void {
        if (this.movePlayer.node.active && this.canMove) this.movePlayer.setLinearVelocity(v3(this.moveX, 0));
        else this.movePlayer.setLinearVelocity(Vec3.ZERO);
    }

    ControlEvent() {
        this.moveButtons.children[0].on(Node.EventType.TOUCH_START, this.MoveStart, this);
        this.moveButtons.children[0].on(Node.EventType.TOUCH_END, this.MoveEnd, this);
        this.moveButtons.children[0].on(Node.EventType.TOUCH_CANCEL, this.MoveEnd, this);
        this.moveButtons.children[this.moveButtons.children.length - 1].on(Node.EventType.TOUCH_START, this.MoveStart, this);
        this.moveButtons.children[this.moveButtons.children.length - 1].on(Node.EventType.TOUCH_END, this.MoveEnd, this);
        this.moveButtons.children[this.moveButtons.children.length - 1].on(Node.EventType.TOUCH_CANCEL, this.MoveEnd, this);
        this.shootPanel.on(Node.EventType.TOUCH_START, this.RotateStart, this);
        this.shootPanel.on(Node.EventType.TOUCH_MOVE, this.RotateMove, this);
    }

    FunctionEvent() {
        EventManager.on(NJWD_Events.ReadyShoot, this.ReadyShoot, this);
        EventManager.on(NJWD_Events.ReadyCount, this.ReadyCount, this);
        EventManager.on(NJWD_Events.InShoot, this.InShoot, this);
        EventManager.on(NJWD_Events.Shoot, this.ShowBullet, this);
        EventManager.on(NJWD_Events.ShowHit, this.ShowHit, this);
        EventManager.on(NJWD_Events.ShootEnd, this.ShootEnd, this);
        EventManager.on(NJWD_Events.Execution, this.Execute, this);
        EventManager.on(NJWD_Events.Hurt, this.ShowHp, this);
    }

    MoveStart(event: EventTouch) {
        if (NJWD_UI.Instance.ammo == 0 || NJWD_UI.Instance.isHit) return;
        let node: Node = event.target;
        this.moveX = (node.getSiblingIndex() == 0 ? -1.5 : 1.5) * (this.id == 0 ? 1.5 : -1.5);
    }

    MoveEnd(event: EventTouch) {
        this.moveX = 0;
    }

    Action(event: Event) {
        let node: Node = event.target;
        this.movePlayer.getComponent(Animation).play(`Action${node.getSiblingIndex()}`);
    }

    RotateStart(event: EventTouch) {
        this.lastPos = event.getUILocation();
    }

    RotateMove(event: EventTouch) {
        let pos = event.getUILocation();
        let dir = new Vec2;
        Vec2.subtract(dir, pos, this.lastPos);
        dir = dir.multiplyScalar(0.025);
        let euler = this.camera.eulerAngles.clone();
        euler.x = clamp(euler.x + dir.y, -90, 90);
        euler.y = clamp(euler.y - dir.x, -90, 90);
        this.camera.setRotationFromEuler(euler);
        this.lastPos = pos;
    }

    Shoot() {
        if (NJWD_UI.Instance.ammo == 0 || NJWD_UI.Instance.isHit) return;
        NJWD_GameManager.Instance.Shoot();
        NJWD_UI.Instance.Shoot();
        if (NJWD_UI.Instance.ammo == 0 && !NJWD_UI.Instance.isHit) this.scheduleOnce(() => { EventManager.emit(NJWD_Events.ShootEnd); }, 0.5);
    }

    ShowBullet() {
        let bullet = this.ammos.children[NJWD_UI.Instance.ammo].children[0];
        tween(bullet)
            .to(0.25, { scale: v3(1.2, 1.2, 1.2) })
            .start();
        tween(bullet.getComponent(UIOpacity))
            .to(0.5, { opacity: 0 })
            .start();
    }

    ReadyShoot() {
        if (NJWD_GameManager.Instance.hunter == this.id) {
            this.camera.setParent(this.cameraPoints[0], true);
            this.camera.getComponent(Camera).fov = 20;
        }
        else {
            this.camera.setParent(this.cameraPoints[2], true);
            this.camera.setRotationFromEuler(Vec3.ZERO);
            this.particle.play();
        }
        this.camera.setPosition(Vec3.ZERO);
        this.shoot.active = false;
        this.move.active = NJWD_GameManager.Instance.hunter != this.id;
        this.panel.active = true;
        this.panel.children[0].active = true;
        this.panel.children[1].active = false;
        this.panel.children[0].children[0].getComponent(Label).string = NJWD_GameManager.Instance.hunter == this.id ? "敌人正在躲藏……" : "敌人即将射击……";
        this.panel.children[0].children[1].getComponent(Label).string = NJWD_UI.Instance.time.toString();
    }

    ReadyCount() {
        this.panel.children[0].children[1].getComponent(Label).string = NJWD_UI.Instance.time.toString();
    }

    InShoot() {
        NJWD_UI.Instance.isHit = false;
        this.panel.children[0].active = false;
        this.panel.children[1].active = true;
        this.particle.stopEmitting();
        for (let i = 0; i < this.ammos.children.length; i++) {
            const element = this.ammos.children[i].children[0];
            element.setScale(Vec3.ONE);
            element.getComponent(UIOpacity).opacity = 255;
        }
        this.shoot.active = NJWD_GameManager.Instance.hunter == this.id;
        if (NJWD_GameManager.Instance.hunter == this.id) {
            this.camera.setParent(this.cameraPoints[1], true);
            this.camera.setPosition(Vec3.ZERO);
            this.camera.children[0].active = true;
        }
    }

    ShowHit(damage: number) {
        let num = damage == 100 ? 0 : damage == 30 ? 1 : 2;
        this.hit.getComponent(Sprite).spriteFrame = NJWD_UI.Instance.hitSfs[num];
        this.hit.setScale(v3(2, 2, 1));
        tween(this.hit)
            .to(0.25, { scale: Vec3.ONE })
            .start();
        tween(this.hit.getComponent(UIOpacity))
            .to(0.25, { opacity: 255 })
            .delay(0.5)
            .to(0.25, { opacity: 0 })
            .start();
    }

    ShootEnd() {
        this.moveX = 0;
        this.switchBan.active = true;
        this.switchBan.children[0].getComponent(Label).string = NJWD_UI.Instance.isHit ? "击中对手，切换射击方" : "未命中，切换射击方";
        this.switchBan.setPosition(v3(-1500, 0));
        tween(this.switchBan)
            .to(0.5, { position: Vec3.ZERO })
            .delay(1)
            .to(0.5, { position: v3(1500, 0) })
            .delay(0.5)
            .call(() => {
                this.Fade(() => { NJWD_GameManager.Instance.ReadyShoot(); })
            })
            .start();
    }

    Fade(call: Function) {
        this.fade.active = true;
        tween(this.fade.getComponent(UITransform))
            .to(0.5, { contentSize: Size.ZERO })
            .call(() => {
                this.camera.children[0].active = false;
                let arr = [...NJWD_GameManager.Instance.brokenBricks.children];
                for (let i = 0; i < arr.length; i++) {
                    const element = arr[i];
                    PoolManager.PutNode(element);
                }
                call();
            })
            .delay(0.5)
            .to(0.5, { contentSize: size(2000, 2000) })
            .call(() => { this.fade.active = false; })
            .start();
    }

    Execute() {
        this.camera.setParent(NJWD_GameManager.Instance.bullet.children[1]);
        this.camera.setPosition(Vec3.ZERO);
        this.camera.setRotationFromEuler(Vec3.ZERO);
        this.camera.getComponent(Camera).near = 0.1;
        this.camera.getComponent(Camera).fov = 45;
        NJWD_GameManager.Instance.guns.forEach(element => { element.active = false; });
        this.shoot.active = false;
        this.move.active = false;
        this.scheduleOnce(() => { this.camera.setParent(director.getScene(), true); }, 3);
    }

    ShowHp() {
        this.hps[0].children[0].getComponent(Sprite).fillRange = NJWD_GameManager.Instance.PlayerHp / 100;
        this.hps[0].children[2].getComponent(Label).string = NJWD_GameManager.Instance.PlayerHp.toString();
        this.hps[1].children[0].getComponent(Sprite).fillRange = NJWD_GameManager.Instance.EnemyHp / 100;
        this.hps[1].children[2].getComponent(Label).string = NJWD_GameManager.Instance.EnemyHp.toString();
    }

}


