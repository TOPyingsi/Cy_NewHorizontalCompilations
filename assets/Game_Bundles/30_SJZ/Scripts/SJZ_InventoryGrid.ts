import { UITransform, v2, v3, Vec2 } from "cc";
import { SJZ_Constant } from "./SJZ_Constant";

export class SJZ_InventoryGrid {
    public width: number;
    public height: number;
    grid: number[][] = [];// 0 = 空，1 = 已占用

    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.grid = Array.from({ length: height }, () => Array.from({ length: width }, () => 0));
    }

    /** 判断物品是否可以放在 (startX, startY) 这个起点位置 */
    public static GetPlaceItemPoints(inventoryGrid: SJZ_InventoryGrid, startX: number, startY: number, itemWidth: number, itemHeight: number) {
        let list: Vec2[] = [];

        for (let i = startX; i < startX + itemWidth; i++) {
            if (i > inventoryGrid.width - 1) continue;

            for (let j = startY; j < startY + itemHeight; j++) {
                if (j > inventoryGrid.height - 1) continue;
                list.push(v2(i, j));
            }
        }

        return list;
    }

    /** 判断物品是否可以放在 (startX, startY) 这个起点位置 */
    public static CanPlaceItem(inventoryGrid: SJZ_InventoryGrid, startX: number, startY: number, itemWidth: number, itemHeight: number) {
        // 检查是否越界
        if (startX + itemWidth > inventoryGrid.width || startY + itemHeight > inventoryGrid.height) return false;

        for (let i = startX; i < startX + itemWidth; i++) {
            for (let j = startY; j < startY + itemHeight; j++) {
                if (inventoryGrid.grid[j][i] != 0) return false;
            }
        }

        return true;
    }

    /** 放置物品 */
    public static PlaceItem(inventoryGrid: SJZ_InventoryGrid, startX: number, startY: number, itemWidth: number, itemHeight: number) {
        for (let i = startX; i < startX + itemWidth; i++) {
            for (let j = startY; j < startY + itemHeight; j++) {
                inventoryGrid.grid[j][i] = 1;
            }
        }

        // console.error("PlaceItem", startX, startY, itemWidth, itemHeight, this.grid);
    }

    /** 移除物品 */
    public static RemoveItem(inventoryGrid: SJZ_InventoryGrid, startX: number, startY: number, itemWidth: number, itemHeight: number) {
        for (let i = startX; i < startX + itemWidth; i++) {
            for (let j = startY; j < startY + itemHeight; j++) {
                inventoryGrid.grid[j][i] = 0;
            }
        }

        // console.error("Remove", startX, startY, itemWidth, itemHeight, this.grid);
    }

    /** 重置 grid */
    public static ClearGrid(inventoryGrid: SJZ_InventoryGrid) {
        let grid = inventoryGrid.grid;
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                if (grid[i][j] === 1) {
                    grid[i][j] = 0;
                }
            }
        }
    }

    /**把二维坐标点转化被背包格子的世界坐标 */
    public static GridPointToWorldPosition(point: Vec2, gridParent: UITransform) {
        let position = v3(point.x * SJZ_Constant.itemSize, -point.y * SJZ_Constant.itemSize, 0);
        return gridParent.convertToWorldSpaceAR(position);
    }
}


