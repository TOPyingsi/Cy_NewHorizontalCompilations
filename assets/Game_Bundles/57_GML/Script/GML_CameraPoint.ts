import { _decorator, Component, Node } from 'cc';
import { GML_GameManager } from './GML_GameManager';
const { ccclass, property } = _decorator;

@ccclass('GML_CameraPoint')
export class GML_CameraPoint extends Component {
    @property(Node)
    FindNode: Node = null;
    protected update(dt: number): void {
        if(!GML_GameManager.Instance.isPlayerDie){
            this.node.worldPosition = this.FindNode.worldPosition.clone();
        }
    }


}


