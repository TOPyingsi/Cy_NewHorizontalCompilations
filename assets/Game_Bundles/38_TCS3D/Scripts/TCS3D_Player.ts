import { _decorator, AudioClip, AudioSource, BoxCollider, Collider, ColliderComponent, Component, director, ICollisionEvent, instantiate, IPhysics2DContact, ITriggerEvent, Node, NodeEventType, PhysicsSystem, Prefab, RigidBody, SphereCollider, Sprite, v3, Vec3 } from 'cc';
import { TCS3D_Body } from './TCS3D_Body';
import { TCS3D_Food } from './TCS3D_Food';
import { AudioManager } from 'db://assets/Scripts/Framework/Managers/AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

const v3_move = v3();

@ccclass('TCS3D_Player')
export class TCS3D_Player extends Component {
    @property(AudioClip)
    jumpClip: AudioClip = null;

    @property(AudioClip)
    eatClip: AudioClip = null;

    @property(Prefab)
    bodyPrefab: Prefab = null;

    @property(Node)
    cameraNode: Node = null;

    @property(Node)
    JumoBtn: Node = null;

    @property(Node)
    bodyNodeRoot: Node = null;
    public bodyInterval: number = 0.5;
    public bodyLength: number = 1;
    public bodyNodes: Node[] = [];

    public rigBody: RigidBody = null;
    public colider: Collider = null;
    public eatColider: Collider = null;

    public jumpCD: number = 1;
    public isJump: boolean = false;
    public jumpHeight: number = 1000;

    private jumpBg: Sprite = null;

    private _isMoving: boolean = false;
    private _moveSpeed: number = 3;
    private _dir: Vec3 = v3(0, 0, 0);

    private _model: Node = null;

    private _targetPosition: Vec3 = new Vec3();
    private _lastPosition: Vec3 = new Vec3();

    start() {
        this.initData();
        PhysicsSystem.instance.debugDrawFlags = 1;
    }

    //初始值
    creatBody(num: number) {

        for (let i = 0; i < num; i++) {
            let bodyNode = instantiate(this.bodyPrefab);

            bodyNode.parent = this.bodyNodeRoot;

            if (i === 0) {
                let bodyTs = this.bodyNodeRoot.children[0].getComponent(TCS3D_Body);
                bodyTs.init(this._model.children[0]);
                continue;
            }

            let bodyTs = bodyNode.getComponent(TCS3D_Body);
            bodyTs.init(this.bodyNodes[i - 1]);

            if (i > 15) {
                bodyNode.getComponent(RigidBody).enabled = true;
                bodyNode.getComponent(BoxCollider).enabled = true;
            }
        }

        console.log(this.bodyNodes);
    }

    //吃食物后变长
    addBody(num: number) {

        let length = this.bodyNodes.length;

        for (let i = 0; i < num; i++) {
            let bodyNode = instantiate(this.bodyPrefab);
            bodyNode.parent = this.bodyNodeRoot;

            let bodyTs = bodyNode.getComponent(TCS3D_Body);
            bodyTs.init(this.bodyNodes[length + i - 1]);

            if (length >= 10) {
                bodyNode.getComponent(RigidBody).enabled = true;
                bodyNode.getComponent(BoxCollider).enabled = true;
            }

        }

    }

