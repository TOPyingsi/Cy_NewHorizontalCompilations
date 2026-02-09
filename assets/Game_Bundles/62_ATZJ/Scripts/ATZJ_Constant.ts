import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ATZJ_Constant')
export class ATZJ_Constant {
    public static GameMode = "对战一对一";


    static ATZJ_Group = {
        DEFAULT: 1 << 0,
        Unit: 1 << 1,
        Map: 1 << 2,
        AttackBox: 1 << 3,
    };

    public static UnitData: { Name: string, Speed: number, HP: number, Attack: number }[] = [
        { Name: "鼬", Speed: 20, HP: 800, Attack: 14 },
        { Name: "山治", Speed: 22, HP: 700, Attack: 16 },
        { Name: "赛罗", Speed: 24, HP: 650, Attack: 13 },
        { Name: "火柴人", Speed: 22, HP: 700, Attack: 17 },
        { Name: "初代", Speed: 22, HP: 720, Attack: 16 },
        { Name: "索隆", Speed: 25, HP: 840, Attack: 15 },
        { Name: "杰德", Speed: 20, HP: 1000, Attack: 13 },
        { Name: "迪迦", Speed: 22, HP: 900, Attack: 15 },
    ]

    public static GetUnitDataByName(Name: string): { Name: string, Speed: number, HP: number, Attack: number } {
        return ATZJ_Constant.UnitData.find(e => { return e.Name == Name });
    }

}


