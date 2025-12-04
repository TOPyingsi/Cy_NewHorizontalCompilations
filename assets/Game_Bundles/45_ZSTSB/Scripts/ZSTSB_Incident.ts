import { _decorator, Component, ImageAsset, Node, Prefab, SpriteFrame } from 'cc';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
const { ccclass, property } = _decorator;

@ccclass('ZSTSB_Incident')
export class ZSTSB_Incident extends Component {
    public static LoadSprite(Path: string) {
        return new Promise((resolve, reject) => {
            BundleManager.GetBundle("45_ZSTSB").load(Path + "/spriteFrame", SpriteFrame, (err, data) => {
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
            BundleManager.GetBundle("45_ZSTSB").load(Path, Prefab, (err, data) => {
                if (err) {
                    console.log("没有找到预制体" + Path);
                    return;
                }
                resolve && resolve(data);
            })
        })
    }

    public static LoadImageAsset(Path: string) {
        return new Promise((resolve, reject) => {
            BundleManager.GetBundle("45_ZSTSB").load(Path, ImageAsset, (err, data) => {
                if (err) {
                    console.log("没有找到ImageAsset" + Path);
                    return;
                }
                resolve && resolve(data);
            })
        })
    }
}


