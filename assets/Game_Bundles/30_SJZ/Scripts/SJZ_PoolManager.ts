import { _decorator, Component, director, instantiate, Node, NodePool, Prefab, Vec3 } from 'cc';

export class SJZ_PoolManager {
    private static _instance: SJZ_PoolManager;

    private _pools: Map<string, NodePool> = new Map(); // 对象池存储
    private _prefabs: Map<string, Prefab> = new Map(); // 预制体资源存储

    public static get Instance(): SJZ_PoolManager {
        if (!this._instance) {
            this._instance = new SJZ_PoolManager();
        }
        return this._instance;
    }

    /**
     * 预加载预制体到对象池
     * @param prefab 预制体
     * @param count 预加载数量
     * @param poolName 自定义池名称（可选）
     */
    Preload(prefab: Prefab, count: number) {
        const name = prefab.name;
        if (!this._prefabs.has(name)) {
            this._prefabs.set(name, prefab);
        }

        if (!this._pools.has(name)) {
            this._pools.set(name, new NodePool());
        }

        if (this._pools.get(name).size() < count) {
            for (let i = 0; i < count - this._pools.get(name).size(); i++) {
                const node = instantiate(prefab);
                node.active = false;
                this._pools.get(name)?.put(node);
            }
        }


    }

    /**
     * 从对象池获取对象
     * @param prefabOrName 预制体或名称
     * @param parent 父节点（可选）
     */
    Get(prefabOrName: Prefab | string, parent?: Node, position?: Vec3): Node | null {
        const name = typeof prefabOrName === 'string' ? prefabOrName : prefabOrName.name;
        let pool = this._pools.get(name);

        if (!pool) {
            if (this._prefabs.has(name)) {
                pool = new NodePool();
                this._pools.set(name, pool);
            } else {
                console.error(`Pool ${name} not found!`);
                return null;
            }
        }

        // 查找可用对象
        let node = pool.get();

        if (!node || !node.isValid) {
            const prefab = this._prefabs.get(name);
            node = instantiate(prefab);
        }

        if (node) {
            node.active = true;
            if (parent) {
                node.parent = parent;
            }

            if (position) {
                node.setPosition(position);
            }

            // 发送对象激活事件
            node.emit('object-activated');
        } else {

        }

        return node || null;
    }

    /**
     * 回收对象到池中
     * @param node 需要回收的节点
     */
    Put(node: Node) {
        const name = node.name;
        node.removeFromParent();

        // 发送对象回收事件
        node.emit('object-recycled');

        if (this._pools.has(name)) {
            this._pools.get(name)?.put(node);
        } else {
            console.warn(`没有这个对象池：${name}`);
            node.destroy();
        }
    }

    /**
     * 清理指定对象池
     * @param poolName 池名称
     */
    CleanPool(poolName: string) {
        const pool = this._pools.get(poolName);
        if (pool) {
            pool.clear();
            this._pools.delete(poolName);
            this._prefabs.delete(poolName);
        }
    }

    /**
     * 清理所有对象池
     */
    CleanAllPools() {
        this._pools.forEach((pool, name) => {
            pool.clear();
            this._pools.delete(name);
            this._prefabs.delete(name);
        });
    }
}