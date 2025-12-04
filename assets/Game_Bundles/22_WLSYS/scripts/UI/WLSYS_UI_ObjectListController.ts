import { _decorator, Component, Node, tween, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UI_ObjectListController')
export class UI_ObjectListController extends Component {
    
    @property(Vec3)
    GamePos : Vec3 = new Vec3();
    @property(Vec3)
    LeavePos : Vec3 = new Vec3();

    InGame : boolean = false;

    protected onLoad(): void {
        this.node.setPosition(this.LeavePos);
    }

    UI_ChangeType(){
        if (this.InGame){
            this.UI_LeaveFormGame();
        }else{
            this.UI_comeToGame();
        }
    }

    UI_comeToGame(){
        tween(this.node).to(0.3, {position : this.GamePos}, {easing : "smooth"}).call(() => {
            this.InGame = true;
        }).start();
    }
    UI_LeaveFormGame(){
        tween(this.node).to(0.3, {position : this.LeavePos}, {easing : "smooth"}).call(() => {
            this.InGame = false;
        }).start();
    }
}


