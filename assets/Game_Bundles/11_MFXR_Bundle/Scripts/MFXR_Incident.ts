import { _decorator, AudioClip, Component, director, Node, path, Prefab, resources, SpriteFrame } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';


const { ccclass, property } = _decorator;

@ccclass('MFXR_Incident')
export class MFXR_Incident extends Component {

    public static LoadSprite(Path: string) {
        return new Promise((resolve, reject) => {
            BundleManager.GetBundle("11_MFXR_Bundle").load(Path + "/spriteFrame", SpriteFrame, (err, data) => {
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
            BundleManager.GetBundle("11_MFXR_Bundle").load(Path, Prefab, (err, data) => {
                if (err) {
                    console.log("没有找到资源" + path);
                    return;
                }
                resolve && resolve(data);
            })
        })
    }

    public static LoadAudio(Path: string) {
        return new Promise((resolve, reject) => {
            BundleManager.GetBundle("11_MFXR_Bundle").load(Path, AudioClip, (err, data) => {
                if (err) {
                    console.log("没有找到资源" + path);
                    return;
                }
                resolve && resolve(data);
            })
        })
    }


}


