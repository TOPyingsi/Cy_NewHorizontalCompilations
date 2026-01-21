import { _decorator, Component, Node, Enum, EventTouch, UITransformComponent, Vec3, view, find, UITransform, Input, Touch, Scene, director, geometry, PhysicsSystem, input, Vec2, KeyCode, EventKeyboard, v2, Event, Label, Sprite, Color, v3 } from "cc";
import { GML_Events } from "./GML_Events";
import { GML_GameManager } from "./GML_GameManager";
import { EventManager } from "db://assets/Scripts/Framework/Managers/EventManager";
import Banner from "db://assets/Scripts/Banner";



const { ccclass, property } = _decorator;

const lastLocation: Vec2 = v2();
const dis: Vec2 = v2();

@ccclass("GML_GameUI")
export class GML_GameUI extends Component {
    @property(Node)
    private btnJump:Node = null;

    // @property(Node)
    // private btnJumpBack:Node = null;

    @property(Node)
    private btnBackToMain:Node = null;

    @property(Label)
    private lblResurgenceCount:Label = null;

    
    @property(Node)
    private spProgress:Node = null;

    @property(Node)
    private btnVideo:Node = null;

    progressSpeed:number = 2;

    private jumpTouching: boolean = false;

    private isProgressIncreasing: boolean = true;


    private _cameraArea: UITransform = null;
    private _joystickBase: UITransform = null;

    private _btnReStart: Node = null;

    private _joystickDot: Node = null;

    private _movementTouch: Touch = null;

    private _btnLeft:Node = null;
    private _btnRight:Node = null;
    private _btnUp:Node = null;
    private _btnDown:Node = null;

