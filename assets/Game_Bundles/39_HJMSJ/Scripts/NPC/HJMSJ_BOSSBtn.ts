import { _decorator, Component, director, instantiate, Node, NodeEventType, Prefab } from 'cc';
import { HJMSJ_Incident } from '../HJMSJ_Incident';
import { HJMSJ_GameMgr } from '../HJMSJ_GameMgr';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_BOSSBtn')
export class HJMSJ_BOSSBtn extends Component {

    @property()
    bossID: number = 0;

    start() {
        this.node.on(NodeEventType.TOUCH_END, this.onClick, this);
    }

    onClick() {
        console.log("准备更换地图" + this.bossID);
        HJMSJ_Incident.Loadprefab("Prefabs/地图/BossMap" + this.bossID).then((prefab: Prefab) => {
            let bossMapNode = instantiate(prefab);

            HJMSJ_GameMgr.instance.changeMap(bossMapNode);

            director.getScene().emit("哈基米世界_更换Boss地图");
        })
    }

}


