import { _decorator, Component, Node ,Animation} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WBSRL_GunController')
export class WBSRL_GunController extends Component {
   
    @property(Animation)
    Animation:Animation = null;

    cb:Function = null;
    aniName:string = "";

    protected onLoad(): void {
        this.Animation.on(Animation.EventType.FINISHED,()=>{
            this.cb&&this.cb();
        },this);
    }

    DrawGun(cb?:Function){
        this.node.active = true;
        this.PlayAni("GunDraw",()=>{
            cb&&cb();
            this.PlayAni("GunIdle");
        })
    }

    ShotGun(cb?:Function){
        this.PlayAni("GunShot",()=>{
            cb&&cb();
            this.node.active = false;
        })
    }

    ClosedGun(cb?:Function){
        this.PlayAni("GunClosed",()=>{
            cb&&cb();
            this.node.active = false;
        })
    }



    PlayAni(ani:string,cb:Function = null){
        if(this.aniName === ani)return;
        this.aniName = ani;
        this.Animation.play(ani);
        this.cb = cb;
    }
}


