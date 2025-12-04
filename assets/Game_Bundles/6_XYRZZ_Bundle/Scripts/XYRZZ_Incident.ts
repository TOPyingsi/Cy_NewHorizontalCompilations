import { _decorator, Component, director, Node, path, Prefab, resources, SpriteFrame } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';

const { ccclass, property } = _decorator;

@ccclass('XYRZZ_Incident')
export class XYRZZ_Incident extends Component {

    public static LoadSprite(Path: string) {
        return new Promise((resolve, reject) => {
            BundleManager.GetBundle("6_XYRZZ_Bundle").load(Path + "/spriteFrame", SpriteFrame, (err, data) => {
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
            BundleManager.GetBundle("6_XYRZZ_Bundle").load(Path, Prefab, (err, data) => {
                if (err) {
                    console.log("没有找到资源" + path);
                    return;
                }
                resolve && resolve(data);
            })
        })
    }


    //将大数转为对应字符
    public static GetMaxNum(num: number): string {
        if (num < 10000) return num.toString(); // 小于一万直接返回

        const units = ["万", "亿", "兆", "京", "垓", "秭", "穰", "沟", "涧", "正", "载极", "恒河沙", "阿僧祇", "那由他", "不可思议", "无量大数"];
        let unitIndex = -1;

        // 找到最大单位
        while (num >= 10000 && unitIndex < units.length - 1) {
            num /= 10000;
            unitIndex++;
        }

        // 主单位整数部分
        const mainPart = Math.floor(num);
        // 次单位余数部分
        const remainder = Math.ceil((num - mainPart) * 10000);

        // 拼接结果，确保次单位不会访问越界的单位
        if (remainder > 0 && unitIndex > 0) {
            return `${mainPart}${units[unitIndex]}${remainder}${units[unitIndex - 1]}`;
        } else if (remainder > 0) {
            return `${mainPart}${units[unitIndex]}${remainder}`;
        } else {
            return `${mainPart}${units[unitIndex]}`;
        }
    }

}


