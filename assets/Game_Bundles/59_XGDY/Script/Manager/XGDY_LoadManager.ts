// 导入Cocos Creator核心模块
import { _decorator, Component, SpriteFrame, Prefab, Node, resources } from 'cc';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
// 获取装饰器
const { ccclass, property } = _decorator;

/**
 * 资源类型枚举
 * 对应需要加载的各类资源类型
 */

export enum XGDY_ResourceType {
    // 图标资源
    MapIcon,        // 0-地图图标资源
    MapBg,  // 1-地图背景
    AnglerIcon,  // 2-angler图标资源
    FishingRodIcon,  // 3-钓竿图标资源
    SpecialItemIcon,  // 4-特殊物品图标资源
    FishIcon,  // 5-鱼图标资源
    SkillIcon,  // 6-技能图标资源
    // 预制体资源   
    MapPrefab,   // 7-地图预制体
    AnglerPrefab,   // 8-角色预制体
    FishPrefab   // 9-鱼预制体
}

/**
 * 钓鱼游戏资源加载管理器类
 * 负责管理游戏中各类资源的加载、缓存和获取
 * 实现单例模式，确保全局资源管理的一致性
 * 继承自Cocos Creator的Component类
 */
@ccclass('XGDY_LoadManager')
export class XGDY_LoadManager extends Component {
    public static Instance: XGDY_LoadManager;  // 单例实例，全局访问点

    @property(Prefab)
    homeMapPrefab:Prefab = null;

    @property(Prefab)
    anglerPrefab:Prefab = null;

    // 资源缓存字典
    // 键: 资源ID或路径，值: 加载的资源对象
    private resourceCache: {
        [key: string]: SpriteFrame | Prefab | any
    } = {};

    /**
     * 组件加载时的初始化方法
     * Cocos Creator生命周期函数
     */
    onLoad() {
        XGDY_LoadManager.Instance = this;  // 设置单例实例
        this.initResourceCache();  // 初始化资源缓存
    }

    /**
     * 初始化资源缓存
     * 可以在这里预加载常用资源
     */
    private initResourceCache() {
        this.resourceCache = {};  // 初始化空缓存
        // 可以添加预加载逻辑，例如:
        // this.preloadCommonIcons();
    }

    /**
     * 根据资源ID和类型获取图标资源
     * @param resourceId 资源ID，格式需符合配置表定义
     * @param type 资源类型
     * @param callback 加载完成回调函数
     */
    getResource(resourceId: string, type: XGDY_ResourceType, callback: (resource: any) => void) {
        // 生成唯一缓存键
        const cacheKey = this.generateCacheKey(resourceId, type);
        
        // 检查缓存中是否已存在该资源
        if (this.resourceCache[cacheKey]) {
            callback(this.resourceCache[cacheKey]);  // 直接返回缓存资源
            return;
        }

        // 根据资源类型确定加载路径和类型
        const { path, resourceType } = this.getResourceInfo(type, resourceId);
        
        // 加载资源
        BundleManager.GetBundle('59_XGDY').load(path, resourceType, (err, asset) => {
            if (err) {
                console.error(`Failed to load resource: ${path}, error: ${err}`);
                callback(null);  // 加载失败返回null
                return;
            }

            this.resourceCache[cacheKey] = asset;  // 缓存加载的资源
            callback(asset);  // 调用回调返回资源
        });
    }

    /**
     * 生成资源缓存的唯一键
     * @param resourceId 资源ID
     * @param type 资源类型
     * @returns 唯一缓存键字符串
     */
    private generateCacheKey(resourceId: string, type: XGDY_ResourceType): string {
        return `${type}_${resourceId}`;  // 用类型和ID组合生成唯一键
    }

