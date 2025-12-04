import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('XNHXSY_GameData')
export class XNHXSY_GameData {
    public static MateerData: { Name: string, CnName: string, density: number, solubility: number, FreezingPoint: number, BoilingPoint: number }[] = [
        { Name: "Co", CnName: "一氧化碳", density: 0.001429, solubility: 3.1, FreezingPoint: -218.79, BoilingPoint: -182.95 },
        { Name: "o2", CnName: "氧气", density: 0.001429, solubility: 1.1, FreezingPoint: -218.79, BoilingPoint: -182.95 },
        { Name: "So3", CnName: "三氧化硫", density: 1.92, solubility: 0, FreezingPoint: 16.9, BoilingPoint: 45 },
        { Name: "H2o", CnName: "水", density: 1, solubility: 0, FreezingPoint: 0, BoilingPoint: 100 },
        { Name: "As", CnName: "砷", density: 5.727, solubility: 0, FreezingPoint: 615, BoilingPoint: 616 },
        { Name: "L2", CnName: "碘", density: 5.727, solubility: 0, FreezingPoint: 615, BoilingPoint: 616 },
        { Name: "Li", CnName: "锂", density: 0.534, solubility: 0, FreezingPoint: 180.54, BoilingPoint: 1342 },
        { Name: "H2", CnName: "氢", density: 0.00008988, solubility: 0, FreezingPoint: -259.14, BoilingPoint: -252.9 },
        { Name: "F2", CnName: "氟", density: 0.001696, solubility: 0, FreezingPoint: -219.52, BoilingPoint: -188.05 },
        { Name: "Pd", CnName: "钯", density: 0.002696, solubility: 0, FreezingPoint: -119.52, BoilingPoint: -128.05 },
        { Name: "CaO", CnName: "氧化钙", density: 3.35, solubility: 0, FreezingPoint: 2572, BoilingPoint: 2850 },
        { Name: "K", CnName: "钾", density: 0.862, solubility: 0, FreezingPoint: 63.38, BoilingPoint: 759 },
    ]


    public static CompoundData: { 合成物: string, 材料: string[] }[] = [
        { 合成物: "二氧化碳", 材料: ["Co", "o2", "高温"] },
        { 合成物: "硫酸", 材料: ["So3", "H2o"] },
        { 合成物: "Asl3", 材料: ["As", "L2"] },
        { 合成物: "氧化锂", 材料: ["Li", "o2", "高温"] },
        { 合成物: "氟化氢", 材料: ["H2", "F2"] },
        { 合成物: "二氟化钯", 材料: ["F2", "Pd"] },
        { 合成物: "氢氧化钙", 材料: ["CaO", "H2o"] },
        { 合成物: "氢化钾", 材料: ["K", "H2"] },
    ]

    public static GetCompoundDataText(data: { 合成物: string, 材料: string[] }): string {
        let txt: string = "";
        txt += data.合成物 + "=";
        data.材料.forEach((dt) => {
            txt += dt + "+";
        })
        txt = txt.substring(0, txt.length - 1);
        return txt;
    }
}


