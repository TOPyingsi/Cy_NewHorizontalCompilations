import { _decorator, AudioSource, Component, error, find, instantiate, Label, Node, Prefab, UITransform } from 'cc';
import { LJS_GameManager } from './LJS_GameManager';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
const { ccclass, property } = _decorator;

@ccclass('LSJ_WorkSpaceManager')
export class LSJ_WorkSpaceManager extends Component {
    @property(Prefab)
    elementPrefab: Prefab[] = [];
    private conestout: Node | null = null;
    private newelement: Node | null = null;
    private newesprite: Node | null = null;
    public static outputname: string = null;
    public static Instance: LSJ_WorkSpaceManager = null;

    protected onLoad(): void {
        LSJ_WorkSpaceManager.Instance = this;
    }


    public tryCombine(elementNode1: Node, elementNode2: Node) {
        const element1 = elementNode1.name;
        const element2 = elementNode2.name;

        const sortedInputs = [element1, element2].sort();

        const recipes = LJS_GameManager.getRecipes();
        const recipe = recipes.find(r =>
            (r.inputs[0] === sortedInputs[0] &&
                r.inputs[1] === sortedInputs[1]) || (r.inputs[1] === sortedInputs[0] &&
                    r.inputs[0] === sortedInputs[1])
        );
        if (recipe && !LJS_GameManager.getUnlockedElements().has(recipe.output)) {
            LJS_GameManager.unlockElement(recipe.output);
            LSJ_WorkSpaceManager.outputname = recipe.output;
            for (let i = 0; i < this.elementPrefab.length; i++) {
                if (recipe.output == this.elementPrefab[i].name) {

                    this.node.getComponent(AudioSource).play();
                    this.conestout = instantiate(this.elementPrefab[i]);
                    this.node.addChild(this.conestout);
                    this.conestout.setScale(2, 2, 1);
                    this.createsprite();
                    this.Encyclopediacreat();
                    this.Encyclopediacreat1();
                    this.createElement(elementNode1, elementNode2);


                }
            }
            // EncyclopediaManager.instance.unlockItem(recipe.output);
        }
    }

