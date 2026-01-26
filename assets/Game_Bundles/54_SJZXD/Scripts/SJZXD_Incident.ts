import { _decorator, Component, Node, Prefab, SpriteFrame, Texture2D } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { SJZXD_Constant } from './SJZXD_Constant';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_Incident')
export class SJZXD_Incident extends Component {

    public static LoadSprite(Path: string) {
        return new Promise((resolve, reject) => {
            BundleManager.GetBundle("54_SJZXD").load(Path + "/spriteFrame", SpriteFrame, (err, data) => {
                if (err) {
                    console.log("没有找到图片" + Path);
                    return;
                }
                resolve && resolve(data);
            })
        })
    }

    public static LoadTexture2D(Path: string) {
        return new Promise((resolve, reject) => {
            BundleManager.GetBundle("54_SJZXD").load(Path + "/texture", Texture2D, (err, data) => {
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
            BundleManager.GetBundle("54_SJZXD").load(Path, Prefab, (err, data) => {
                if (err) {
                    console.log("没有找到预制体" + Path);
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
        const remainder = Math.round((num - mainPart) * 10000);

        // 拼接结果，确保次单位不会访问越界的单位
        if (remainder > 0 && unitIndex > 0) {
            return `${mainPart}${units[unitIndex]}${remainder}${units[unitIndex - 1]}`;
        } else if (remainder > 0) {
            return `${mainPart}${units[unitIndex]}${remainder}`;
        } else {
            return `${mainPart}${units[unitIndex]}`;
        }
    }
    //将时间转为格式化
    public static FormatTime(seconds: number): string {
        // 计算分钟数（向下取整）
        const minutes = Math.floor(seconds / 60);
        // 计算剩余秒数
        const remainingSeconds = Math.floor(seconds % 60);
        // 格式化为两位数字符串
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
        return `${formattedMinutes}:${formattedSeconds}`;
    }

    //获取一组物资的价值
    public static GetPropValue(PropData: string[]): number {
        let value = 0;
        for (let i = 0; i < PropData.length; i++) {
            value += SJZXD_Constant.getPropDataByName(PropData[i]).price;
        }
        return value;
    }
}


