import { _decorator, Component, instantiate, Node, NodePool, Prefab, Vec3 } from 'cc';
import { HJMWK_HarmText } from './HJMWK_HarmText';
const { ccclass, property } = _decorator;

@ccclass('HJMWK_PoolManager')
export class HJMWK_PoolManager extends Component {
    public static Instance: HJMWK_PoolManager = null;

    @property(Node)
    HarmParent: Node = null;

    @property(Node)
    CubeParent: Node = null;

    @property(Prefab)
    HarmPrefab: Prefab = null;

    protected onLoad(): void {
        HJMWK_PoolManager.Instance = this;

        this.preload(this.HarmPrefab, 100);
    }

    protected onDisable(): void {
        this.ClearAllPool();
    }

    addHarm(worldPos: Vec3, harm: number) {
        const node: Node = this.GetNodeByPrefab(this.HarmPrefab, this.node)
        node.getComponent(HJMWK_HarmText).show(worldPos, harm);
    }

    //------------------------------------------- 

    private PoolDict: any = {};

    preload(prefab: Prefab, count: number) {
        const name: string = prefab.name;
        //已有对应的对象池
        if (this.PoolDict.hasOwnProperty(name)) {
            let pool = this.PoolDict[name];
            if (pool.size() < count) {
                let length = count - pool.size();
                for (let i = 0; i < length; i++)pool.put(instantiate(prefab));
                console.log(`对象池已有：${name}    新添加数量：${length}`);
            }
        } else {
            this.PoolDict[name] = new NodePool();
            for (let i = 0; i < count; i++) this.PoolDict[name].put(instantiate(prefab));
            console.log(`对象池添加：${name}    添加数量：${count}`);
        }
    }

    /**
* 根据预设从对象池中获取对应节点
*/
    public GetNodeByPrefab(prefab: Prefab, parent: Node): Node {
        let name = prefab.name;
        let node = null;
        if (this.PoolDict.hasOwnProperty(name)) {
            //已有对应的对象池
            let pool = this.PoolDict[name];
            if (pool.size() > 0) {
                node = pool.get();
            } else {
                node = instantiate(prefab);
            }
        } else {
            //没有对应对象池，创建他！
            this.PoolDict[name] = new NodePool();
            node = instantiate(prefab);
        }

        node.parent = parent;
        node.position = Vec3.ZERO;
        node.active = true;

        return node;
    }

    /**
     * 将对应节点放回对象池中
     */
    public PutNode(node: Node) {
        if (!node) return;
        node.removeFromParent();
        let name = node.name;
        let pool = null;
        if (this.PoolDict.hasOwnProperty(name)) {
            pool = this.PoolDict[name];
        } else {
            pool = new NodePool();
            this.PoolDict[name] = pool;
        }

        pool.put(node);
    }

    /**
     * 根据名称，清除对应对象池
     */
    public ClearPool(name: string) {
        if (this.PoolDict.hasOwnProperty(name)) {
            let pool = this.PoolDict[name];
            pool.clear();
        }
    }

    public ClearAllPool() {
        for (const key in this.PoolDict) {
            if (this.PoolDict.hasOwnProperty(key)) {
                const pool = this.PoolDict[key];
                pool.clear();
            }
        }
    }


}


