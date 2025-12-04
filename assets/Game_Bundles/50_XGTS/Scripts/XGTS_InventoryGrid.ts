import { UITransform, v2, v3, Vec2 } from "cc";
import { XGTS_Constant } from "./XGTS_Constant";

export class XGTS_InventoryGrid {
    public width: number;
    public height: number;
    grid: number[][] = [];// 0 = 空，1 = 已占用

    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.grid = Array.from({ length: height }, () => Array.from({ length: width }, () => 0));
    }

    /** 判断物品是否可以放在 (startX, startY) 这个起点位置 */
    public static GetPlaceItemPoints(inventoryGrid: XGTS_InventoryGrid, startX: number, startY: number, itemWidth: number, itemHeight: number) {
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
    public static CanPlaceItem(inventoryGrid: XGTS_InventoryGrid, startX: number, startY: number, itemWidth: number, itemHeight: number) {
        // 添加边界检查
        if (!inventoryGrid || !inventoryGrid.grid) return false;
        
        // 检查是否越界
        if (startX + itemWidth > inventoryGrid.width || startY + itemHeight > inventoryGrid.height) return false;
        if (startX < 0 || startY < 0) return false;

        for (let i = startX; i < startX + itemWidth; i++) {
            // 检查列索引是否越界
            if (i >= inventoryGrid.width || i < 0) continue;
            
            for (let j = startY; j < startY + itemHeight; j++) {
                // 检查行索引是否越界
                if (j >= inventoryGrid.height || j < 0) continue;
                
                // 检查数组元素是否存在且为空闲状态
                if (inventoryGrid.grid[j] && inventoryGrid.grid[j][i] !== undefined) {
                    if (inventoryGrid.grid[j][i] != 0) return false;
                } else {
                    return false;
                }
            }
        }

        return true;
    }

    /** 放置物品 */
    public static PlaceItem(inventoryGrid: XGTS_InventoryGrid, startX: number, startY: number, itemWidth: number, itemHeight: number) {
        // 添加边界检查，防止访问未定义的数组元素
        if (!inventoryGrid || !inventoryGrid.grid) return;
        
        for (let i = startX; i < startX + itemWidth; i++) {
            // 检查列索引是否越界
            if (i >= inventoryGrid.width || i < 0) continue;
            
            for (let j = startY; j < startY + itemHeight; j++) {
                // 检查行索引是否越界
                if (j >= inventoryGrid.height || j < 0) continue;
                
                // 检查数组元素是否存在
                if (inventoryGrid.grid[j] && inventoryGrid.grid[j][i] !== undefined) {
                    inventoryGrid.grid[j][i] = 1;
                }
            }
        }

        // console.error("PlaceItem", startX, startY, itemWidth, itemHeight, this.grid);
    }

    /** 移除物品 */
    public static RemoveItem(inventoryGrid: XGTS_InventoryGrid, startX: number, startY: number, itemWidth: number, itemHeight: number) {
        // 添加边界检查，防止访问未定义的数组元素
        if (!inventoryGrid || !inventoryGrid.grid) return;
        
        for (let i = startX; i < startX + itemWidth; i++) {
            // 检查列索引是否越界
            if (i >= inventoryGrid.width || i < 0) continue;
            
            for (let j = startY; j < startY + itemHeight; j++) {
                // 检查行索引是否越界
                if (j >= inventoryGrid.height || j < 0) continue;
                
                // 检查数组元素是否存在
                if (inventoryGrid.grid[j] && inventoryGrid.grid[j][i] !== undefined) {
                    inventoryGrid.grid[j][i] = 0;
                }
            }
        }

        // console.error("Remove", startX, startY, itemWidth, itemHeight, this.grid);
    }

    /** 重置 grid */
    public static ClearGrid(inventoryGrid: XGTS_InventoryGrid) {
        let grid = inventoryGrid.grid;
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                if (grid[i][j] === 1) {
                    grid[i][j] = 0;
                }
            }
        }
    }
    
    /** 调整网格尺寸 */
    public static ResizeGrid(inventoryGrid: XGTS_InventoryGrid, newWidth: number, newHeight: number) {
        // 更新网格尺寸属性
        inventoryGrid.width = newWidth;
        inventoryGrid.height = newHeight;
        
        // 重新创建网格数组，所有格子初始化为空闲状态
        inventoryGrid.grid = Array.from({ length: newHeight }, () => Array.from({ length: newWidth }, () => 0));
    }

    /**把二维坐标点转化被背包格子的世界坐标 */
    public static GridPointToWorldPosition(point: Vec2, gridParent: UITransform) {
        let position = v3(point.x * XGTS_Constant.itemSize, -point.y * XGTS_Constant.itemSize, 0);
        return gridParent.convertToWorldSpaceAR(position);
    }
}