    /**
     * 获取资源加载信息（路径和资源类型）
     * @param type 资源类型
     * @param resourceId 资源ID
     * @returns 包含路径和资源类型的对象
     */
    private getResourceInfo(type: XGDY_ResourceType, resourceId: string): { path: string, resourceType: any } {
        switch (type) {
            case XGDY_ResourceType.MapIcon:
                // 图标资源路径格式: icons/[id]
                return {
                    path: `Sprites/mapBgs/${resourceId}`+"/spriteFrame",
                    resourceType: SpriteFrame
                };

            case XGDY_ResourceType.MapBg:
                // 地图背景路径格式: mapBgs/[id]
                return {
                    path: `Sprites/mapBgs/${resourceId}`+"/spriteFrame",
                    resourceType: SpriteFrame
                };
            case XGDY_ResourceType.AnglerIcon:
                // angler图标资源路径格式: anglerIcons/[id]
                return {
                    path: `Sprites/anglerIcons/${resourceId}`+"/spriteFrame",
                    resourceType: SpriteFrame
                };
            case XGDY_ResourceType.FishingRodIcon:
                // 钓竿图标资源路径格式: fishingRodIcons/[id]
                return {
                    path: `Sprites/fishingRodIcons/${resourceId}`+"/spriteFrame",
                    resourceType: SpriteFrame
                };
            case XGDY_ResourceType.SpecialItemIcon:
                // 特殊物品图标资源路径格式: specialItemIcons/[id]
                return {
                    path: `Sprites/specialItemIcons/${resourceId}`+"/spriteFrame",
                    resourceType: SpriteFrame
                };
            case XGDY_ResourceType.FishIcon:
                // 鱼图标资源路径格式: fishIcons/[id]
                return {
                    path: `Sprites/fishIcons/${resourceId}`+"/spriteFrame",
                    resourceType: SpriteFrame
                };
            case XGDY_ResourceType.SkillIcon:
                // 技能图标资源路径格式: skillIcons/[id]
                return {
                    path: `Sprites/skillIcons/${resourceId}`+"/spriteFrame",
                    resourceType: SpriteFrame
                };
            case XGDY_ResourceType.MapPrefab:
                // 地图预制体路径格式: maps/[id]
                return {
                    path: `Prefabs/maps/${resourceId}`,
                    resourceType: Prefab
                };
            case XGDY_ResourceType.AnglerPrefab:
                // 角色预制体路径格式: characters/[id]
                return {
                    path: `Prefabs/anglers/${resourceId}`,
                    resourceType: Prefab
                };
            case XGDY_ResourceType.FishPrefab:
                // 鱼预制体路径格式: fishes/[id]
                return {
                    path: `Prefabs/fishes/${resourceId}`,
                    resourceType: Prefab
                };
            default:
                throw new Error(`Unsupported resource type: ${type}`);
        }
    }

    /**
     * 根据ID获取地图图标资源
     * 封装getResource方法，专门用于获取地图图标
     * @param mapId 地图图标ID
     * @param callback 加载完成回调
     */
    getMapIconById(mapId: string, callback: (spriteFrame: SpriteFrame | null) => void) {
        this.getResource(mapId, XGDY_ResourceType.MapIcon, (res) => {
            callback(res as SpriteFrame | null);
        });
    }

    /**
     * 根据ID获取地图背景资源
     * 封装getResource方法，专门用于获取地图背景
     * @param mapId 地图背景ID
     * @param callback 加载完成回调
     */
    getMapBgById(mapId: string, callback: (spriteFrame: SpriteFrame | null) => void) {
        this.getResource(mapId, XGDY_ResourceType.MapBg, (res) => {
            callback(res as SpriteFrame | null);
        });
    }

     /**
     * 根据ID获取angler图标资源
     * 封装getResource方法，专门用于获取angler图标
     * @param anglerId angler图标ID
     * @param callback 加载完成回调
     */
    getAnglerIconById(anglerId: string, callback: (spriteFrame: SpriteFrame | null) => void) {
        this.getResource(anglerId, XGDY_ResourceType.AnglerIcon, (res) => {
            callback(res as SpriteFrame | null);
        });
    }

