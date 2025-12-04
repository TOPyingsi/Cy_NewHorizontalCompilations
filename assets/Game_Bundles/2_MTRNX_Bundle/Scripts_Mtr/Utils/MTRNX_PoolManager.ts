import { _decorator, Prefab, Node, instantiate, NodePool, Vec3, resources } from "cc";

import { BundleManager } from "../../../../Scripts/Framework/Managers/BundleManager";
import MTRNX_Singleton from "./MTRNX_Singleton";
const { ccclass, property } = _decorator;

@ccclass("MTRNX_PoolManager")
export class MTRNX_PoolManager extends MTRNX_Singleton {

    private static _instance: MTRNX_PoolManager = null;
    public static get Instance() {
        if (!this._instance) {
            this._instance = new MTRNX_PoolManager();
        }
        return this._instance;
    }

    private _dictPool: any = {}
    private _dictPrefab: any = {}
    private static PoolDict: any = {};
    private static PrefabDict: any = {};

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

    /**
    * 向对象池里生成固定数量的 Node
    */
    public static GenerateNodesToPool(path: string, count: number) {
        const segments = path.split(`/`);
        let name = segments[segments.length - 1];

        BundleManager.GetBundle("0_XGTW").load(path, (err: any, prefab: Prefab) => {
            if (err) {
                console.error(`Prefab 加载失败：${path}`);
                return;
            }

            this.PrefabDict[name] = prefab;

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
        });
    }

    /**
     * 对象池中获取对应节点
     */
    public static GetNode(path: string, parent: Node, position: Vec3 = Vec3.ZERO): Promise<Node> {
        const segments = path.split(`/`);
        let name = segments[segments.length - 1];

        const GetNodeFunc = (prefab): Node => {
            let node: Node = null;

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

            node.active = true;
            node.setParent(parent);
            if (position != Vec3.ZERO) {
                node.setWorldPosition(position);
            } else {
                node.setPosition(Vec3.ZERO);
            }
            return node;
        }

        return new Promise((resolve, reject) => {
            if (!this.PrefabDict.hasOwnProperty(name)) {
                BundleManager.GetBundle("0_XGTW").load(path, (err: any, prefab: Prefab) => {
                    if (err) {
                        console.error(`Prefab 加载失败：${path}`);
                        reject && reject();
                        return;
                    }

                    this.PrefabDict[name] = prefab;
                    resolve && resolve(GetNodeFunc(prefab));
                })
            } else {
                resolve && resolve(GetNodeFunc(this.PrefabDict[name]));
            }
        });
    }

    /**
    * 根据预设从对象池中获取对应节点
    */
    public static GetNodeByPrefab(prefab: Prefab, parent: Node) {
        let name = prefab.name;
        this.PrefabDict[name] = prefab;
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
    public static PutNode(node: Node) {
        if (!node) return;

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
    public static ClearPool(name: string) {
        if (this.PoolDict.hasOwnProperty(name)) {
            let pool = this.PoolDict[name];
            pool.clear();
        }
    }
}