    updateTimer: number = 0;
    jumpTimer: number = 0;
    update(deltaTime: number) {
        this.cameraNode.parent.worldPosition = this.node.worldPosition.clone();

        if (this._model.worldPosition !== this._lastPosition) {
            let distance = this._model.children[0].worldPosition.clone().subtract(this._lastPosition.clone());
            let length = distance.clone().length();

            let speedY: Vec3 = v3(0, 0, 0);
            this.rigBody.getLinearVelocity(speedY);

            if (speedY.y <= -15) {
                this.rigBody.applyLocalForce(new Vec3(0, 50, 0));
                console.log(111);
            }

            if (length > 0.2) {
                this._lastPosition = this._model.worldPosition.clone();
                this.updateBodyNodes();
            }

        }

        if (this._isMoving) {
            this.updateTimer += deltaTime;

            let jumpY: Vec3 = v3(0, 0, 0);

            this.rigBody.getLinearVelocity(jumpY);

            v3_move.y = jumpY.y;

            //运动学
            // this.node.worldPosition = v3(v3_move.x * deltaTime, 0, v3_move.z * deltaTime);

            //重力学
            this.rigBody.setLinearVelocity(v3_move);

        }

        if (this.isJump) {

            this.jumpCD -= deltaTime;
            this.jumpBg.fillRange = this.jumpCD / 1;

            // Vec3.copy(this._lastPosition, this._model.children[0].worldPosition);

            this.jumpTimer += deltaTime;

            // if (this.jumpTimer >= 0.02) {
            //     this.updateBodyNodes();
            // }

            if (this.jumpCD > 0.2 && this.jumpCD < 0.8) {
                this.rigBody.applyLocalForce(new Vec3(0, this.jumpForce, 0));
            }

            if (this.jumpCD <= 0) {
                this.jumpCD = 1;
                this.isJump = false;

                this.jumpBg.fillRange = 0;
            }

            return;

        }
    }

    updateBodyNodes() {
        if (this.bodyNodes.length === 0) return;

        // 第一个身体节点跟随蛇头
        const firstBody = this.bodyNodes[0].getComponent(TCS3D_Body);
        if (firstBody) {
            firstBody.followTarget(this._lastPosition);
        }

        // 更新其余身体节点
        for (let x = 1; x < this.bodyNodes.length; x++) {
            const currentBody = this.bodyNodes[x].getComponent(TCS3D_Body);
            const prevBody = this.bodyNodes[x - 1].getComponent(TCS3D_Body);

            if (currentBody && prevBody) {
                let distance = prevBody.lastPosition.clone().subtract(currentBody.lastPosition.clone());
                let length = distance.length();
                if (length > 0.2) {
                    // currentBody.node.forward = prevBody.node.forward;
                    currentBody.followTarget(prevBody.lastPosition);
                }
            }
        }
    }

    onMove(Dir: Vec3) {
        let dir = v3(Dir.x, 0, -Dir.y).normalize();

        this._dir = dir;

        let radian = Vec3.angle(Vec3.FORWARD, v3(this.cameraNode.parent.forward.x, 0, this.cameraNode.parent.forward.z).normalize());    //Vec3.FORWARD（0，0，-1）

        if (this.cameraNode.parent.eulerAngles.y < 0) {
            radian = this.cameraNode.parent.eulerAngles.y % 360 >= -180 ? -radian : radian;
        }

        if (this.cameraNode.parent.eulerAngles.y >= 0) {
            radian = this.cameraNode.parent.eulerAngles.y % 360 >= 180 ? -radian : radian;
        }

        Vec3.rotateY(v3_move, this._dir, Vec3.ZERO, radian);

        v3_move.multiplyScalar((this._moveSpeed));

        this._model.forward = v3_move.clone().negative();

        this._isMoving = true;
    }

    preDir: Vec3 = v3(0, 0, 0);
    onStopMove() {
        this.preDir = this._dir.clone();
        this._dir = v3(0, 0, 0);
        v3_move.set(0, 0, 0);
        this._isMoving = false;
    }

    onJump() {
        if (this.isJump) {
            return;
        }


        this.isJump = true;

        let flag = this._dir.length() === 0 ? true : false;

        if (!flag) {
            this.rigBody.applyLocalForce(new Vec3(0, this.jumpHeight, 0));
            this.audio.playOneShot(this.jumpClip);
            console.log(this._dir);
        }
        if (this.preDir && this._dir === Vec3.ZERO) {
            this.rigBody.applyLocalForce(new Vec3(this.preDir.x * 100, this.jumpHeight, this.preDir.y * 100));
        }

        this.jumpBg.fillRange = 1;
    }

