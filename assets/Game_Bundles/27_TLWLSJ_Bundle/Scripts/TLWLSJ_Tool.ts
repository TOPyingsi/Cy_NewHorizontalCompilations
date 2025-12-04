import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_Tool')
export class TLWLSJ_Tool extends Component {

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

    /** 返回一个范围在 [min, max) 的整数*/
    public static GetRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    /** 返回一个范围在 [min, max] 的整数*/
    public static GetRandomIntWithMax(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /*** 获取随机数*/
    public static GetRandom(min: number, max: number) {
        let r: number = Math.random();
        let rr: number = r * (max - min) + min;
        return rr;
    }

    /** 限定在范围内 [min, max]*/
    public static Clamp(value: number, min: number, max: number) {
        if (value < min) {
            return min;
        }

        if (value > max) {
            return max;
        }

        return value;
    }


    /** 获取数组的临近属性 ---可以从第一个到最后一个*/
    public static getAdjacentElement<T>(
        arr: T[],
        current: T,
        next: boolean = true
    ): T | undefined {
        const index = arr.indexOf(current);
        if (index === -1) {
            console.error('Current element not found in array');
            return undefined;
        }

        const adjacentIndex = index + (next ? 1 : -1);

        if (adjacentIndex >= 0 && adjacentIndex < arr.length) {
            return arr[adjacentIndex];
        } else if (adjacentIndex < 0) {
            return arr[arr.length - 1];
        } else if (adjacentIndex >= arr.length) {
            return arr[0];
        }
    }

    /** 获取枚举的临近属性 --- 可以从最后一个到第一个 */
    public static getAdjacentEnumCirculation<T>(
        enumObject: T,
        current: T[keyof T],
        next: boolean = true
    ): T[keyof T] {
        const enumKeys = Object.keys(enumObject).filter(k => isNaN(Number(k)));
        const currentKey = enumKeys.find(k => enumObject[k] === current);

        if (!currentKey) {
            throw new Error('Current value not found in enum');
        }

        const index = enumKeys.indexOf(currentKey);
        const adjacentIndex = (index + (next ? 1 : -1) + enumKeys.length) % enumKeys.length;
        const adjacentKey = enumKeys[adjacentIndex];

        return enumObject[adjacentKey] as T[keyof T];
    }
}