    start() {
        let joystickArea = this.node.getChildByName(`JoystickArea`).getComponent(UITransform);
        joystickArea.node.on(Input.EventType.TOUCH_START, this.OnTouchStart_JoystickArea, this);
        joystickArea.node.on(Input.EventType.TOUCH_MOVE, this.OnTouchMove_JoystickArea, this);
        joystickArea.node.on(Input.EventType.TOUCH_END, this.OnTouchEnd_JoystickArea, this);
        joystickArea.node.on(Input.EventType.TOUCH_CANCEL, this.OnTouchEnd_JoystickArea, this);

        this._cameraArea = this.node.getChildByName('CameraArea').getComponent(UITransform);
        this._cameraArea.node.on(Input.EventType.TOUCH_START, this.OnTouchStart_CameraArea, this);
        this._cameraArea.node.on(Input.EventType.TOUCH_MOVE, this.OnTouchMove_CameraArea, this);
        this._cameraArea.node.on(Input.EventType.TOUCH_END, this.OnTouchEnd_CameraArea, this);
        this._cameraArea.node.on(Input.EventType.TOUCH_CANCEL, this.OnTouchEnd_CameraArea, this);

        this.btnJump.on(Node.EventType.TOUCH_START, this.onBtnJumpTouchStart, this);
        this.btnJump.on(Node.EventType.TOUCH_MOVE, this.onBtnJumpTouchMove, this);
        this.btnJump.on(Node.EventType.TOUCH_END, this.onBtnJumpTouchEnd, this);
        this.btnJump.on(Node.EventType.TOUCH_CANCEL, this.onBtnJumpTouchEnd, this);


        
        // this.btnJumpBack.on(Node.EventType.TOUCH_START, this.onBtnJumpBackTouchMove, this);
        // this.btnJumpBack.on(Node.EventType.TOUCH_MOVE, this.onBtnJumpBackTouchMove, this);
        // this.btnJumpBack.on(Node.EventType.TOUCH_END, this.onBtnJumpBackTouchEnd, this);
        // this.btnJumpBack.on(Node.EventType.TOUCH_CANCEL, this.onBtnJumpBackTouchEnd, this);

        this.btnBackToMain.on(Node.EventType.TOUCH_END, this.OnBtnBackToMainClick, this);


        // this._btnLeft = this.node.getChildByName('左');
        // this._btnRight = this.node.getChildByName('右');
        // this._btnUp = this.node.getChildByName('上');
        // this._btnDown = this.node.getChildByName('下');

        // this._btnLeft.on(Node.EventType.TOUCH_START, this.onBtnLeftTouchMove, this);
        // this._btnLeft.on(Node.EventType.TOUCH_MOVE, this.onBtnLeftTouchMove, this);
        // this._btnLeft.on(Node.EventType.TOUCH_END, this.onBtnLeftTouchEnd, this);
        // this._btnLeft.on(Node.EventType.TOUCH_CANCEL, this.onBtnLeftTouchEnd, this);

        // this._btnRight.on(Node.EventType.TOUCH_START, this.onBtnRightTouchMove, this);
        // this._btnRight.on(Node.EventType.TOUCH_MOVE, this.onBtnRightTouchMove, this);
        // this._btnRight.on(Node.EventType.TOUCH_END, this.onBtnRightTouchEnd, this);
        // this._btnRight.on(Node.EventType.TOUCH_CANCEL, this.onBtnRightTouchEnd, this);

        
        // this._btnUp.on(Node.EventType.TOUCH_START, this.onBtnUpTouchMove, this);
        // this._btnUp.on(Node.EventType.TOUCH_MOVE, this.onBtnUpTouchMove, this);
        // this._btnUp.on(Node.EventType.TOUCH_END, this.onBtnUpTouchEnd, this);
        // this._btnUp.on(Node.EventType.TOUCH_CANCEL, this.onBtnUpTouchEnd, this);

            
        // this._btnDown.on(Node.EventType.TOUCH_START, this.onBtnDownTouchMove, this);
        // this._btnDown.on(Node.EventType.TOUCH_MOVE, this.onBtnDownTouchMove, this);
        // this._btnDown.on(Node.EventType.TOUCH_END, this.onBtnDownTouchEnd, this);
        // this._btnDown.on(Node.EventType.TOUCH_CANCEL, this.onBtnDownTouchEnd, this);


        this._btnReStart = this.node.getChildByName('btnReStart');
        this._btnReStart.on(Input.EventType.TOUCH_END, this.OnClick_ReStart, this);

        this.btnVideo.on(Input.EventType.TOUCH_END, this.onBtnVideoClick, this);

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        this._joystickBase = this.node.getChildByName('JoystickBase').getComponent(UITransform);
        this._joystickDot = this._joystickBase.node.getChildByName('JoystickDot');


        EventManager.on(GML_Events.UI_SHOW_BTN_ReStart, this.OnShowBtnReStart, this);
        EventManager.on(GML_Events.UI_HIDE_BTN_CTRL, this.OnHideBtnCtrl, this);
        EventManager.on(GML_Events.UI_SHOW_BTN_CTRL, this.OnShowBtnCtrl, this);
        EventManager.on(GML_Events.UI_Update_Progress, this.OnUpdateProgress, this);
        EventManager.on(GML_Events.UI_UPDATE_RESTART_COUNT, this.OnUpdateRestartCount, this);
        EventManager.on(GML_Events.UI_Reset_Progress, this.resetProgress, this);

        this.btnJump.active = true;
        // this.btnJumpBack.active = true;
        this._btnReStart.active = false;
        this.btnVideo.active = false;
        this.OnUpdateRestartCount();

    }

    onDestroy() { 
        EventManager.off(GML_Events.UI_SHOW_BTN_ReStart, this.OnShowBtnReStart, this);
        EventManager.off(GML_Events.UI_HIDE_BTN_CTRL, this.OnHideBtnCtrl, this);
        EventManager.off(GML_Events.UI_SHOW_BTN_CTRL, this.OnShowBtnCtrl, this);
        EventManager.off(GML_Events.UI_Update_Progress, this.OnUpdateProgress, this);
        EventManager.off(GML_Events.UI_UPDATE_RESTART_COUNT, this.OnUpdateRestartCount, this);
        EventManager.off(GML_Events.UI_Reset_Progress, this.resetProgress, this);
    }


    OnBtnBackToMainClick(){
        GML_GameManager.Instance.backToMain();
    }

    OnUpdateRestartCount(){
        this.lblResurgenceCount.string = "剩余次数："+GML_GameManager.Instance.resurgenceCount.toString();
    }

    OnUpdateProgress(progress:number){
        if (!this.spProgress) return;
        
        let length = this.spProgress.parent.getComponent(UITransform).width;
        let posX = length * progress;
        this.spProgress.setPosition(v3(posX, this.spProgress.y, this.spProgress.z));
    }


    resetProgress(){
        GML_GameManager.Instance.progress = 0;
        this.isProgressIncreasing = true;
        this.jumpTouching  = false;
        this.OnUpdateProgress(GML_GameManager.Instance.progress);
    }
    

