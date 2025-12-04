import { _decorator, Component, Node, Prefab, instantiate, math, RigidBody, Vec3, Collider, geometry } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { HXTJB_GameEvents } from '../Common/HXTJB_GameEvents';
import { HXTJB_DataManager } from '../Manager/HXTJB_DataManager';
const { ccclass, property } = _decorator;
const { AABB } = geometry;

@ccclass('HXTJB_CoinRainManager')
export class HXTJB_CoinRainManager extends Component {
    // 金币预制体
    @property({ type: Prefab, tooltip: "金币预制体，需要包含刚体和碰撞体组件" })
    coinPrefab: Prefab = null;

    // 金币生成区域(包含碰撞体的节点)
    @property({ type: Node, tooltip: "金币生成的区域，使用包含碰撞体组件的节点" })
    spawnArea: Node = null;

    @property(Node)
    coinLayerNode: Node = null;

    // 金币雨密度(每秒钟生成的金币数量)
    // @property({ type: Number, default: 20, tooltip: "每秒生成的金币数量" })
    spawnDensity: number = 20;

    // 金币雨持续时间(秒)
    // @property({ type: Number, default: 5, tooltip: "金币雨持续时间(秒)" })
    rainDuration: number = 5;

    // 金币最大延迟掉落时间(秒)
    // @property({ type: Number, default: 5, tooltip: "金币最大延迟掉落时间(秒)" })
    maxDelayTime: number = 5;

    private isRaining: boolean = false;
    private spawnInterval: number = 0;
    private elapsedTime: number = 0;
    private spawnTimer: number = 0;
    // 缓存碰撞体引用
    private spawnCollider: Collider = null;
    // AABB边界对象
    private aabb: Readonly<geometry.AABB>= null;
    // 存储最小和最大边界点
    private minPos: Vec3 = new Vec3();
    private maxPos: Vec3 = new Vec3();

    protected onLoad(): void {
        this.registerEvents();
    }

    start() {
        // 计算生成间隔
        this.spawnInterval = 1 / this.spawnDensity;
        
        // 获取碰撞体组件
        if (this.spawnArea) {
            this.spawnCollider = this.spawnArea.getComponent(Collider);
            if (!this.spawnCollider) {
                console.warn("生成区域节点没有碰撞体组件，将无法正确生成金币");
            }
        }
    }

    update(deltaTime: number) {
        if (!HXTJB_DataManager.Instance.isRaining) return;

        this.elapsedTime += deltaTime;
        this.spawnTimer += deltaTime;

        // 检查金币雨是否结束
        if (this.elapsedTime >= this.rainDuration) {
            this.stopRain();
            return;
        }

        // 按照密度生成金币
        while (this.spawnTimer >= this.spawnInterval) {
            this.spawnCoin();
            this.spawnTimer -= this.spawnInterval;
        }
    }

    /** 开始金币雨 */
    startRain() {
        if (HXTJB_DataManager.Instance.isRaining) return;
        
        // 验证必要组件
        if (!this.spawnCollider && this.spawnArea) {
            this.spawnCollider = this.spawnArea.getComponent(Collider);
        }
        
        HXTJB_DataManager.Instance.isRaining = true;
        this.elapsedTime = 0;
        this.spawnTimer = 0;
        console.log("开始金币雨");
    }

    /** 停止金币雨 */
    stopRain() {
        HXTJB_DataManager.Instance.isRaining = false;
        console.log("金币雨结束");
    }

    /** 在随机位置生成金币 */
    private spawnCoin() {
        if (!this.coinPrefab || !this.spawnArea || !this.spawnCollider) {
            console.error("金币预制体、生成区域或生成区域的碰撞体未设置");
            return;
        }

        // 实例化金币
        const coin = instantiate(this.coinPrefab);
        this.coinLayerNode.addChild(coin);

        // 获取碰撞体的世界AABB边界
        this.aabb =  this.spawnCollider.worldBounds;
        // 使用AABB的getBoundary方法获取最小和最大点
        this.aabb.getBoundary(this.minPos, this.maxPos);
        
        // 在AABB范围内随机生成位置
        const randomX = math.randomRange(this.minPos.x, this.maxPos.x);
        const randomY = math.randomRange(this.minPos.y, this.maxPos.y);
        const randomZ = math.randomRange(this.minPos.z, this.maxPos.z);

        // 设置金币位置
        coin.worldPosition = new Vec3(randomX, randomY, randomZ);

        // 随机延迟掉落(0到maxDelayTime之间)
        const delay = math.randomRange(0, this.maxDelayTime);
        const rigidBody = coin.getComponent(RigidBody);
        
        if (rigidBody) {
            // 先禁用刚体，延迟后再启用使其掉落
            rigidBody.enabled = false;
            setTimeout(() => {
                if (rigidBody.isValid) {
                    rigidBody.enabled = true;
                }
            }, delay * 1000);
        }
    }


      // 注册事件监听
    registerEvents() {
        EventManager.on(HXTJB_GameEvents.START_RAIN, this.startRain, this);
        
    }
    // 注销事件监听
    unregisterEvents() {
        EventManager.off(HXTJB_GameEvents.START_RAIN, this.startRain, this);
    }

    onDestroy() {
        this.unregisterEvents();
    }
}
