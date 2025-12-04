import { _decorator, Component, director, Node, Sprite, SpriteFrame, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DWBQB_AnimalFaceControl')
export class DWBQB_AnimalFaceControl extends Component {
    @property
    private AnimalId:number=0;
    @property([SpriteFrame])
    private leftEye: SpriteFrame[] = [];
    @property([SpriteFrame])
    private rightEye: SpriteFrame[] = [];
    @property([SpriteFrame])
    private mouth: SpriteFrame[] = [];
    private _isTouch:boolean = false;
    private _isUseProp:boolean = false;
    private _isShaking: boolean = false;
    private _shakeTimer: number = 0;
    private _originalPos: Vec3 = new Vec3(0,16.34,0);

    protected onLoad(): void {
        director.on("TouchStart",this.onTouchStart,this);
        director.on("TouchEnd",this.onTouchEnd,this);
        director.on("useProp",this.useProp,this);
    }

    start() {
        this.faceChange();
    }

    faceChange(){
        this.schedule(()=>{
            if(this._isTouch==true||this._isUseProp==true)return;
            let index = Math.floor(Math.random() * (this.leftEye.length - 1)) + 1;
            this.node.getChildByName("左眼").getComponent(Sprite).spriteFrame = this.leftEye[index];
            this.node.getChildByName("右眼").getComponent(Sprite).spriteFrame = this.rightEye[index];
            this.node.getChildByName("嘴巴").getComponent(Sprite).spriteFrame = this.mouth[1];
        this.scheduleOnce(()=>{
            if(this._isTouch==true||this._isUseProp==true)return;
            this.node.getChildByName("左眼").getComponent(Sprite).spriteFrame = this.leftEye[0];
            this.node.getChildByName("右眼").getComponent(Sprite).spriteFrame = this.rightEye[0];
            this.node.getChildByName("嘴巴").getComponent(Sprite).spriteFrame = this.mouth[0];
            },1);
        },3);
    }
                                                                                                                                                                                                                                                                                                                                          
    update(deltaTime: number) {
        
    }

    onTouchStart(id){
        if(id==0||id==2){
            let index = Math.floor(Math.random()*2) + 3;
            this.node.getChildByName("左眼").getComponent(Sprite).spriteFrame = this.leftEye[3];
            this.node.getChildByName("右眼").getComponent(Sprite).spriteFrame = this.rightEye[3];
            this.node.getChildByName("嘴巴").getComponent(Sprite).spriteFrame = this.mouth[0];
        }else if(id==0||id==1){
            let index = Math.floor(Math.random()*2) + 1;
        if(this.node.getChildByName("左眼").getComponent(Sprite).spriteFrame == this.leftEye[0])
        {
            this.node.getChildByName("左眼").getComponent(Sprite).spriteFrame = this.leftEye[index];
            this.node.getChildByName("右眼").getComponent(Sprite).spriteFrame = this.rightEye[index];
            this.node.getChildByName("嘴巴").getComponent(Sprite).spriteFrame = this.mouth[1];
        }
        }
        this._isTouch = true;
    }
    onTouchEnd(){
        this._isTouch = false; 
    }

    useProp(id){
        this._isUseProp = true;
        let leftEye=this.node.getChildByName("左眼");
        let rightEye=this.node.getChildByName("右眼");
        let mouth=this.node.getChildByName("嘴巴");
        switch(id){
            case 0:
                leftEye.getComponent(Sprite).spriteFrame = this.leftEye[4];
                rightEye.getComponent(Sprite).spriteFrame = this.rightEye[4];
                mouth.getComponent(Sprite).spriteFrame = this.mouth[4];
                break;
            case 1:
                leftEye.getComponent(Sprite).spriteFrame = this.leftEye[4];
                rightEye.getComponent(Sprite).spriteFrame = this.rightEye[4];
                mouth.getComponent(Sprite).spriteFrame = this.mouth[0];
                if (!this._isShaking) {
                    this._isShaking = true;
                    this.schedule(this.shakeEffect, 0.02);
                } 
                break;
            case 2:
                leftEye.getComponent(Sprite).spriteFrame = this.leftEye[1];
                rightEye.getComponent(Sprite).spriteFrame = this.rightEye[1];
                mouth.getComponent(Sprite).spriteFrame = this.mouth[1];
                break;
            case 3:
                leftEye.getComponent(Sprite).spriteFrame = this.leftEye[1];
                rightEye.getComponent(Sprite).spriteFrame = this.rightEye[1];
                this.node.getChildByName("嘴巴").active=false;
                this.node.getChildByName("吃东西嘴").active=true;
                const mouthNode = this.node.getChildByName("吃东西嘴").getChildByName('嘴角');
                this.scheduleOnce(()=>{
                    this.node.getChildByName("吃东西嘴").getChildByName("口腔").active=false; 
                },0.5);
                const originPos = mouthNode.position.clone();
                tween(mouthNode)
                    .repeatForever(
                        tween()
                        .by(0.5, 
                            { },
                            { 
                            onUpdate: (target:Node, ratio) => {
                                const angle = ratio * Math.PI * 2;
                                target.setPosition(
                                    originPos.x + Math.cos(angle) * 8,
                                    originPos.y + Math.sin(angle) * 4,
                                    originPos.z
                                );
                            }
                        })
                    )
                    .start()
                        this.scheduleOnce(()=>{
                            mouthNode.setPosition(originPos);
                            this.node.getChildByName("吃东西嘴").active=false;
                            this.node.getChildByName("嘴巴").active=true;
                            this.node.getChildByName("吃东西嘴").getChildByName("口腔").active=true;
                            this.node.getChildByName("柠檬特效").active=true;
                                tween(this.node.getChildByName("柠檬特效"))
                                .to(0.5,{position:new Vec3(780,100,0)})
                                .start();
                            this.scheduleOnce(()=>{
                                this.node.getChildByName("柠檬特效").active=false;
                                this.node.getChildByName("柠檬特效").setPosition(new Vec3(780,300,0));
                            },0.7); 
                        },2);
                    break;
                case 4:
                    if(this.AnimalId==2){
                        leftEye.getComponent(Sprite).spriteFrame = this.leftEye[2];
                        rightEye.getComponent(Sprite).spriteFrame = this.rightEye[2];
                        this.eat();
                    }else{
                        leftEye.getComponent(Sprite).spriteFrame = this.leftEye[4];
                        rightEye.getComponent(Sprite).spriteFrame = this.rightEye[4];
                        this.eat();
                    }
                    break;
                case 5:
                    if(this.AnimalId==0){
                        leftEye.getComponent(Sprite).spriteFrame = this.leftEye[2];
                        rightEye.getComponent(Sprite).spriteFrame = this.rightEye[2];
                        this.eat();
                    }else{
                        leftEye.getComponent(Sprite).spriteFrame = this.leftEye[4];
                        rightEye.getComponent(Sprite).spriteFrame = this.rightEye[4];
                        this.eat();
                    }
                    break;
                case 6:
                    if(this.AnimalId==1){
                        leftEye.getComponent(Sprite).spriteFrame = this.leftEye[2];
                        rightEye.getComponent(Sprite).spriteFrame = this.rightEye[2];
                        this.eat();
                    }else{
                        leftEye.getComponent(Sprite).spriteFrame = this.leftEye[4];
                        rightEye.getComponent(Sprite).spriteFrame = this.rightEye[4];
                        this.eat();
                    }
                    break;
            case 9:
                this._isShaking = false;
                this.unschedule(this.shakeEffect); 
            break; 
            }
        this.scheduleOnce(()=>{
            this._isUseProp = false;
        },5);
    }
    eat(){
        this.node.getChildByName("嘴巴").active = false;
                    this.node.getChildByName("吃东西嘴").active = true;
                    const mouthNode = this.node.getChildByName("吃东西嘴").getChildByName('嘴角');
                    this.scheduleOnce(() => {
                        this.node.getChildByName("吃东西嘴").getChildByName("口腔").active = false;
                    }, 0.5);
                    const originPos = mouthNode.position.clone();
                    tween(mouthNode)
                        .repeatForever(
                            tween()
                                .by(0.5,
                                    {},
                                    {
                                        onUpdate: (target: Node, ratio) => {
                                            const angle = ratio * Math.PI * 2;
                                            target.setPosition(
                                                originPos.x + Math.cos(angle) * 8,
                                                originPos.y + Math.sin(angle) * 4,
                                                originPos.z
                                            );
                                        }
                                    })
                        )
                        .start()
                    this.scheduleOnce(() => {
                        mouthNode.setPosition(originPos);
                        this.node.getChildByName("吃东西嘴").active = false;
                        this.node.getChildByName("嘴巴").active = true;
                        this.node.getChildByName("吃东西嘴").getChildByName("口腔").active = true;
                    }, 2)
    }
    private shakeEffect(): void {
        this._shakeTimer += 0.1;
        const offsetX = Math.sin(this._shakeTimer * 10) * 5;
        const offsetY = Math.cos(this._shakeTimer * 8) * 5;
        this.node.setPosition(
            this._originalPos.x + offsetX,
            this._originalPos.y + offsetY,
            this._originalPos.z
        );
    }

    protected onDestroy(): void {
        director.off("TouchStart",this.onTouchStart,this);
        director.off("TouchEnd",this.onTouchEnd,this);
        director.off("useProp",this.useProp,this);
    }
}


