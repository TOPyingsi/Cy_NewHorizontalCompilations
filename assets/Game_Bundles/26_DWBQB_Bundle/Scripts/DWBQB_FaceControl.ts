import { _decorator, Component, director, Node, Sprite, SpriteFrame, tween, Vec3 } from 'cc';
import { DWBQB_CheekControl } from './DWBQB_CheekControl';
import { DWBQB_MouthControl } from './DWBQB_MouthControl';
const { ccclass, property } = _decorator;

@ccclass('DWBQB_FaceControl')
export class DWBQB_FaceControl extends Component {
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

    @property([SpriteFrame])
    private otherLeftEye: SpriteFrame[] = [];
    @property([SpriteFrame])
    private otherRightEye: SpriteFrame[] = [];
    @property([SpriteFrame])
    private otherMouth: SpriteFrame[] = [];
    @property([SpriteFrame])
    private otherNoise: SpriteFrame[] = [];
    @property([SpriteFrame])
    private leftEar: SpriteFrame[] = [];
    @property([SpriteFrame])
    private rightEar: SpriteFrame[] = [];


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
            this.node.getChildByName("嘴巴").getComponent(Sprite).spriteFrame = this.mouth[index];
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
            this.node.getChildByName("左眼").getComponent(Sprite).spriteFrame = this.leftEye[index];
            this.node.getChildByName("右眼").getComponent(Sprite).spriteFrame = this.rightEye[index];
            this.node.getChildByName("嘴巴").getComponent(Sprite).spriteFrame = this.mouth[index];
        }else if(id==0||id==1){
            let index = Math.floor(Math.random()*2) + 1;
        if(this.node.getChildByName("左眼").getComponent(Sprite).spriteFrame == this.leftEye[0])
        {
            this.node.getChildByName("左眼").getComponent(Sprite).spriteFrame = this.leftEye[index];
            this.node.getChildByName("右眼").getComponent(Sprite).spriteFrame = this.rightEye[index];
            this.node.getChildByName("嘴巴").getComponent(Sprite).spriteFrame = this.mouth[index];
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
                leftEye.getComponent(Sprite).spriteFrame = this.leftEye[3];
                rightEye.getComponent(Sprite).spriteFrame = this.rightEye[3];
                mouth.getComponent(Sprite).spriteFrame = this.mouth[3];
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
            case 9:
                this._isShaking = false;
                this.unschedule(this.shakeEffect);
            break; 
            }
        this.scheduleOnce(()=>{
            this._isUseProp = false;
        },1.5)
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

firstEyeChange(){
    for(let i=0;i<this.rightEye.length;i++){
        this.rightEye[i]=this.otherRightEye[i];
        this.leftEye[i]=this.otherLeftEye[i];
     }
}

TigerEyeChange(){
     for(let i=0;i<this.rightEye.length;i++){
        this.rightEye[i]=this.otherRightEye[i+5];
        this.leftEye[i]=this.otherLeftEye[i+5];
     }
}
monkeyEyeChange(){
    for(let i=0;i<this.rightEye.length;i++){
        this.rightEye[i]=this.otherRightEye[i+10];
        this.leftEye[i]=this.otherLeftEye[i+10];
     }
}
baerEyeChange(){
    for(let i=0;i<this.rightEye.length;i++){
        this.rightEye[i]=this.otherRightEye[i+15];
        this.leftEye[i]=this.otherLeftEye[i+15];
     }
    }
cowEyeChange(){
    for(let i=0;i<this.rightEye.length;i++){
        this.rightEye[i]=this.otherRightEye[i+20];
        this.leftEye[i]=this.otherLeftEye[i+20];
     }
}
firstMouthChange(){
    for(let i=0;i<this.rightEye.length;i++){
        this.mouth[i]=this.otherMouth[i+5];
        this.mouth[i]=this.otherMouth[i+5];
     } 
     this.node.getChildByName("嘴巴").getComponent(DWBQB_MouthControl).firstMouthChange();
}
mouthChange(){
    for(let i=0;i<this.rightEye.length;i++){
        this.mouth[i]=this.otherMouth[i];
        this.mouth[i]=this.otherMouth[i];
     }
     this.node.getChildByName("嘴巴").getComponent(DWBQB_MouthControl).MouthChange();
}
firstNoiseChange(){
    this.node.getChildByName("鼻子").getComponent(Sprite).spriteFrame = null;
}
oneNoiseChange(){
    this.node.getChildByName("鼻子").getComponent(Sprite).spriteFrame = this.otherNoise[0];
}
twoNoiseChange(){
    this.node.getChildByName("鼻子").getComponent(Sprite).spriteFrame = this.otherNoise[1];
}
threeNoiseChange(){
    this.node.getChildByName("鼻子").getComponent(Sprite).spriteFrame = this.otherNoise[2];
}
firstEarChange(){
    this.node.getChildByName("左耳").getComponent(Sprite).spriteFrame = null;
    this.node.getChildByName("右耳").getComponent(Sprite).spriteFrame = null;
}
oneEarChange(){
    this.node.getChildByName("左耳").getComponent(Sprite).spriteFrame = this.leftEar[0];
    this.node.getChildByName("右耳").getComponent(Sprite).spriteFrame = this.rightEar[0];
}
twoEarChange(){
    this.node.getChildByName("左耳").getComponent(Sprite).spriteFrame = this.leftEar[1];
    this.node.getChildByName("右耳").getComponent(Sprite).spriteFrame = this.rightEar[1];
}
threeEarChange(){
    this.node.getChildByName("左耳").getComponent(Sprite).spriteFrame = this.leftEar[2];
    this.node.getChildByName("右耳").getComponent(Sprite).spriteFrame = this.rightEar[2]; 
}
fourEarChange(){
    this.node.getChildByName("左耳").getComponent(Sprite).spriteFrame = this.leftEar[3];
    this.node.getChildByName("右耳").getComponent(Sprite).spriteFrame = this.rightEar[3];
}

firstCheekChange(){
   this.node.getChildByName("左脸颊").getComponent(DWBQB_CheekControl).firstCheekChange();
   this.node.getChildByName("右脸颊").getComponent(DWBQB_CheekControl).firstCheekChange();
}
oneCheekChange(){
    this.node.getChildByName("左脸颊").getComponent(DWBQB_CheekControl).oneCheekChange();
    this.node.getChildByName("右脸颊").getComponent(DWBQB_CheekControl).oneCheekChange();
 }
 twoCheekChange(){
    this.node.getChildByName("左脸颊").getComponent(DWBQB_CheekControl).twoCheekChange();
    this.node.getChildByName("右脸颊").getComponent(DWBQB_CheekControl).twoCheekChange(); 
 }
 threeCheekChange(){
    this.node.getChildByName("左脸颊").getComponent(DWBQB_CheekControl).threeCheekChange();
    this.node.getChildByName("右脸颊").getComponent(DWBQB_CheekControl).threeCheekChange(); 
 }
}


