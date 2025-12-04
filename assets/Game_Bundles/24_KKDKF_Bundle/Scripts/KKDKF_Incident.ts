import { _decorator, Component, director, Node, path, Prefab, resources, SpriteFrame, tween, Vec2, Vec3 } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
const { ccclass, property } = _decorator;

@ccclass('KKDKF_Incident')
export class KKDKF_Incident extends Component {

    public static LoadSprite(Path: string) {
        return new Promise((resolve, reject) => {
            BundleManager.GetBundle("24_KKDKF_Bundle").load(Path + "/spriteFrame", SpriteFrame, (err, data) => {
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
            BundleManager.GetBundle("24_KKDKF_Bundle").load(Path, Prefab, (err, data) => {
                if (err) {
                    console.log("没有找到资源" + path);
                    return;
                }
                resolve && resolve(data);
            })
        })
    }

    public static Tween_To(node: Node, endwpos: Vec3, time: number, callback?: Function) {
        tween(node)
            .to(time, { position: endwpos })
            .call(() => {
                if (callback) callback();
            }).start();
    }

    public static arraysAreEqual<T>(arr1: T[], arr2: T[]): boolean {
        // 如果数组长度不同，则内容一定不相等
        if (arr1.length !== arr2.length) {
            return false;
        }

        // 遍历数组，检查每个对应位置的元素是否相等
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }

        // 如果所有检查都通过，则数组内容相等
        return true;
    }
}


