import { _decorator, Prefab, Node, instantiate, NodePool, Vec3, Component } from "cc";
const { ccclass, property } = _decorator;

@ccclass("CPMS_PoolManager")
export class CPMS_PoolManager extends Component {

    private static _instance: CPMS_PoolManager = null;
    public static get Instance() {
        if (!this._instance) {
            this._instance = new CPMS_PoolManager();
        }
        return this._instance;
    }

    private _dictPool: any = {}
    private _dictPrefab: any = {}

    /**
    * 根据预设从对象池中获取对应节点
    */
    public GetNode(prefab: Prefab, parent: Node): Node {
        let name = prefab.name;
        //@ts-ignore
        if (!prefab.position) {
            //@ts-ignore
            name = prefab.data.name;
        }

        this._dictPrefab[name] = prefab;
        let node = null;
        if (this._dictPool.hasOwnProperty(name)) {
            //已有对应的对象池
            let pool = this._dictPool[name];
            if (pool.size() > 0) {
                node = pool.get();
            } else {
                node = instantiate(prefab);
            }
        } else {
            //没有对应对象池，创建他！
            let pool = new NodePool();
            this._dictPool[name] = pool;

            node = instantiate(prefab);
        }

        node.parent = parent;
        node.position = Vec3.ZERO;
        node.setScale(Vec3.ONE);
        node.active = true;

        return node;
    }

    /**
    * 将对应节点放回对象池中
    */
    public PutNode(node: Node) {
        if (!node) {
            return;
        }
        let name = node.name;
        let pool = null;
        if (this._dictPool.hasOwnProperty(name)) {
            //已有对应的对象池
            pool = this._dictPool[name];
        } else {
            //没有对应对象池，创建他！
            pool = new NodePool();
            this._dictPool[name] = pool;
        }

        pool.put(node);
    }

    /**
    * 根据名称，清除对应对象池
    */
    public ClearPool(name: string) {
        if (this._dictPool.hasOwnProperty(name)) {
            let pool = this._dictPool[name];
            pool.clear();
        }
    }
}
