import { director, instantiate, Node, Prefab } from "cc";
import { GeometryVibes_BasePanel } from "../Common/GeometryVibes_BasePanel";
import { BundleManager } from "db://assets/Scripts/Framework/Managers/BundleManager";
import { GameManager } from "db://assets/Scripts/GameManager";


export class GeometryVibes_UIManager {
    private static instance: GeometryVibes_UIManager;
    private uiPrefabMap: Map<string, Prefab>;  // 存储已创建的UI节点
    private uiNodeMap: Map<string, Node>;  // 存储已创建的UI节点

    private uiLayer: Node;            // UI层节点
    
    private constructor() {
        // this.uiMap = new Map();
        // // 创建UI层
        // this.uiLayer = new Node("UILayer");
        // //console.log("创建UI层成功");

        // director.getScene().getChildByName("Canvas").addChild(this.uiLayer);
    }
    
    public static getInstance(): GeometryVibes_UIManager {
        if (!GeometryVibes_UIManager.instance) {
            GeometryVibes_UIManager.instance = new GeometryVibes_UIManager();
        }
        return GeometryVibes_UIManager.instance;
    }

    init(uiLayer:Node){
        this.uiPrefabMap = new Map();
        this.uiNodeMap = new Map();
        this.uiLayer = uiLayer;
    }

    setStartUI(startUINode:Node){
        this.uiNodeMap.set(startUINode.name, startUINode);
        let panelClass:GeometryVibes_BasePanel = startUINode.getComponent(GeometryVibes_BasePanel);
        panelClass?.show();
        startUINode.active = true;
    }

    
    // 显示UI
    showUI(uiName: string, onComplete?: (uiNode?: Node) => void) {
            // console.log("显示UI",uiName);
            while (this.uiNodeMap.has(uiName)) {
                const uiNode = this.uiNodeMap.get(uiName)!;
                this.uiNodeMap.delete(uiName);
                uiNode.destroy();
                return;
            }
            let createNode=(uiPrefab)=>{
                const uiNode = instantiate(uiPrefab);
                this.uiLayer.addChild(uiNode);
                this.uiNodeMap.set(uiName, uiNode);
                let panelClass:GeometryVibes_BasePanel = uiNode.getComponent(GeometryVibes_BasePanel);
                panelClass?.show();
                onComplete && onComplete(uiNode);
            }

        // 如果UI已存在，直接显示
        if (this.uiPrefabMap.has(uiName)) {
            //console.log("已有ui预制体",uiName);
            const uiPrefab = this.uiPrefabMap.get(uiName)!;
            createNode(uiPrefab);
            return;
        }
        
        // 加载并创建UI预制体
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `UI/${uiName}`).then((prefab: Prefab) => {
            this.uiPrefabMap.set(uiName, prefab);
            createNode(prefab);
        });
    }
    
    // 隐藏UI
    hideUI(uiName: string) {
        // console.log("隐藏UI",uiName);
        let isHasNode:boolean = false;
        while (this.uiNodeMap.has(uiName)) {
            const uiNode = this.uiNodeMap.get(uiName)!;
            if(!isHasNode){
                let panelClass:GeometryVibes_BasePanel = uiNode.getComponent(uiName) as GeometryVibes_BasePanel;
                panelClass?.hide();
                isHasNode = true;
            }
            this.uiNodeMap.delete(uiName);
            uiNode.destroy();
            return;
        }
    }
    
    // 隐藏所有UI
    hideAllUI() {
        // console.log("隐藏所有开始————————————")

        this.uiNodeMap.forEach((uiNode) => {
            // console.log("隐藏UI",uiNode.name);
            this.uiNodeMap.delete(uiNode.name);
            uiNode.destroy();
        });
        // console.log("隐藏所有结束————————————",this.uiNodeMap)
    }
    
    // 隐藏其他所有UI，只显示指定UI
    hideAllOtherUI(keepUIName: string) {
        // console.log("隐藏Other开始————————————")
        this.uiNodeMap.forEach((uiNode, uiName) => {
            if (uiName !== keepUIName) {
                // console.log("隐藏UI",uiNode.name);
                this.uiNodeMap.delete(uiNode.name);
                uiNode.destroy();
            }
        });
        // console.log("隐藏Other结束",this.uiNodeMap)
    }
    
    // 获取UI节点
    getUI(uiName: string): Node | null {
        return this.uiNodeMap.get(uiName) || null;
    }
}