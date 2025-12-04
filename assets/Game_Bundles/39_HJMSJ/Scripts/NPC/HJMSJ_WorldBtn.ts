import { _decorator, Component, director, instantiate, Node, NodeEventType, Prefab } from 'cc';
import { HJMSJ_Incident } from '../HJMSJ_Incident';
import { HJMSJ_GameMgr } from '../HJMSJ_GameMgr';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_WorldBtn')
export class HJMSJ_WorldBtn extends Component {

    @property()
    mapID: string = "";

    start() {
        this.node.on(NodeEventType.TOUCH_END, this.onClick, this);
    }

    onClick() {
        if (HJMSJ_GameMgr.instance.isBossMap) {
            // HJMSJ_GameMgr.instance.returnMap();
            // director.getScene().emit("哈基米世界_返回村庄");
        }
        console.log("准备更换地图" + this.mapID);
        HJMSJ_Incident.Loadprefab("Prefabs/地图/" + this.mapID).then((prefab: Prefab) => {
            let bossMapNode = instantiate(prefab);

            HJMSJ_GameMgr.instance.changeMap(bossMapNode);

            director.getScene().emit("哈基米世界_更换世界地图");
        })
    }

}


