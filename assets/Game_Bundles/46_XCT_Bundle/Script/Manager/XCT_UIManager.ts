import { Component, _decorator, instantiate, Node, Prefab, Widget } from "cc";
import { XCT_BasePanel, XCT_PanelAnimation } from "../Common/XCT_BasePanel";
import { BundleManager } from "db://assets/Scripts/Framework/Managers/BundleManager";
import { GameManager } from "db://assets/Scripts/GameManager";
import { XCT_UILayer } from "../Common/XCT_UILayer";
const { ccclass, property } = _decorator;


@ccclass('XCT_UIManager')
export class XCT_UIManager extends Component {
    public static Instance: XCT_UIManager;

    @property(Node)
    private uiRoot: Node = null;

    @property(Prefab)
    private commonUIPrefab: Prefab[] = [];

    private uiPrefabMap: Map<string, Prefab>;  // 存储已创建的UI节点
    private uiNodeMap: Map<string, Node>;  // 存储已创建的UI节点

    onLoad() {
        // 确保单例
        XCT_UIManager.Instance = this;
        this.uiPrefabMap = new Map();
        this.uiNodeMap = new Map();
        // this.uiRoot = this.node;

        for (let prefab of this.commonUIPrefab) {
            let uiName = prefab.name;
            this.uiPrefabMap.set(uiName, prefab);
        }
    }

    // init(uiLayer:Node){
    //     this.uiPrefabMap = new Map();
    //     this.uiNodeMap = new Map();
    //     this.uiRoot = uiLayer;
    // }

    // setStartUI(startUINode:Node){
    //     this.uiNodeMap.set(startUINode.name, startUINode);
    //     let panelClass:XCT_BasePanel = startUINode.getComponent(XCT_BasePanel);
    //     panelClass?.show();
    //     startUINode.active = true;
    // }


    // 显示UI
    showPanel(uiPath: string, data?: any, onComplete?: (uiNode?: Node) => void, animationType?: XCT_PanelAnimation, uiLayer?: XCT_UILayer) {
        // console.log("显示UI",uiName);
        let uiName = uiPath.split("/")[uiPath.split("/").length - 1];
        while (this.uiNodeMap.has(uiName)) {
            const uiNode = this.uiNodeMap.get(uiName)!;
            this.uiNodeMap.delete(uiName);
            uiNode.destroy();
        }
        let createNode = (uiPrefab: Prefab) => {
            const uiNode = instantiate(uiPrefab);
            this.uiNodeMap.set(uiName, uiNode);
            let panelClass: XCT_BasePanel = uiNode.getComponent(XCT_BasePanel);
            let layerName: XCT_UILayer = uiLayer || panelClass?.defaultLayer;
            this.uiRoot.getChildByName(layerName).addChild(uiNode);
            let widget = uiNode.getComponent(Widget);
            if (widget) {
                widget.enabled = true;
                widget.updateAlignment();
            }
            widget.enabled = false;
            panelClass?.show(data, animationType);
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
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `UI/${uiPath}`).then((prefab: Prefab) => {
            this.uiPrefabMap.set(uiName, prefab);
            createNode(prefab);
        });
    }

    // 隐藏UI
    hidePanel(uiPath: string, onComplete?: (uiNode?: Node) => void, animationType?: XCT_PanelAnimation) {
        // console.log("隐藏UI",uiName);
        let uiName = uiPath.split("/")[uiPath.split("/").length - 1];
        let isHasNode: boolean = false;
        while (this.uiNodeMap.has(uiName)) {
            const uiNode = this.uiNodeMap.get(uiName)!;
            if (!isHasNode) {
                let panelClass: XCT_BasePanel = uiNode.getComponent(XCT_BasePanel);
                panelClass?.hide(() => {
                    this.uiNodeMap.delete(uiName);
                    uiNode.destroy();
                    onComplete && onComplete(uiNode);
                }, animationType);
                isHasNode = true;
            }

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