    createElement(elementNode1: Node, elementNode2: Node) {

        const element1 = elementNode1;
        const element2 = elementNode2;

        const path = "TempPrefabs/" + LSJ_WorkSpaceManager.outputname;
        BundleManager.LoadPrefab("14_LJS_Bundle", path).then((prefab: Prefab) => {
            this.newelement = instantiate(prefab);
            let x = 0;
            let y = 0;
            x = element1.worldPosition.x + (element1.worldPosition.x - element2.worldPosition.x) / 2;
            y = element1.worldPosition.y + (element1.worldPosition.y - element2.worldPosition.y) / 2;
            find("Canvas/BG/合成").addChild(this.newelement);
            this.newelement.setWorldPosition(x, y, 0);

            LSJ_WorkSpaceManager.outputname = null;
        });
    }
    createsprite() {


        const path = "ElementSprite/" + LSJ_WorkSpaceManager.outputname;
        BundleManager.LoadPrefab("14_LJS_Bundle", path).then((prefab: Prefab) => {
            if (find("Canvas/特效").children[4] != null) {
                find("Canvas/特效").children[4].destroy();
            }
            const spawnAreaPos = find("Canvas/特效/旋转").worldPosition;
            this.newesprite = instantiate(prefab);
            find("Canvas/特效").addChild(this.newesprite);
            this.newesprite.setWorldPosition(spawnAreaPos.x, spawnAreaPos.y, 0)
            this.newesprite.setScale(3, 3, 1);
            find("Canvas/特效/name").getComponent(Label).string = this.newesprite.name;
            this.NameChange();
            find("Canvas/特效").active = true;

        });

    }
    Onclick() {
        find("Canvas/特效").active = false;
        find("Canvas/特效").children[4].destroy();

    }
    Encyclopediacreat() {
        const path = "ElementSprite/" + LSJ_WorkSpaceManager.outputname;
        BundleManager.LoadPrefab("14_LJS_Bundle", path).then((prefab: Prefab) => {

            this.newesprite = instantiate(prefab);
            find("Canvas/分级图鉴/view/content").addChild(this.newesprite);
            this.newesprite.setScale(1, 1, 1);
        });
    }
    Encyclopediacreat1() {
        const path = "ElementSprite/" + LSJ_WorkSpaceManager.outputname;
        BundleManager.LoadPrefab("14_LJS_Bundle", path).then((prefab: Prefab) => {

            this.newesprite = instantiate(prefab);
            find("Canvas/图鉴/遮罩/最近解锁元素").addChild(this.newesprite);
            this.newesprite.setScale(2, 2, 1);
            find("Canvas/图鉴/图鉴按钮/解锁数量").getComponent(Label).string = find("Canvas/分级图鉴/view/content").children.length + "/830"
            this.newesprite.setSiblingIndex(0);
        });
    }
    NameChange() {
        if (find("Canvas/特效/name").getComponent(Label).string == "蒸汽") {
            find("Canvas/特效/描述").getComponent(Label).string = "无形的力量，推动机械的脉搏。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "间歇泉") {
            find("Canvas/特效/描述").getComponent(Label).string = "大地的呼吸，水与热的交响。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "薄雾") {
            find("Canvas/特效/描述").getComponent(Label).string = "朦胧的面纱，笼罩未知的世界。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "泥土") {
            find("Canvas/特效/描述").getComponent(Label).string = "生命的摇篮，孕育万物的根基。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "砖") {
            find("Canvas/特效/描述").getComponent(Label).string = "人造的石头，堆砌文明的基石。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "熔岩") {
            find("Canvas/特效/描述").getComponent(Label).string = "地心的怒火，流淌的毁灭与重生。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "火山") {
            find("Canvas/特效/描述").getComponent(Label).string = "自然的怒吼，喷发的力量与威严。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "黑曜石") {
            find("Canvas/特效/描述").getComponent(Label).string = "冰冷的火焰，锋利的黑暗之刃。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "石头") {
            find("Canvas/特效/描述").getComponent(Label).string = "时间的见证，沉默的永恒守护者。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "能量") {
            find("Canvas/特效/描述").getComponent(Label).string = "无形的动力，驱动宇宙的运转。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "热") {
            find("Canvas/特效/描述").getComponent(Label).string = "生命的温度，燃烧与转化的源泉。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "温暖") {
            find("Canvas/特效/描述").getComponent(Label).string = "温柔的触感，安抚心灵的火焰。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "金属") {
            find("Canvas/特效/描述").getComponent(Label).string = "坚硬的意志，锻造文明的利器。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "锈") {
            find("Canvas/特效/描述").getComponent(Label).string = "时间的痕迹，金属的衰老与记忆。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "锅炉") {
            find("Canvas/特效/描述").getComponent(Label).string = "蒸汽的心脏，压力与热量的熔炉。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "压力") {
            find("Canvas/特效/描述").getComponent(Label).string = "无形的束缚，推动变革的力量。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "花岗岩") {
            find("Canvas/特效/描述").getComponent(Label).string = "大地的骨骼，坚不可摧的意志。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "灰尘") {
            find("Canvas/特效/描述").getComponent(Label).string = "微小的碎片，时间的无声沉淀。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "地震") {
            find("Canvas/特效/描述").getComponent(Label).string = "大地的颤抖，毁灭与重建的序曲。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "风") {
            find("Canvas/特效/描述").getComponent(Label).string = "无形的行者，吹散尘埃与迷雾。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "火药") {
            find("Canvas/特效/描述").getComponent(Label).string = "爆发的种子，改变历史的火花。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "爆炸") {
            find("Canvas/特效/描述").getComponent(Label).string = "瞬间的释放，力量与毁灭的交汇。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "等离子") {
            find("Canvas/特效/描述").getComponent(Label).string = "炽热的第四态，能量与光的化身。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "水坑") {
            find("Canvas/特效/描述").getComponent(Label).string = "雨后的镜子，映照天空的碎片。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "喷发") {
            find("Canvas/特效/描述").getComponent(Label).string = "力量的宣泄，自然的不屈怒吼。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "龙卷风") {
            find("Canvas/特效/描述").getComponent(Label).string = "旋转的巨兽，吞噬一切的狂舞。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "沙子") {
            find("Canvas/特效/描述").getComponent(Label).string = "时间的颗粒，流动的微小世界。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "沙滩") {
            find("Canvas/特效/描述").getComponent(Label).string = "海洋的边缘，波浪与陆地的邂逅。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "砂岩") {
            find("Canvas/特效/描述").getComponent(Label).string = "风化的故事，层层叠叠的记忆。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "玻璃") {
            find("Canvas/特效/描述").getComponent(Label).string = "透明的屏障，脆弱与坚韧的融合。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "沙漏") {
            find("Canvas/特效/描述").getComponent(Label).string = "时间的象征，流逝与永恒的循环。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "水族馆") {
            find("Canvas/特效/描述").getComponent(Label).string = "水的囚笼，生命的微缩宇宙。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "子弹") {
            find("Canvas/特效/描述").getComponent(Label).string = "速度的杀手，穿透寂静的瞬间。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "枪") {
            find("Canvas/特效/描述").getComponent(Label).string = "力量的延伸，征服与防御的工具。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "电击枪") {
            find("Canvas/特效/描述").getComponent(Label).string = "电流的鞭挞，瞬间的制服之力。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "粘土") {
            find("Canvas/特效/描述").getComponent(Label).string = "可塑的灵魂，艺术与实用的起点。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "刀片") {
            find("Canvas/特效/描述").getComponent(Label).string = "锋利的边缘，切割与分离的利器。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "武士刀") {
            find("Canvas/特效/描述").getComponent(Label).string = "东方的灵魂，优雅与致命的结合。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "剑") {
            find("Canvas/特效/描述").getComponent(Label).string = "权力的象征，荣耀与战争的化身。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "烟") {
            find("Canvas/特效/描述").getComponent(Label).string = "燃烧的余烬，消散的短暂存在。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "烟囱") {
            find("Canvas/特效/描述").getComponent(Label).string = "工业的呼吸，黑烟与蒸汽的出口。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "沙漠") {
            find("Canvas/特效/描述").getComponent(Label).string = "干渴的海洋，无尽的金色荒原。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "原子弹") {
            find("Canvas/特效/描述").getComponent(Label).string = "人类的恐惧，毁灭与威慑的象征。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "刺刀") {
            find("Canvas/特效/描述").getComponent(Label).string = "枪口的延伸，近战的冷酷工具。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "沙丘") {
            find("Canvas/特效/描述").getComponent(Label).string = "风的雕塑，流动的沙漠之浪。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "眼镜") {
            find("Canvas/特效/描述").getComponent(Label).string = "视界的桥梁，清晰与模糊的分界。";
        } else if (find("Canvas/特效/name").getComponent(Label).string == "手榴弹") {
            find("Canvas/特效/描述").getComponent(Label).string = "投掷的毁灭，瞬间的爆炸之力。";
        }
    }
}