    update(dt: number) {
        if(this.jumpTouching && !GML_GameManager.Instance.isPlayerDie){
            if (!this.spProgress) return;
            
            // 更新进度值，实现0-1-0的循环
            if (this.isProgressIncreasing) {
                GML_GameManager.Instance.progress += dt * this.progressSpeed;
                if (GML_GameManager.Instance.progress >= 1) {
                    GML_GameManager.Instance.progress = 1;
                    this.isProgressIncreasing = false;
                }
            } else {
                GML_GameManager.Instance.progress -= dt * this.progressSpeed;
                if (GML_GameManager.Instance.progress <= 0) {
                    GML_GameManager.Instance.progress = 0;
                    this.isProgressIncreasing = true;
                }
            }

            // 调用OnUpdateProgress更新进度条位置
            this.OnUpdateProgress(GML_GameManager.Instance.progress);
        }
    }
    
    OnShowBtnReStart(){
        this._btnReStart.active = true;

        if(!GML_GameManager.Instance.isWatchedVideo){
            this.btnVideo.active = true;
        }
    }

    onBtnVideoClick(){
        Banner.Instance.ShowVideoAd(()=>{
            GML_GameManager.Instance.isWatchedVideo = true;
            GML_GameManager.Instance.resurgenceCount += 2;
            EventManager.Scene.emit(GML_Events.UI_UPDATE_RESTART_COUNT);
            this.btnVideo.active = false;
            this.OnShowBtnReStart();
        })
    }

    OnHideBtnCtrl(){
        this.btnJump.active = false;
        // this.btnJumpBack.active = false;
    }

    OnShowBtnCtrl(){
        this.btnJump.active = true;
        // this.btnJumpBack.active = true;
    }

    OnClick_ReStart(){
        GML_GameManager.Instance.restart();
        this._btnReStart.active = false;
        this.btnVideo.active = false;
        this.btnJump.active = true;
        // this.btnJumpBack.active = true;
    }

    onBtnJumpTouchStart(){
        this.jumpTouching = true;
        EventManager.Scene.emit(GML_Events.Keep_Jump);
    }

    //若静止或者正在后退中，直接播放跳跃动画
    onBtnJumpTouchMove(){
        EventManager.Scene.emit(GML_Events.Keep_Jump);
    }

    //若正在跳跃中，播放掉落动画，动画播放完毕就静止，若正在后退中，不修改状态
    onBtnJumpTouchEnd(){
        this.jumpTouching = false;
        EventManager.Scene.emit(GML_Events.Stop_Jump);
    }

    //若正在跳跃，播放掉落动画，结束后后退，若非跳跃中，直接后退
    onBtnJumpBackTouchMove(){
        EventManager.Scene.emit(GML_Events.Keep_Jump_BACK);
    }

    //若正在跳跃中，不做变化，若正在后退中，则直接静止
    onBtnJumpBackTouchEnd(){
        EventManager.Scene.emit(GML_Events.Stop_Jump_BACK);
    }




    OnTouchStart_JoystickArea(event: EventTouch) {
        let touches = event.getTouches();
        for (let i = 0; i < touches.length; ++i) {
            let touch = touches[i];
            let x = touch.getUILocationX();
            let y = touch.getUILocationY();
            if (!this._movementTouch) {
                // we sub halfWidth,halfHeight here.
                // because, the touch event use left bottom as zero point(0,0), ui node use the center of screen as zero point(0,0)
                // this._ctrlRoot.setPosition(x - halfWidth, y - halfHeight, 0);

                let halfWidth = this._cameraArea.width / 2;
                let halfHeight = this._cameraArea.height / 2;

                this._joystickBase.node.active = true;
                this._joystickBase.node.setPosition(x - halfWidth, y - halfHeight, 0);
                this._joystickDot.setPosition(0, 0, 0);
                this._movementTouch = touch;
            }
        }
    }

    OnTouchMove_JoystickArea(event: EventTouch) {
        let touches = event.getTouches();
        for (let i = 0; i < touches.length; ++i) {
            let touch = touches[i];
            if (this._movementTouch && touch.getID() == this._movementTouch.getID()) {
                let halfWidth = this._cameraArea.width / 2;
                let halfHeight = this._cameraArea.height / 2;
                let x = touch.getUILocationX();
                let y = touch.getUILocationY();

                let pos = this._joystickBase.node.position;
                let ox = x - halfWidth - pos.x;
                let oy = y - halfHeight - pos.y;

                let len = Math.sqrt(ox * ox + oy * oy);
                if (len <= 0) {
                    return;
                }

                let dirX = ox / len;
                let dirY = oy / len;
                let radius = this._joystickBase.width / 2;
                if (len > radius) {
                    len = radius;
                    ox = dirX * radius;
                    oy = dirY * radius;
                }

                this._joystickDot.setPosition(ox, oy, 0);

                if(!GML_GameManager.Instance.isPlayerDie){
                    director.getScene().emit(GML_Events.MOVEMENT, dirX, dirY, len / radius);//移动
                }
            }
        }
    }

