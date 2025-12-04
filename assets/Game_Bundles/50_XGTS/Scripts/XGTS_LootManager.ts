import { math, misc } from "cc";
import { XGTS_ContainerData, XGTS_ContainerLootData, XGTS_ContainerType, XGTS_ItemData, XGTS_ItemType, XGTS_PrizePoolData } from "./XGTS_Data";
import { XGTS_DataManager } from "./XGTS_DataManager";

export class XGTS_LootManager {

    // 打开容器，获取产出的物品
    public static GetContainerResult(containerType: XGTS_ContainerType): XGTS_ItemData[] {
        const table = XGTS_DataManager.ContainerLootMap.get(containerType);
        if (!table) {
            console.warn(`No drop table found for container: ${containerType}`);
            return [];
        }

        const results: XGTS_ItemData[] = [];
        let count = misc.clampf(Math.round(Math.random() * 5), 1, 5);

        for (let i = 0; i < count; i++) {
            const item = this.GetRandomItem(table);
            if (item) {
                let data = XGTS_DataManager.GetItemDataByType(item.Type, item.ID);
                if (data) {
                    data.Searched = false;
                    results.push(data);
                } else {
                    console.error("找不到数据", item);
                }
            }
        }

        return results;
    }

    // 内部函数：根据概率从一组物品中随机一个
    private static GetRandomItem(drops: XGTS_ContainerLootData[]): XGTS_ContainerLootData | null {
        const totalWeight = drops.reduce((sum, drop) => sum + drop.Probability, 0);
        if (totalWeight <= 0) return null;

        const rand = Math.random() * totalWeight;
        let accum = 0;
        for (const drop of drops) {
            accum += drop.Probability;
            if (rand <= accum) {
                return drop;
            }
        }

        return null;
    }


    // 内部函数：根据概率从一组物品中随机一个
    public static GetRandomItemInPrizePool(): XGTS_PrizePoolData | null {
        let drops = XGTS_DataManager.PrizePoolData;

        const totalWeight = drops.reduce((sum, drop) => sum + drop.Probability, 0);
        if (totalWeight <= 0) return null;

        const rand = Math.random() * totalWeight;
        let accum = 0;
        for (const drop of drops) {
            accum += drop.Probability;
            if (rand <= accum) {
                return drop;
            }
        }

        return null;
    }
}
