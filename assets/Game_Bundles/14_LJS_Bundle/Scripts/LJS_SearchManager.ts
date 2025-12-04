import { _decorator, Component, EditBox, find, Node } from 'cc';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('LJS_SearchManager')
export class LJS_SearchManager extends Component {

    @property(EditBox) // 绑定输入框
    searchInput: EditBox | null = null;

    @property(Node) // 绑定根节点（需要搜索的节点）
    rootNode: Node | null = null;

    // 用于保存节点的原始层级
    private originalIndices: Map<Node, number> = new Map();

    protected onLoad(): void {
        ProjectEventManager.emit(ProjectEvent.游戏开始, "炼金术");
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, find("Canvas/更多游戏"));
    }


    update(deltaTime: number) {
        this.onSearch();
    }


    // 保存所有节点的原始层级

    // 触发搜索
    onSearch() {

        const keyword = this.searchInput?.string.trim(); // 获取搜索关键字
        if (!keyword) {
            for (let i = 0; i < this.rootNode.children.length; i++) {
                this.rootNode.children[i].active = true;

            }
            return;
        }

        if (!this.rootNode) return;

        // 遍历所有子节点
        this.rootNode.children.forEach(child => {
            if (child.name.includes(keyword)) { // 模糊匹配节点名称
                child.active = true;
            } else {
                child.active = false;
            }
        });

    }



}