    OnTouchEnd_JoystickArea(event: EventTouch) {
        let touches = event.getTouches();
        for (let i = 0; i < touches.length; ++i) {
            let touch = touches[i];
            if (this._movementTouch && touch.getID() == this._movementTouch.getID()) {
                if(!GML_GameManager.Instance.isPlayerDie){
                    director.getScene().emit(GML_Events.MOVEMENT_STOP)//移动停止
                }

                this._movementTouch = null;
                this._joystickDot.setPosition(Vec3.ZERO);
            }
        }
    }
    private CameraTouchID: number = -1;

    OnTouchStart_CameraArea(touch: Touch) {
        lastLocation.set(touch.getLocation());
        this.CameraTouchID = touch.getID();
    }

    OnTouchMove_CameraArea(touch: Touch) {
        if (touch.getID() != this.CameraTouchID) return;
        Vec2.subtract(dis, touch.getLocation(), lastLocation);
        let rx = dis.y * 0.025;
        let ry = -dis.x * 0.025;

        // if(!GML_GameManager.Instance.isPlayerDie){
            director.getScene().emit(GML_Events.CAMERA_ROTATE, rx, ry);//相机旋转
        // }

        lastLocation.set(touch.getLocation());
        
    }

    OnTouchEnd_CameraArea(event: Touch) { }

    private _keys = [];
    private _degree: number = 0;
    dir: Vec2 = new Vec2(0, 0);

    onBtnUpTouchMove(){
        this.onBtnDirectionTouchStart(KeyCode.KEY_W)
    }

    onBtnLeftTouchMove(){
        this.onBtnDirectionTouchStart(KeyCode.KEY_A)
        
    }
    onBtnRightTouchMove(){
        this.onBtnDirectionTouchStart(KeyCode.KEY_D)
        
    }
    onBtnDownTouchMove(){
        this.onBtnDirectionTouchStart(KeyCode.KEY_S)
        
    }

    onBtnUpTouchEnd(){
        this.onBtnDirectionTouchStop(KeyCode.KEY_W)
    }

    onBtnLeftTouchEnd(){
        this.onBtnDirectionTouchStop(KeyCode.KEY_A)
        
    }
    onBtnRightTouchEnd(){
        this.onBtnDirectionTouchStop(KeyCode.KEY_D)
        
    }
    onBtnDownTouchEnd(){
        this.onBtnDirectionTouchStop(KeyCode.KEY_S)
        
    }

    onBtnDirectionTouchStart(keyCode:KeyCode){
        if (this._keys.indexOf(keyCode) == -1) {
            this._keys.push(keyCode);
            switch (keyCode) {
                case KeyCode.KEY_A:
                    {
                        this.dir.x = -1;
                        console.log("按下  左")
                    }
                    break;
                case KeyCode.KEY_D:
                    {
                        this.dir.x = 1;
                        console.log("按下  右")
                    }
                    break;
                case KeyCode.KEY_W:
                    {
                        this.dir.y = 1;
                        console.log("按下  上")

                    }
                    break;
                case KeyCode.KEY_S:
                    {
                        this.dir.y = -1;
                        console.log("按下  下")

                    }
                    break;
            }
        }
        this.updateDirection();
    }


    onBtnDirectionTouchStop(keyCode:KeyCode){
        let index = this._keys.indexOf(keyCode);
        if (index != -1) {
            this._keys.splice(index, 1);
            switch (keyCode) {
                case KeyCode.KEY_A:
                case KeyCode.KEY_D:
                    {
                        this.dir.x = 0;
                    }
                    break;
                case KeyCode.KEY_W:
                case KeyCode.KEY_S:
                    {
                        this.dir.y = 0;
                    }
                    break;
            }
            this.updateDirection();
        }
    }

