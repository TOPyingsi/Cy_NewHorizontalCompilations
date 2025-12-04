import { _decorator, AudioClip, Component, director, Node, path, Prefab, resources, SpriteFrame } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
const { ccclass, property } = _decorator;

@ccclass('XNHXSY_Incident')
export class XNHXSY_Incident extends Component {

    public static LoadSprite(Path: string) {
        return new Promise((resolve, reject) => {
            BundleManager.GetBundle("16_XNHXSY_Bundle").load(Path + "/spriteFrame", SpriteFrame, (err, data) => {
                if (err) {
                    console.log("没有找到图片" + Path);
                    return;
                }
                resolve && resolve(data);
            })
        })
    }

    public static Loadprefab(Path: string) {
        return new Promise((resolve, reject) => {
            BundleManager.GetBundle("16_XNHXSY_Bundle").load(Path, Prefab, (err, data) => {
                if (err) {
                    console.log("没有找到预制体" + Path);
                    return;
                }
                resolve && resolve(data);
            })
        })
    }


}


