import { _decorator, Component, Node, Prefab, SpriteFrame } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
const { ccclass, property } = _decorator;

@ccclass('XSHY_incident')
export class XSHY_incident extends Component {
    public static LoadSprite(Path: string) {
        return new Promise((resolve, reject) => {
            BundleManager.GetBundle("34_XSHY").load(Path + "/spriteFrame", SpriteFrame, (err, data) => {
                if (err) {
                    console.log("没有资源" + Path);
                    return;
                }
                resolve && resolve(data);
            })
        })
    }

    public static Loadprefab(Path: string) {
        return new Promise((resolve, reject) => {
            BundleManager.GetBundle("34_XSHY").load(Path, Prefab, (err, data) => {
                if (err) {
                    console.log("没有资源" + Path);
                    return;
                }
                resolve && resolve(data);
            })
        })
    }
}