    jumpForce = 30;
    onBeginContact(event: ICollisionEvent) {
        console.log(event.otherCollider.node.name);

        let group = event.otherCollider.node;

        if (group.name !== "Body") {
            return;
        }

        if (group.name === "Body") {
            if (this.isJump) {
                this.jumpForce = 0;
                // this.isJump = false;
                // this.jumpCD = 1.2;
                // this.jumpBg.fillRange = 0;
            }

            // // 获取当前刚体的速度
            // let velocity = new Vec3();
            // this.rigBody.getLinearVelocity(velocity);
            // // 计算一个反向的力，这里可以根据需要调整力的计算方式
            // let reverseForce = velocity.negative().multiplyScalar(0.5);
            // // 施加冲量，注意冲量会立即改变速度，力会随着时间持续作用
            // this.rigBody.applyImpulse(reverseForce);

            console.log("跳到蛇身");

        }
        else {
            this.jumpForce = 30;
        }

    }

    audio: AudioSource = null;
    onBeginTrigger(event: ITriggerEvent) {
        console.log(event.otherCollider.node.name);

        let group = event.otherCollider.node;

        if (group.name === "Food") {
            // AudioManager.Instance.PlaySFX(this.eatClip);

            this.audio.playOneShot(this.eatClip);

            group.destroy();
            this.addBody(1);
            let foodTs = group.getComponent(TCS3D_Food);
            director.getScene().emit("贪吃蛇3D_得分", foodTs.score);

            console.log("吃食物");
        }

        if (group.name === "FinnalFood") {
            group.destroy();
            this.addBody(3);
            let foodTs = group.getComponent(TCS3D_Food);
            director.getScene().emit("贪吃蛇3D_得分", foodTs.score);

            director.getScene().emit("贪吃蛇3D_胜利");

            ProjectEventManager.emit(ProjectEvent.游戏结束);

        }

    }

    //脱离卡死
    getOutJam() {

        for (let i = 0; i < this.bodyNodes.length; i++) {
            this.bodyNodes[i].getComponent(BoxCollider).isTrigger = true;
        }

        this.scheduleOnce(() => {
            for (let i = 0; i < this.bodyNodes.length; i++) {
                this.bodyNodes[i].getComponent(BoxCollider).isTrigger = false;
            }
        }, 2);
    }

    initData() {
        this._model = this.node.getChildByName("PlayerModel");

        this.rigBody = this.node.getComponent(RigidBody);
        this.colider = this.node.getComponent(Collider);
        this.eatColider = this._model.getChildByName("EatBox").getComponent(Collider);

        this.jumpBg = this.JumoBtn.getChildByName("JumpBlack").getComponent(Sprite);
        this.jumpBg.fillRange = 0;

        this.bodyNodes = this.bodyNodeRoot.children;

        director.getScene().on("贪吃蛇3D_开始跳跃", this.onJump, this);

        director.getScene().on("贪吃蛇3D_开始移动", this.onMove, this);
        director.getScene().on("贪吃蛇3D_停止移动", this.onStopMove, this);

        director.getScene().emit("贪吃蛇3D_相机跟随玩家", this.node);

        // 初始化目标位置和上一帧位置
        Vec3.copy(this._targetPosition, this._model.children[0].worldPosition);
        Vec3.copy(this._lastPosition, this._model.children[0].worldPosition);

        this.creatBody(5);
        this.updateBodyNodes();

        this.colider.on("onCollisionEnter", this.onBeginContact, this);
        this.colider.on("onCollisionExit", this.onCollisionExit, this);
        this.eatColider.on("onTriggerEnter", this.onBeginTrigger, this);

        this.audio = this.getComponent(AudioSource);
    }

    onCollisionExit() {

    }
}


