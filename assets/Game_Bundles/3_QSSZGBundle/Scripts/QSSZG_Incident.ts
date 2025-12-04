import { _decorator, Component, director, Node, path, Prefab, resources, SpriteFrame } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';

const { ccclass, property } = _decorator;

@ccclass('QSSZG_Incident')
export class QSSZG_Incident extends Component {

    public static LoadSprite(Path: string) {
        return new Promise((resolve, reject) => {
            BundleManager.GetBundle("3_QSSZGBundle").load(Path + "/spriteFrame", SpriteFrame, (err, data) => {
                if (err) {
                    console.log("没有找到资源" + path);
                    return;
                }
                resolve && resolve(data);
            })
        })
    }

    public static Loadprefab(Path: string) {
        return new Promise((resolve, reject) => {
            BundleManager.GetBundle("3_QSSZGBundle").load("Res/" + Path, Prefab, (err, data) => {
                if (err) {
                    console.log("没有找到资源" + path);
                    return;
                }
                resolve && resolve(data);
            })
        })
    }


}


