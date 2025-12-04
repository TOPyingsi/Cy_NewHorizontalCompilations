import { _decorator, Component, instantiate, Node, PhysicsSystem2D, Prefab, v3 } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { XSHY_incident } from './XSHY_incident';
import { XSHY_PlayerControl } from './XSHY_PlayerControl';
const { ccclass, property } = _decorator;

@ccclass('XSHY_GameManager')
export class XSHY_GameManager extends Component {
    @property(Node)
    BG: Node = null;
    public PlayerNode: Node = null;
    start() {
        this.Init();
        PhysicsSystem2D.instance.debugDrawFlags = 1;
    }





    Init() {
        //初始化角色
        XSHY_incident.Loadprefab("PreFab/角色/四代目").then((prefab: Prefab) => {
            let node = instantiate(prefab);
            node.setParent(this.BG);
            node.position = v3(-400, -400, 0);
            node.addComponent(XSHY_PlayerControl);
            this.PlayerNode = node;
        })

    }

}


