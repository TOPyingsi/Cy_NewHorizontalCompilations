import { _decorator, Component, instantiate, Node, NodePool, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CDXX_PoolManager')
export class CDXX_PoolManager extends Component {
    public static Instance: CDXX_PoolManager = null;


    protected onLoad(): void {
        CDXX_PoolManager.Instance = this;
    }

    /** 存放所有对象池，key: PrefabName */
    private _poolMap: Map<string, NodePool> = new Map();

    /**
    * 预加载对象池
    * @param prefab 预制体
    * @param count 初始数量
    */
    preload(prefab: Prefab, count: number = 100) {
        const prefabName = prefab.name;
        if (!this._poolMap.has(prefabName)) {
            this._poolMap.set(prefabName, new NodePool());
        }

        for (let i: number = 0; i < count; i++) {
            let node: Node = instantiate(prefab);
            node.active = false;
            this._poolMap.get(prefabName)!.put(node);
        }
    }

    /**
    * 从对象池获取节点
    * @param prefab 预制体
    * @returns Node
    */
    get(prefab: Prefab): Node {
        const prefabName = prefab.name;
        if (!this._poolMap.has(prefabName)) {
            this._poolMap.set(prefabName, new NodePool());
        }

        let node: Node = null;
        if (this._poolMap.get(prefabName).size() > 0) {
            node = this._poolMap.get(prefabName)!.get();
        } else {
            node = instantiate(prefab);
        }
        node.active = true;
        return node;
    }


    /**
    * 回收节点到对象池
    * @param node 需要回收的节点
    */
    put(node: Node) {
        const nodeName = node.name;
        if (!this._poolMap.has(nodeName)) {
            this._poolMap.set(nodeName, new NodePool());
        }
        node.active = false;
        node.removeFromParent();
        this._poolMap.get(nodeName)!.put(node);
    }

    /**
    * 回收节点到对象池
    * @param prefab 对应的预制体
    * @param node 需要回收的节点
    */
    putByPrefab(prefab: Prefab, node: Node) {
        const prefabName = prefab.name;
        if (!this._poolMap.has(prefabName)) {
            this._poolMap.set(prefabName, new NodePool());
        }
        node.active = false;
        node.removeFromParent();
        this._poolMap.get(prefabName)!.put(node);
    }

    /**
     * 清理某个对象池
     * @param name 
     */
    clear(name: string) {
        if (this._poolMap.has(name)) {
            this._poolMap.get(name).clear();
            this._poolMap.delete(name);
        }
    }

    /**
     * 清空所有对象池
     */
    clearAll() {
        this._poolMap.forEach(e => {
            e.clear();
        })
        this._poolMap.clear();
    }
}


