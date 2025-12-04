import { math, misc } from "cc";
import { SJZ_ContainerData, SJZ_ContainerLootData, SJZ_ContainerType, SJZ_ItemData, SJZ_ItemType, SJZ_PrizePoolData } from "./SJZ_Data";
import { SJZ_DataManager } from "./SJZ_DataManager";

export class SJZ_LootManager {

    // 打开容器，获取产出的物品
    public static GetContainerResult(containerType: SJZ_ContainerType): SJZ_ItemData[] {
        const table = SJZ_DataManager.ContainerLootMap.get(containerType);
        if (!table) {
            console.warn(`No drop table found for container: ${containerType}`);
            return [];
        }

        const results: SJZ_ItemData[] = [];
        let count = misc.clampf(Math.round(Math.random() * 5), 1, 5);

        for (let i = 0; i < count; i++) {
            const item = this.GetRandomItem(table);
            if (item) {
                let data = SJZ_DataManager.GetItemDataByType(item.Type, item.ID);
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
    private static GetRandomItem(drops: SJZ_ContainerLootData[]): SJZ_ContainerLootData | null {
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
    public static GetRandomItemInPrizePool(): SJZ_PrizePoolData | null {
        let drops = SJZ_DataManager.PrizePoolData;

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
