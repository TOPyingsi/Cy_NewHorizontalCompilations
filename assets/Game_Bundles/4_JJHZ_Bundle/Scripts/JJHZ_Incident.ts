import { _decorator, AudioClip, Component, director, Node, path, Prefab, resources, SpriteFrame } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
const { ccclass, property } = _decorator;

@ccclass('JJHZ_Incident')
export class JJHZ_Incident extends Component {

    public static LoadSprite(Path: string) {
        return new Promise((resolve, reject) => {
            BundleManager.GetBundle("4_JJHZ_Bundle").load(Path + "/spriteFrame", SpriteFrame, (err, data) => {
                if (err) {
                    if (BundleManager.GetBundle("4_JJHZ_Bundle2")) {
                        BundleManager.GetBundle("4_JJHZ_Bundle2").load(Path + "/spriteFrame", SpriteFrame, (err, data) => {
                            if (err) {
                                console.log("没有找到资源" + Path);
                                return;
                            }
                            resolve && resolve(data);
                        })
                        return;
                    }
                    return;
                }
                resolve && resolve(data);
            })
        })
    }

    public static Loadprefab(Path: string) {
        return new Promise((resolve, reject) => {
            BundleManager.GetBundle("4_JJHZ_Bundle").load(Path, Prefab, (err, data) => {
                if (err) {
                    if (BundleManager.GetBundle("4_JJHZ_Bundle2")) {
                        BundleManager.GetBundle("4_JJHZ_Bundle2").load(Path, Prefab, (err, data) => {
                            if (err) {
                                console.log("没有找到资源" + Path);
                                return;
                            }
                            resolve && resolve(data);
                        })
                        return;
                    }
                    return;
                }
                resolve && resolve(data);
            })
        })
    }

    public static LoadMusic(Path: string) {
        return new Promise((resolve, reject) => {
            BundleManager.GetBundle("4_JJHZ_Bundle").load(Path, AudioClip, (err, data) => {
                if (err) {
                    if (BundleManager.GetBundle("4_JJHZ_Bundle2")) {
                        BundleManager.GetBundle("4_JJHZ_Bundle2").load(Path, AudioClip, (err, data) => {
                            if (err) {
                                console.log("没有找到音频资源" + Path);
                                return;
                            }
                            resolve && resolve(data);
                        })
                        return;
                    }
                    return;
                }
                resolve && resolve(data);
            })
        })
    }
}