    onKeyDown(event: EventKeyboard) {
        let keyCode = event.keyCode;
        if (keyCode == KeyCode.KEY_A || keyCode == KeyCode.KEY_S || keyCode == KeyCode.KEY_D || keyCode == KeyCode.KEY_W) {
            if (this._keys.indexOf(keyCode) == -1) {
                this._keys.push(keyCode);
                switch (keyCode) {
                    case KeyCode.KEY_A:
                        {
                            this.dir.x = -1;
                        }
                        break;
                    case KeyCode.KEY_D:
                        {
                            this.dir.x = 1;
                        }
                        break;
                    case KeyCode.KEY_W:
                        {
                            this.dir.y = 1;
                        }
                        break;
                    case KeyCode.KEY_S:
                        {
                            this.dir.y = -1;
                        }
                        break;
                }
                this.updateDirection();
            }
        }

        // if (keyCode == KeyCode.SPACE) {
        //     director.getScene().emit(GML_MyEvent.JUMP);//
        // }
    }

    onKeyUp(event: EventKeyboard) {
        let keyCode = event.keyCode;
        if (keyCode == KeyCode.KEY_A || keyCode == KeyCode.KEY_S || keyCode == KeyCode.KEY_D || keyCode == KeyCode.KEY_W) {
            let index = this._keys.indexOf(keyCode);
            if (index != -1) {
                this._keys.splice(index, 1);
                switch (keyCode) {
                    case KeyCode.KEY_A:
                    case KeyCode.KEY_D:
                        {
                            this.dir.x = 0;
                        }
                        break;
                    case KeyCode.KEY_W:
                    case KeyCode.KEY_S:
                        {
                            this.dir.y = 0;
                        }
                        break;
                }
                this.updateDirection();
            }
        }
    }

    private key2dirMap = null;

    updateDirection() {
        if (this.key2dirMap == null) {
            this.key2dirMap = {};
            this.key2dirMap[0] = -1;
            this.key2dirMap[KeyCode.KEY_A] = new Vec2(-1, 0);//180
            this.key2dirMap[KeyCode.KEY_D] = new Vec2(1, 0);//0
            this.key2dirMap[KeyCode.KEY_W] = new Vec2(0, 1);//90
            this.key2dirMap[KeyCode.KEY_S] = new Vec2(0, -1);//270

            this.key2dirMap[KeyCode.KEY_A * 1000 + KeyCode.KEY_W] = this.key2dirMap[KeyCode.KEY_W * 1000 + KeyCode.KEY_A] = new Vec2(-1, 1);//135
            this.key2dirMap[KeyCode.KEY_D * 1000 + KeyCode.KEY_W] = this.key2dirMap[KeyCode.KEY_W * 1000 + KeyCode.KEY_D] = new Vec2(1, 1);//45
            this.key2dirMap[KeyCode.KEY_A * 1000 + KeyCode.KEY_S] = this.key2dirMap[KeyCode.KEY_S * 1000 + KeyCode.KEY_A] = new Vec2(-1, -1);//225
            this.key2dirMap[KeyCode.KEY_D * 1000 + KeyCode.KEY_S] = this.key2dirMap[KeyCode.KEY_S * 1000 + KeyCode.KEY_D] = new Vec2(1, -1);//315

            this.key2dirMap[KeyCode.KEY_A * 1000 + KeyCode.KEY_D] = this.key2dirMap[KeyCode.KEY_D];
            this.key2dirMap[KeyCode.KEY_D * 1000 + KeyCode.KEY_A] = this.key2dirMap[KeyCode.KEY_A];
            this.key2dirMap[KeyCode.KEY_W * 1000 + KeyCode.KEY_S] = this.key2dirMap[KeyCode.KEY_S];
            this.key2dirMap[KeyCode.KEY_S * 1000 + KeyCode.KEY_W] = this.key2dirMap[KeyCode.KEY_W];
        }
        let keyCode0 = this._keys[this._keys.length - 1] || 0;
        let keyCode1 = this._keys[this._keys.length - 2] || 0;
        this._degree = this.key2dirMap[keyCode1 * 1000 + keyCode0];
        if (this._degree == null || this._degree < 0) {
            director.getScene().emit(GML_Events.MOVEMENT_STOP);//移动停止
            // director.getScene().emit(GML_Events.STOP_APPLY_FORCE);
        }
        else {
            director.getScene().emit(GML_Events.MOVEMENT, this.dir.x, this.dir.y, 1.0);//移动
            // director.getScene().emit(GML_Events.APPLY_FORCE, this.dir.x, this.dir.y, 1.0);//施加力
        }
    }

}