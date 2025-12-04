import { _decorator, color, Color, Component, instantiate, Node, Prefab, Sprite, SpriteFrame, tween, Vec2, Vec3 } from 'cc';
import { NBSYS_TouchMonitor } from '../NBSYS_TouchMonitor';
import { NBSYS_GameManager } from '../NBSYS_GameManager';
import { NBSYS_GameData } from '../NBSYS_GameData';
import { NBSYS_Incident } from '../NBSYS_Incident';
const { ccclass, property } = _decorator;

@ccclass('NBSYS_SaoBei')
export class NBSYS_SaoBei extends NBSYS_TouchMonitor {
    public substance: string[] = [];//烧杯内的物质
    public environment: string[] = [];//烧杯的环境
    public liquid_capacity: number = 0;//液体容量，100上限

    //烧杯内添加物质
    Add(Name: string, worldpos: Vec3) {
        console.log(2);

        if (this.substance.indexOf(Name) == -1) {
            this.substance.push(Name);
        }

        if (NBSYS_GameData.GetData(Name)?.vessel == "勺子") {
            NBSYS_GameManager.Instance.InitParticle(Name, worldpos, 10, this.node.getChildByName("物质"));
        }
        if (NBSYS_GameData.GetData(Name)?.vessel == "滴管") {
            this.AddLiquid(Name);
        }
        if (NBSYS_GameData.GetData(Name)?.vessel == "夹子") {
            this.AddJiaPian(Name);
        }
        this.scheduleOnce(() => {
            this.Isreaction();
        }, 1)

    }

    //烧杯内添加液体
    AddLiquid(Name: string) {
        if (this.substance.indexOf(Name) == -1) {
            this.substance.push(Name);
        }
        if (this.liquid_capacity < 100) {
            this.liquid_capacity += 10;
            tween(this.node.getChildByName("试剂管液体").getComponent(Sprite))
                .to(0.5, { fillRange: this.liquid_capacity / 100 })
                .start();
        }
    }

    //烧杯内添加夹片
    AddJiaPian(Name: string) {
        if (this.substance.indexOf(Name) == -1) {
            this.substance.push(Name);
        }
        //添加夹片
        NBSYS_Incident.Loadprefab("PreFab/夹片").then((prefab: Prefab) => {
            NBSYS_Incident.LoadSprite("Sprits/勺子材料/" + Name).then((sp: SpriteFrame) => {
                let lz = instantiate(prefab);
                lz.setParent(this.node.getChildByName("物质"));
                lz.setWorldPosition(this.node.worldPosition.clone());
                lz.getComponent(Sprite).spriteFrame = sp;
            })
        })
    }


    //判断烧杯内的元素是否反应
    Isreaction() {
        NBSYS_GameData.Chemical_reaction.forEach((data) => {

            if (this.containsAllElements(this.substance, data.所需材料)) {
                if ((data.所需环境.length > 0)) {
                    if (this.containsAllElements(this.environment, data.所需环境)) {
                        console.log("反应咯" + data.反应);

                        this.React(data.反应);
                    }
                } else {
                    console.log("反应咯" + data.反应);
                    this.React(data.反应);
                }
            }
        })

    }

    containsAllElements(arr1: string[], arr2: string[]): boolean {
        // 遍历 arr2 中的每个元素
        for (const element of arr2) {
            // 如果 arr1 中不包含当前元素，返回 false
            if (!arr1.includes(element)) {
                return false;
            }
        }
        // 如果所有元素都存在于 arr1 中，返回 true
        return true;
    }


    //产生反应
    React(name: string) {
        switch (name) {
            case "碘水铝反应":
                this.Generate_bubble();
                this.ChanggeColor(new Color(124, 25, 250));
                this.Generate_Purple_flame();
                this.Generate_Smog();
                this.SubLiquid();
                break;
            case "碘水镁反应":
                this.Generate_bubble();
                this.Generate_Purple_flame();
                this.Generate_Smog();
                this.SubLiquid();
                break;
            case "硫酸铜反应":
                this.ChanggeColor(new Color(210, 255, 255), 3);
                break;
            case "生石灰与水反应":
                this.Generate_bubble();
                this.Generate_Smog();
                this.SubLiquid();
                break;
        }
        if (NBSYS_GameData.Template.find((dt) => { return dt.Name == NBSYS_GameManager.Instance.GameMode })?.Winner.indexOf(name) != -1) {
            NBSYS_GameManager.Instance.GameWinner();
        }
    }


    //烧杯内物质清空
    SubLiquid() {
        this.substance = [];
        this.liquid_capacity = 0;
        this.ChanggeColor(new Color(255, 255, 255));
        tween(this.node.getChildByName("试剂管液体").getComponent(Sprite))
            .to(4, { fillRange: 0 })
            .start();
        this.node.getChildByName("物质").children.forEach((cd, index) => {
            this.scheduleOnce(() => { cd.destroy(); }, index / 20);
        })
    }



    //反应——产生气泡
    Generate_bubble() {
        this.node.getChildByPath("特效/气泡特效").active = true;
        this.scheduleOnce(() => { this.node.getChildByPath("特效/气泡特效").active = false; }, 7)
    }
    //反应——液体变色
    ChanggeColor(cl: Color, Time: number = 0.5) {
        let sp = this.node.getChildByName("试剂管液体").getComponent(Sprite);
        const startColor = sp.color.clone(); // 当前颜色
        const endColor = cl;        // 目标颜色

        // 创建一个临时对象，存储 R、G、B 通道的值
        const tempColor = { r: startColor.r, g: startColor.g, b: startColor.b };

        // 使用 Tween 对 R、G、B 通道分别插值
        tween(tempColor)
            .to(1, { r: endColor.r, g: endColor.g, b: endColor.b }, {
                onUpdate: () => {
                    // 将插值后的 R、G、B 通道重新赋值给节点的颜色
                    sp.color = new Color(tempColor.r, tempColor.g, tempColor.b);
                },
                easing: 'linear' // 使用线性缓动
            })
            .start();
    }
    //反应——产生紫色火焰
    Generate_Purple_flame() {
        this.node.getChildByPath("特效/紫火燃烧特效").active = true;
        this.scheduleOnce(() => { this.node.getChildByPath("特效/紫火燃烧特效").active = false; }, 7)
    }
    //反应——烟雾特效
    Generate_Smog() {
        this.node.getChildByPath("特效/烟雾特效").active = true;
        this.scheduleOnce(() => { this.node.getChildByPath("特效/烟雾特效").active = false; }, 7)
    }
}


