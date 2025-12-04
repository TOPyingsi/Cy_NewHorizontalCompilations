import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DWBQB_UISelect')
export class DWBQB_UISelect extends Component {
    private openEyeUI:boolean=false;
    private openMouthUI:boolean=false;
    private openNoiseUI:boolean=false;
    private openEarUI:boolean=false;
    private openCheekUI:boolean=false;
    start() {

    }

    update(deltaTime: number) {
        
    }
    eyeSelect(){
        if(this.openEyeUI){
            this.node.getChildByName("眼睛").getChildByName("组件底").active=false;
            this.openEyeUI=false;
        }else{
        this.node.getChildByName("眼睛").getChildByName("组件底").active=true;
        this.node.getChildByName("耳朵").getChildByName("组件底").active=false;
        this.node.getChildByName("脸颊").getChildByName("组件底").active=false;
        this.node.getChildByName("鼻子").getChildByName("组件底").active=false;
        this.node.getChildByName("嘴巴").getChildByName("组件底").active=false;
        this.openEyeUI=true;
    }
        
    }
    mouthSelect(){
        if(this.openMouthUI){
            this.node.getChildByName("嘴巴").getChildByName("组件底").active=false;
            this.openMouthUI=false; 
        }else{
        this.node.getChildByName("嘴巴").getChildByName("组件底").active=true;
        this.node.getChildByName("耳朵").getChildByName("组件底").active=false;
        this.node.getChildByName("脸颊").getChildByName("组件底").active=false;
        this.node.getChildByName("鼻子").getChildByName("组件底").active=false;
        this.node.getChildByName("眼睛").getChildByName("组件底").active=false;
        this.openMouthUI=true;
    }
    }
    noiseSelect(){
        if(this.openNoiseUI){
            this.node.getChildByName("鼻子").getChildByName("组件底").active=false;
            this.openNoiseUI=false; 
        }else{
        this.node.getChildByName("鼻子").getChildByName("组件底").active=true;
        this.node.getChildByName("耳朵").getChildByName("组件底").active=false;
        this.node.getChildByName("脸颊").getChildByName("组件底").active=false;
        this.node.getChildByName("眼睛").getChildByName("组件底").active=false;
        this.node.getChildByName("嘴巴").getChildByName("组件底").active=false;
        this.openNoiseUI=true;
    }
    }
    earSelect(){
        if(this.openEarUI){
            this.node.getChildByName("耳朵").getChildByName("组件底").active=false;
            this.openEarUI=false; 
        }else{
        this.node.getChildByName("耳朵").getChildByName("组件底").active=true;
        this.node.getChildByName("眼睛").getChildByName("组件底").active=false;
        this.node.getChildByName("脸颊").getChildByName("组件底").active=false;
        this.node.getChildByName("鼻子").getChildByName("组件底").active=false;
        this.node.getChildByName("嘴巴").getChildByName("组件底").active=false;
        this.openEarUI=true;
    }
    }
    cheekSelect(){
        if(this.openCheekUI){
            this.node.getChildByName("脸颊").getChildByName("组件底").active=false;
            this.openCheekUI=false; 
        }else{
        this.node.getChildByName("脸颊").getChildByName("组件底").active=true;
        this.node.getChildByName("耳朵").getChildByName("组件底").active=false;
        this.node.getChildByName("眼睛").getChildByName("组件底").active=false;
        this.node.getChildByName("鼻子").getChildByName("组件底").active=false;
        this.node.getChildByName("嘴巴").getChildByName("组件底").active=false;
        this.openCheekUI=true;
    }
    }
    AllClose(){
        this.node.getChildByName("脸颊").getChildByName("组件底").active=false;
        this.node.getChildByName("耳朵").getChildByName("组件底").active=false;
        this.node.getChildByName("眼睛").getChildByName("组件底").active=false;
        this.node.getChildByName("鼻子").getChildByName("组件底").active=false;
        this.node.getChildByName("嘴巴").getChildByName("组件底").active=false;
        this.openCheekUI=true;
        this.openEarUI=true;
        this.openEyeUI=true;
        this.openMouthUI=true;
        this.openNoiseUI=true;
    }
}


