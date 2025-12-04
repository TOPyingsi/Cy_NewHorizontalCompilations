import { _decorator, Component, Node, physics, PhysicsSystem, Vec3 } from 'cc';
import { TKJWL_DataManager } from './TKJWL_DataManager';
import { TKJWL_UIManager } from './TKJWL_UIManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { TKJWL_GameEvents } from '../Common/TKJWL_GameEvents';
import { TKJWL_AudioManager } from './TKJWL_AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('TKJWL_GameManager')
export class TKJWL_GameManager extends Component {
    // @property(Node)
    // UIManager: TKJWL_UIManager = null;

    onLoad(){
        // if(this.UIManager){
        //     this.UIManager.init();
        // }
    }

    start() {
        //修改物理引擎的重力大小为·5
        PhysicsSystem.instance.gravity = new Vec3(0, -60, 0);
        TKJWL_DataManager.Instance.initData();
        TKJWL_DataManager.Instance.isGameStart = true;
        EventManager.Scene.emit(TKJWL_GameEvents.UI_HIDE_ALL_SCREENS);
        EventManager.Scene.emit(TKJWL_GameEvents.UI_SHOW_GAMEUI);
        TKJWL_AudioManager.getInstance().playMusic("雨");
        ProjectEventManager.emit(ProjectEvent.游戏开始, "他看见我了")
    }

}


