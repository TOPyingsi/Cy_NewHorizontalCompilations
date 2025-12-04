import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SJNDGZ_Tool')
export class SJNDGZ_Tool extends Component {

    /**
     * 
     * @param number 格式化数值
     * @param fixed 保留小数点后几位
     * @returns    字符串类型的数值
     */
    public static formatNumber(number: number, fixed: number = 1) {
        if (number >= 1e24) {
            // 大于或等于 1亿 兆，用“亿兆”作单位
            return (number / 1e24).toFixed(fixed) + "亿兆";
        } else if (number >= 1e20) {
            // 大于或等于 1 万兆，用“万兆”作单位
            return (number / 1e20).toFixed(fixed) + "万兆";
        } else if (number >= 1e16) {
            // 大于或等于 1 兆，用“兆”作单位
            return (number / 1e16).toFixed(fixed) + "兆";
        } else if (number >= 1e12) {
            // 大于或等于 1 万亿，用“万亿”作单位
            return (number / 1e12).toFixed(fixed) + "万亿";
        } else if (number >= 1e8) {
            // 大于或等于 1 亿，用“亿”作单位
            return (number / 1e8).toFixed(fixed) + "亿";
        } else if (number >= 1e4) {
            // 大于或等于 1 万，用“万”作单位
            return (number / 1e4).toFixed(fixed) + "万";
        } else {
            // 小于 1 万，直接返回原数字
            return number.toString();
        }
    }

    /*** 深度拷贝*/
    public static Clone(sObj: any) {
        if (sObj === null || typeof sObj !== "object") {
            return sObj;
        }

        let s: { [key: string]: any } = {};
        if (sObj.constructor === Array) {
            s = [];
        }

        for (let i in sObj) {
            if (sObj.hasOwnProperty(i)) {
                s[i] = this.Clone(sObj[i]);
            }
        }

        return s;
    }

    /*** 将数组内容进行随机排列 */
    public static Rand(arr: any[]): any[] {
        let arrClone = this.Clone(arr);
        // 首先从最大的数开始遍历，之后递减
        for (let i: number = arrClone.length - 1; i >= 0; i--) {
            // 随机索引值randomIndex是从0-arrClone.length中随机抽取的
            const randomIndex: number = Math.floor(Math.random() * (i + 1));
            // 下面三句相当于把从数组中随机抽取到的值与当前遍历的值互换位置
            const temp: any = arrClone[randomIndex];
            arrClone[randomIndex] = arrClone[i];
            arrClone[i] = temp;
        }
        // 每一次的遍历都相当于把从数组中随机抽取（不重复）的一个元素放到数组的最后面（索引顺序为：len-1,len-2,len-3......0）
        return arrClone;
    }

    /** 根据枚举值找key*/
    public static GetEnumKeyByValue(enumObj: any, value: any): string | undefined {
        // 遍历枚举对象的键和值
        for (let key in enumObj) {
            if (enumObj[key] === value) {
                return key;
            }
        }
        return undefined; // 如果没有找到匹配的值，返回undefined
    }
}


