import { _decorator, Color, Component, director, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('eraseButtonController')
export class eraseButtonController extends Component {

    sp : Sprite = null;
    type : Color[] = [new Color(255,255,255,255), new Color(100, 100, 100, 255)];
    current : number = 0;
    protected onLoad(): void {
        this.sp = this.getComponentInChildren(Sprite);
    }

    protected onEnable(): void {
        director.getScene().on("eraseButtonType", this.beType, this);
    }
    
    changeType(){
        this.current = (this.current ? 0 : 1);
        this.sp.color = this.type[this.current];
    }
    
    beType(newType : number){
        this.current = newType;
        this.sp.color = this.type[this.current];
    }

    protected onDisable(): void {
        director.getScene().off("eraseButtonType", this.beType, this);
    }

}


