import { _decorator, Animation, Component, Node, v3 } from 'cc';
import { XGDY_DataManager } from '../Manager/XGDY_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
const { ccclass, property } = _decorator;

@ccclass('XGDY_AnimationPanel2')
export class XGDY_AnimationPanel2 extends Component {

    @property(Node) 
    btnPool: Node = null!; // 角色项模板
    
    @property(Node) 
    btnSignIn: Node = null!; // 角色项模板
        

    @property(Node)
    carContainer: Node = null;
    
    isAddListener:boolean = false;

    init(){
        if(!this.isAddListener){
           this.addListener();
        }
        this.carContainer.children.forEach((car)=>{
          car.active = XGDY_DataManager.Instance.saveData.carType == car.name;
        })
    }

    onBtnPoolClick(){
        EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_POOL_PANEL);
    }

    onBtnSignInClick(){
        EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_SIGN_PANEL);
    }

    addListener(){
        this.btnPool.on("click",this.onBtnPoolClick,this);
        this.btnSignIn.on("click",this.onBtnSignInClick,this);
        EventManager.on(XGDY_GameEvents.UI_Update_CarType,this.init,this);
    }
    
    removeListener(){
        EventManager.off(XGDY_GameEvents.UI_Update_CarType,this.init,this);
    }
    

    protected onDestroy(): void {
        this.removeListener();
    }
}


