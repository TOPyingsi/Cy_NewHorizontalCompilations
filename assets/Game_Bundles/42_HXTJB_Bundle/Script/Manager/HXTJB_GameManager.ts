import { _decorator, Component, Node, Prefab } from 'cc';
import { HXTJB_DataManager } from './HXTJB_DataManager';
import { HXTJB_UIManager } from './HXTJB_UIManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { HXTJB_GameEvents } from '../Common/HXTJB_GameEvents';
const { ccclass, property } = _decorator;

@ccclass('HXTJB_GameManager')
export class HXTJB_GameManager extends Component {
    @property(Node)
    coinLayerNode: Node = null;
    @property(Prefab)
    coinPrefab: Prefab = null;


    onLoad(){
         HXTJB_DataManager.Instance.initCoinsPosition(this.coinLayerNode);
        HXTJB_DataManager.Instance.init(this.coinLayerNode,this.coinPrefab);
           EventManager.on(HXTJB_GameEvents.PASS_GAME, this.passGame, this);
           EventManager.on(HXTJB_GameEvents.RESTART_GAME, this.resetGame, this);
        // if(this.UIManager){
        //     this.UIManager.init();
        // }
    }

    passGame(){
        EventManager.Scene.emit(HXTJB_GameEvents.UI_SHOW_END_PANEL);
    }

    resetGame(){
        HXTJB_DataManager.Instance.isFail = false;
        HXTJB_DataManager.Instance.init(this.coinLayerNode,this.coinPrefab);
        HXTJB_DataManager.Instance.setNewRound();
    }

    start() {
        HXTJB_DataManager.Instance.setNewRound();
        EventManager.Scene.emit(HXTJB_GameEvents.UI_SHOW_TUTORIAL_PANEL);
        // HXTJB_DataManager.Instance.isGameStart = true;
    }

    onDestroy(){
        EventManager.off(HXTJB_GameEvents.PASS_GAME, this.passGame, this);
        EventManager.off(HXTJB_GameEvents.RESTART_GAME, this.resetGame, this);
    }

}


