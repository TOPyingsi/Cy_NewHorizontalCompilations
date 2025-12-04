import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('XSHY_Constant')
export class XSHY_Constant {
    static XSHY_Group = {
        DEFAULT: 1 << 0,
        Unit: 1 << 1,
        Map: 1 << 2,

    };

    public static UnitData: { Name: string, Speed: number, HP: number, Attack: number }[] = [
        { Name: "卡卡西", Speed: 20, HP: 100, Attack: 15 },
        { Name: "四代目", Speed: 20, HP: 100, Attack: 15 },
    ]

    public static GetUnitDataByName(Name: string): { Name: string, Speed: number, HP: number, Attack: number } {
        return XSHY_Constant.UnitData.find(e => { return e.Name == Name });
    }

}