     /**
     * 根据ID获取钓竿图标资源
     * 封装getResource方法，专门用于获取钓竿图标
     * @param fishingRodId 钓竿图标ID
     * @param callback 加载完成回调
     */
    getFishingRodIconById(fishingRodId: string, callback: (spriteFrame: SpriteFrame | null) => void) {
        this.getResource(fishingRodId, XGDY_ResourceType.FishingRodIcon, (res) => {
            callback(res as SpriteFrame | null);
        });
    }

     /**
     * 根据ID获取特殊物品图标资源
     * 封装getResource方法，专门用于获取特殊物品图标
     * @param specialItemId 特殊物品图标ID
     * @param callback 加载完成回调
     */
    getSpecialItemIconById(specialItemId: string, callback: (spriteFrame: SpriteFrame | null) => void) {
        this.getResource(specialItemId, XGDY_ResourceType.SpecialItemIcon, (res) => {
            callback(res as SpriteFrame | null);
        });
    }

     /**
     * 根据ID获取鱼图标资源
     * 封装getResource方法，专门用于获取鱼图标
     * @param fishId 鱼图标ID
     * @param callback 加载完成回调
     */
    getFishIconById(fishId: string, callback: (spriteFrame: SpriteFrame | null) => void) {
        this.getResource(fishId, XGDY_ResourceType.FishIcon, (res) => {
            callback(res as SpriteFrame | null);
        });
    }

     /**
     * 根据ID获取技能图标资源
     * 封装getResource方法，专门用于获取技能图标
     * @param skillId 技能图标ID
     * @param callback 加载完成回调
     */
    getSkillIconById(skillId: string, callback: (spriteFrame: SpriteFrame | null) => void) {
        this.getResource(skillId, XGDY_ResourceType.SkillIcon, (res) => {
            callback(res as SpriteFrame | null);
        });
    }


    /**
     * 根据ID获取地图预制体
     * 封装getResource方法，专门用于获取地图预制体
     * @param mapId 地图ID
     * @param callback 加载完成回调
     */
    getMapPrefabById(mapId: string, callback: (prefab: Prefab | null) => void) {
        if(mapId == "地图_home"){
            callback(this.homeMapPrefab);
            return;
        }
        this.getResource(mapId, XGDY_ResourceType.MapPrefab, (res) => {
            callback(res as Prefab | null);
        });
    }

    /**
     * 根据ID获取角色预制体
     * 封装getResource方法，专门用于获取角色预制体
     * @param anglerId anglerID
     * @param callback 加载完成回调
     */
    getAnglerPrefabById(anglerId: string, callback: (prefab: Prefab | null) => void) {
        // let cacheKey = this.generateCacheKey("钓友_0", XGDY_ResourceType.AnglerPrefab)
        // this.resourceCache[cacheKey] = null

        // this.getResource("钓友_0", XGDY_ResourceType.AnglerPrefab, (res) => {
        //     callback(res as Prefab | null);
        // });

        callback(this.anglerPrefab);
    }

    /**
     * 根据ID获取鱼预制体
     * 封装getResource方法，专门用于获取鱼预制体
     * @param fishId 鱼ID
     * @param callback 加载完成回调
     */
    getFishPrefabById(fishId: string, callback: (prefab: Prefab | null) => void) {
        this.getResource(fishId, XGDY_ResourceType.FishPrefab, (res) => {
            callback(res as Prefab | null);
        });
    }

    /**
     * 释放指定资源
     * @param resourceId 资源ID
     * @param type 资源类型
     */
    releaseResource(resourceId: string, type: XGDY_ResourceType) {
        const cacheKey = this.generateCacheKey(resourceId, type);
        if (this.resourceCache[cacheKey]) {
            // 释放资源引用
            delete this.resourceCache[cacheKey];
            // 可以在这里添加实际的资源释放逻辑
            // 例如: resources.release(this.getResourceInfo(type, resourceId).path);
        }
    }

    /**
     * 释放所有缓存的资源
     * 用于场景切换或内存紧张时
     */
    releaseAllResources() {
        this.resourceCache = {};  // 清空缓存
       BundleManager.GetBundle('54_DH').releaseAll();  // 释放所有已加载资源
    }
}