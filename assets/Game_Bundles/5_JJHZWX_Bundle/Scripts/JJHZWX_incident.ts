import { _decorator, Component, Node, Prefab, SpriteFrame } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
const { ccclass, property } = _decorator;

@ccclass('JJHZWX_incident')
export class JJHZWX_incident extends Component {
    public static LoadSprite(Path: string) {
        return new Promise((resolve, reject) => {
            BundleManager.GetBundle("5_JJHZWX_Bundle").load(Path + "/spriteFrame", SpriteFrame, (err, data) => {
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
            BundleManager.GetBundle("5_JJHZWX_Bundle").load(Path, Prefab, (err, data) => {
                if (err) {
                    console.log("没有资源" + Path);
                    return;
                }
                resolve && resolve(data);
            })
        })
    }
}


