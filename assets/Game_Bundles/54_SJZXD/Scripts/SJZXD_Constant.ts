import { _decorator, Component, Node, v3, Vec3 } from 'cc';
import { SJZXD_GameData } from './SJZXD_GameData';
const { ccclass, property } = _decorator;

export enum SJZXD_Quality {
    白色 = 0,
    绿色 = 1,
    蓝色 = 2,
    紫色 = 3,
    金色 = 4,
    红色 = 5,
    炫彩 = 6
}

export enum SJZXD_PropType {
    回收物 = 0,
    武器 = 1,
    头盔 = 2,
    防具 = 3,

}

export interface SJZXD_PropDataItem {
    Name: string;
    price: number;
    quality: SJZXD_Quality;
    weight: number;
    type: SJZXD_PropType;
    description: string; // 添加描述字段
    property: number; // 添加属性值字段
}

export interface SJZXD_WeaponItem {
    Name: string, 武器类型: string, 射速: number, 换弹时间: number, 弹夹容量: number, 开枪音效: string
}


@ccclass('SJZXD_Constant')
export class SJZXD_Constant {
    public static SceneData: { Name: string, PlayerStartPos: Vec3, 场景爆率: number }[] = [
        { Name: "荒野营地", PlayerStartPos: v3(-1200, -1300, 0), 场景爆率: 5 },
        { Name: "沙漠遗迹", PlayerStartPos: v3(-1000, -1700, 0), 场景爆率: 15 },
        { Name: "修狗小镇", PlayerStartPos: v3(1300, 0, 0), 场景爆率: 25 },
        { Name: "军事基地", PlayerStartPos: v3(-1500, -1450, 0), 场景爆率: 35 },
        { Name: "实验室", PlayerStartPos: v3(-1550, -1850, 0), 场景爆率: 50 },
    ]
    //通过名字返回场景数据
    public static GetSceneDataByName(Name: string): { Name: string, PlayerStartPos: Vec3, 场景爆率: number } {
        for (let i = 0; i < SJZXD_Constant.SceneData.length; i++) {
            if (SJZXD_Constant.SceneData[i].Name == Name) {
                return SJZXD_Constant.SceneData[i];
            }
        }
        return null;
    }

    public static Group = {
        Unit: 1 << 1,
        Enemy: 1 << 2,
        Bullet: 1 << 3,
        Obstacle: 1 << 4,
        Interact: 1 << 5,
    }
    public static Panel = {
        WarehousePanel: "Panel/WarehousePanel",
        BazaarPanel: "Panel/BazaarPanel",
        SkinPanel: "Panel/SkinPanel",
        LoadingPanel: "Panel/LoadingPanel",//加载界面
        PropMessagePanel: "Panel/PropMessagePanel",//道具信息界面1
        PropMessagePanel2: "Panel/PropMessagePanel2",//道具信息界面2
        ReceiveAwardPanel: "Panel/ReceiveAwardPanel",//领取奖励界面
        GetCashPanel: "Panel/GetCashPanel",//获得200w现金界面
        RolePanel: "Panel/RolePanel",//角色界面
        BoxroomUpPanel: "Panel/BoxroomUpPanel",//收藏品升级界面
        KnapsackPanel: "Panel/KnapsackPanel",//背包界面
        SafeBoxPanel: "Panel/SafeBoxPanel",//保险箱界面
        SelectScenePanel: "Panel/SelectScenePanel",//选关界面
        SettleAccountsPanel: "Panel/SettleAccountsPanel",//结算界面
        GraduateSchoolPanel: "Panel/GraduateSchoolPanel",//研究所界面
        EvacuatePanel: "Panel/EvacuatePanel",//撤离卡界面
        AddknapsackCapacityPanel: "Panel/AddknapsackCapacityPanel",//拓展背包界面
        AdvanceEvacuatePanel: "Panel/AdvanceEvacuatePanel",//提前撤离界面(退出)
        DeadPanel: "Panel/DeadPanel",//死亡复活界面
        EnhancePanel: "Panel/EnhancePanel",//增强针界面
        SmallMapPanel: "Panel/SmallMapPanel",//地图界面
        CoursePanel: "Panel/CoursePanel",//教程界面
        UpdatePanel: "Panel/UpdatePanel",//更新公告界面
        CheatPanel: "Panel/CheatPanel"//作弊界面

    }
    public static QuaLityList: string[] = ["白色", "绿色", "蓝色", "紫色", "金色", "红色", "炫彩"];

    public static Maxproperty: number[] = [1000, 2000, 1000];//攻击，生命，防御的装备最大增加值
    public static AgenMaxproperty: number[] = [500, 1000, 500];//干员的最大增加值
    //#region Prop数据以及访问方法

    public static PropData: SJZXD_PropDataItem[] = [
        { Name: "电池", price: 1000, quality: SJZXD_Quality.白色, weight: 2, type: SJZXD_PropType.回收物, description: "一枚普通的干电池，电力已部分耗尽，但仍可应急使用。", property: 0 },
        { Name: "书", price: 1400, quality: SJZXD_Quality.白色, weight: 2, type: SJZXD_PropType.回收物, description: "一本封面磨损的旧书，内页略有泛黄，记录着寻常的故事或知识。", property: 0 },
        { Name: "盒装蜡烛", price: 2000, quality: SJZXD_Quality.白色, weight: 4, type: SJZXD_PropType.回收物, description: "一盒未拆封的白色蜡烛，在断电时可提供稳定的光源。", property: 0 },
        { Name: "兔子玩具", price: 2000, quality: SJZXD_Quality.白色, weight: 2, type: SJZXD_PropType.回收物, description: "一只绒毛略微起球的兔子玩偶，似乎曾是被精心陪伴的旧物。", property: 0 },
        { Name: "太阳碟", price: 3000, quality: SJZXD_Quality.绿色, weight: 2, type: SJZXD_PropType.回收物, description: "一个表面有同心圆刻痕的金属圆盘，在阳光下会反射出独特的光晕。", property: 0 },
        { Name: "音响", price: 3500, quality: SJZXD_Quality.绿色, weight: 3, type: SJZXD_PropType.回收物, description: "一台便携式音响，外观有轻微划痕，但播放功能完好。", property: 0 },
        { Name: "铜币", price: 3100, quality: SJZXD_Quality.绿色, weight: 1, type: SJZXD_PropType.回收物, description: "一枚氧化发暗的古铜币，上面的图案模糊难辨，带有历史的厚重感。", property: 0 },
        { Name: "可乐", price: 8000, quality: SJZXD_Quality.蓝色, weight: 2, type: SJZXD_PropType.回收物, description: "一瓶限量版的可口可乐，铝罐上的图案独特，未曾开封。", property: 0 },
        { Name: "键盘", price: 9000, quality: SJZXD_Quality.蓝色, weight: 3, type: SJZXD_PropType.回收物, description: "一款机械键盘，按键手感清脆，带有自定义的RGB背光，保养得不错。", property: 0 },
        { Name: "油漆桶", price: 22000, quality: SJZXD_Quality.蓝色, weight: 8, type: SJZXD_PropType.回收物, description: "一桶未使用的高品质金属漆，颜色鲜艳，密封完好。", property: 0 },
        { Name: "钟表", price: 10000, quality: SJZXD_Quality.蓝色, weight: 2, type: SJZXD_PropType.回收物, description: "钟摆静静停驻，时间凝固在某一刻。", property: 0 },
        { Name: "望远镜", price: 22000, quality: SJZXD_Quality.蓝色, weight: 4, type: SJZXD_PropType.回收物, description: "一架双筒望远镜，镜片洁净，调焦顺滑，是观星或远眺的利器。", property: 0 },
        { Name: "耳机", price: 8000, quality: SJZXD_Quality.蓝色, weight: 2, type: SJZXD_PropType.回收物, description: "一副降噪耳机，音质纯净，持久续航，使用痕迹轻微。", property: 0 },
        { Name: "英式袋泡茶", price: 8000, quality: SJZXD_Quality.蓝色, weight: 2, type: SJZXD_PropType.回收物, description: "一盒精致的英式红茶包，锡纸包装，散发着淡淡的伯爵茶香。", property: 0 },
        { Name: "机密文档", price: 24000, quality: SJZXD_Quality.紫色, weight: 2, type: SJZXD_PropType.回收物, description: "一个密封的牛皮纸袋，封口处盖有“机密”字样的红色火漆印。", property: 0 },
        { Name: "战术匕首", price: 28000, quality: SJZXD_Quality.紫色, weight: 2, type: SJZXD_PropType.回收物, description: "一把线条硬朗的战术匕首，刀刃锋利，刀柄符合人体工学，带有杀气。", property: 0 },
        { Name: "专业声卡", price: 40000, quality: SJZXD_Quality.紫色, weight: 3, type: SJZXD_PropType.回收物, description: "一台用于录音室级别的外置声卡，接口丰富，能处理高保真音频。", property: 0 },
        { Name: "自旋型手锯", price: 60000, quality: SJZXD_Quality.紫色, weight: 8, type: SJZXD_PropType.回收物, description: "一把设计精巧的环形手锯，锯刃可高速自旋，切割效率极高。", property: 0 },
        { Name: "莫比乌斯环", price: 35000, quality: SJZXD_Quality.紫色, weight: 2, type: SJZXD_PropType.回收物, description: "一个银制的莫比乌斯环雕塑，表面光滑，寓意着无限与循环，充满哲理感。", property: 0 },
        { Name: "手镯", price: 28000, quality: SJZXD_Quality.紫色, weight: 1, type: SJZXD_PropType.回收物, description: "一只镶嵌着细小宝石的手镯，工艺细腻，在光线下闪烁微光。", property: 0 },
        { Name: "萨拉酒壶", price: 36000, quality: SJZXD_Quality.紫色, weight: 2, type: SJZXD_PropType.回收物, description: "一个复古风格的扁形金属酒壶，壶身刻有藤蔓花纹。", property: 0 },
        { Name: "花瓶", price: 40000, quality: SJZXD_Quality.紫色, weight: 4, type: SJZXD_PropType.回收物, description: "一个青花瓷花瓶，瓶身绘有山水图案，釉色温润，是件不错的艺术品。", property: 0 },
        { Name: "床头灯", price: 80000, quality: SJZXD_Quality.金色, weight: 2, type: SJZXD_PropType.回收物, description: "一盏复古床头灯，灯罩色彩斑斓，点亮后光影梦幻。", property: 0 },
        { Name: "CPU", price: 90000, quality: SJZXD_Quality.金色, weight: 2, type: SJZXD_PropType.回收物, description: "一枚顶级型号的处理器，金针脚完好，是高性能计算核心的象征。", property: 0 },
        { Name: "黄金匕首", price: 60000, quality: SJZXD_Quality.金色, weight: 2, type: SJZXD_PropType.回收物, description: "一把刀柄由纯金打造的礼仪匕首，更象征身份而非用于实战。", property: 0 },
        { Name: "机械臂", price: 70000, quality: SJZXD_Quality.金色, weight: 4, type: SJZXD_PropType.回收物, description: "一条精密的仿生机械臂原型机，关节灵活，展现了顶尖的工程技术。", property: 0 },
        { Name: "直升机模型", price: 100000, quality: SJZXD_Quality.金色, weight: 8, type: SJZXD_PropType.回收物, description: "一架按1:50比例精确复制的直升机模型，细节逼真，涂装考究。", property: 0 },
        { Name: "宇宙飞船模型", price: 120000, quality: SJZXD_Quality.金色, weight: 10, type: SJZXD_PropType.回收物, description: "一艘充满未来感的星际飞船模型，流线型设计，仿佛下一秒就要跃迁。", property: 0 },
        { Name: "移动电缆", price: 120000, quality: SJZXD_Quality.金色, weight: 12, type: SJZXD_PropType.回收物, description: "一卷超导材料制成的重型电缆，绝缘层厚重，可用于大型设备供电。", property: 0 },
        { Name: "盆栽", price: 80000, quality: SJZXD_Quality.金色, weight: 5, type: SJZXD_PropType.回收物, description: "一盆精心修剪的盆景，造型苍劲，蕴含着禅意与时间。", property: 0 },
        { Name: "翡翠花瓶", price: 90000, quality: SJZXD_Quality.金色, weight: 4, type: SJZXD_PropType.回收物, description: "一个由整块冰种翡翠雕琢而成的花瓶，通透无瑕，是价值连城的珍宝。", property: 0 },
        { Name: "无人机", price: 450000, quality: SJZXD_Quality.红色, weight: 3, type: SJZXD_PropType.回收物, description: "一架四旋翼高端航拍无人机，搭载4K云台相机，性能处于行业顶端。", property: 0 },
        { Name: "战机模型", price: 1600000, quality: SJZXD_Quality.红色, weight: 10, type: SJZXD_PropType.回收物, description: "一架战斗机的全金属静态模型，细节极致，堪称模型收藏品之王。", property: 0 },
        { Name: "鎏金剪刀", price: 550000, quality: SJZXD_Quality.红色, weight: 2, type: SJZXD_PropType.回收物, description: "一把用于重要典礼的礼仪剪刀，通体鎏金，握柄镶嵌宝石，华美非凡。", property: 0 },
        { Name: "黄金手镯", price: 450000, quality: SJZXD_Quality.红色, weight: 2, type: SJZXD_PropType.回收物, description: "一只沉甸甸的足金手镯，镂空雕刻着繁复的龙凤呈祥图案，工艺登峰造极。", property: 0 },
        { Name: "黄金兔子雕像", price: 900000, quality: SJZXD_Quality.红色, weight: 4, type: SJZXD_PropType.回收物, description: "一尊用纯金铸造的兔子雕像，形态憨态可掬，眼睛用宝石点缀，栩栩如生。", property: 0 },
        { Name: "坦克模型", price: 2000000, quality: SJZXD_Quality.红色, weight: 10, type: SJZXD_PropType.回收物, description: "一辆坦克的1:35可动合金模型，炮塔可旋转，履带可动，细节惊人。", property: 0 },
        { Name: "唱片机", price: 1450000, quality: SJZXD_Quality.红色, weight: 8, type: SJZXD_PropType.回收物, description: "一台胡桃木外壳的复古黑胶唱片机，黄铜喇叭，播放时充满了模拟时代的温暖音质。", property: 0 },
        { Name: "纯金怀表", price: 300000, quality: SJZXD_Quality.红色, weight: 2, type: SJZXD_PropType.回收物, description: "一枚沉甸甸的纯金怀表，表盖内侧刻有家族徽记，机芯依然滴答作响，精准如初。", property: 0 },
        { Name: "纯金战马雕像", price: 1250000, quality: SJZXD_Quality.红色, weight: 6, type: SJZXD_PropType.回收物, description: "一尊奔腾姿态的战马纯金雕塑，肌肉线条充满力量感，象征着胜利与荣耀。", property: 0 },
        { Name: "黄金电话", price: 1800000, quality: SJZXD_Quality.红色, weight: 8, type: SJZXD_PropType.回收物, description: "一部老式转盘电话，听筒和底座均由黄金打造，是上个世纪顶级奢华的通讯工具。", property: 0 },
        { Name: "黄金花瓶", price: 1700000, quality: SJZXD_Quality.红色, weight: 6, type: SJZXD_PropType.回收物, description: "一个通体由黄金打造的花瓶，瓶身采用錾刻工艺，纹饰华丽，尽显帝王之气。", property: 0 },
        { Name: "黄金香炉", price: 2100000, quality: SJZXD_Quality.红色, weight: 7, type: SJZXD_PropType.回收物, description: "一鼎三足黄金香炉，盖子上镂空雕刻着祥云纹，是古代宫廷祭祀用的礼器。", property: 0 },
        { Name: "黄金印章", price: 600000, quality: SJZXD_Quality.红色, weight: 2, type: SJZXD_PropType.回收物, description: "一枚沉甸甸的黄金狮钮印章，印底刻着古老的篆文，象征着无上的权力与信用。", property: 0 },
        { Name: "科技原石", price: 1000000, quality: SJZXD_Quality.红色, weight: 1, type: SJZXD_PropType.回收物, description: "一块内部蕴含着规则电路板状纹路的奇异矿石，仿佛自然与科技融合的产物。", property: 0 },
        { Name: "碳纤维原石", price: 1050000, quality: SJZXD_Quality.红色, weight: 1, type: SJZXD_PropType.回收物, description: "一种极其罕见的矿物，质地轻盈却无比坚韧，表面有着碳纤维特有的编织纹理。", property: 0 },
        { Name: "招财狗", price: 1400000, quality: SJZXD_Quality.红色, weight: 5, type: SJZXD_PropType.回收物, description: "一尊翡翠雕成的坐姿柴犬雕像，憨态可掬，口中衔着一枚金币，寓意财源广进。", property: 0 },
        { Name: "天圆地方", price: 900000, quality: SJZXD_Quality.红色, weight: 4, type: SJZXD_PropType.回收物, description: "一套白玉制成的围棋棋具，棋盘代表“地方”，棋罐代表“天圆”，蕴含宇宙哲理。", property: 0 },
        { Name: "鎏金三足鼎", price: 2500000, quality: SJZXD_Quality.红色, weight: 12, type: SJZXD_PropType.回收物, description: "一尊仿商周青铜器造型的三足鼎，通体鎏金，纹饰庄重，是镇宅之宝。", property: 0 },
        { Name: "留声机", price: 700000, quality: SJZXD_Quality.红色, weight: 2, type: SJZXD_PropType.回收物, description: "一台爱迪生时代的古董留声机，带有巨大的黄铜喇叭，是音响设备的活化石。", property: 0 },
        { Name: "黄金油灯", price: 1300000, quality: SJZXD_Quality.红色, weight: 4, type: SJZXD_PropType.回收物, description: "一盏《一千零一夜》故事风格的黄金神灯，造型华丽，仿佛摩擦就能唤出精灵。", property: 0 },
        { Name: "非洲之心", price: 13145200, quality: SJZXD_Quality.红色, weight: 2, type: SJZXD_PropType.回收物, description: "珍贵的非洲之心宝石，蕴含着强大的能量，是稀有的收藏品。", property: 0 },
        { Name: "海洋之泪", price: 26000000, quality: SJZXD_Quality.红色, weight: 2, type: SJZXD_PropType.回收物, description: "象征着人鱼公主的珍贵泪水,代表着刻骨铭心的爱情和纯净深邃的大海。", property: 0 },
        { Name: "干员卡", price: 200000, quality: SJZXD_Quality.红色, weight: 2, type: SJZXD_PropType.回收物, description: "用于解锁干员的稀有道具，是勇气的象征！。", property: 0 },




        { Name: "科技之刃", price: 1, quality: SJZXD_Quality.绿色, weight: 5, type: SJZXD_PropType.武器, description: "入门级战斗刀，构造简单但足够可靠，能满足基本的生存需求。", property: 50 }, // 武器属性为攻击
        { Name: "迷彩MP7", price: 3000, quality: SJZXD_Quality.绿色, weight: 5, type: SJZXD_PropType.武器, description: "轻量化冲锋枪，易于携带和操控，适合快速反应和近距离接战。", property: 75 }, // 武器属性为攻击
        { Name: "AK47", price: 8000, quality: SJZXD_Quality.绿色, weight: 5, type: SJZXD_PropType.武器, description: "坚固耐用的突击步枪，拥有凶猛的火力，适合持续压制与正面突破。", property: 100 }, // 武器属性为攻击
        { Name: "QBZ", price: 20000, quality: SJZXD_Quality.绿色, weight: 5, type: SJZXD_PropType.武器, description: "高射速冲锋枪，在狭小空间内能迅速倾泻弹雨，压制力极强。", property: 125 }, // 武器属性为攻击
        { Name: "狙击步枪", price: 100000, quality: SJZXD_Quality.蓝色, weight: 5, type: SJZXD_PropType.武器, description: "精密校准的远程武器，能够在超远距离实现精准狙杀。", property: 150 }, // 武器属性为攻击
        { Name: "蓝调", price: 400000, quality: SJZXD_Quality.蓝色, weight: 5, type: SJZXD_PropType.武器, description: "中等口径冲锋枪，威力惊人，是追求一击决胜的枪手之选。", property: 175 }, // 武器属性为攻击
        { Name: "腐蚀丛林", price: 800000, quality: SJZXD_Quality.蓝色, weight: 5, type: SJZXD_PropType.武器, description: "经过特殊涂装的狙击枪，适应复杂环境，性能均衡且可靠。", property: 200 }, // 武器属性为攻击
        { Name: "异星科技", price: 1500000, quality: SJZXD_Quality.蓝色, weight: 5, type: SJZXD_PropType.武器, description: "采用无托结构设计，在紧凑尺寸下保持了优异的射击精度与稳定性。", property: 225 }, // 武器属性为攻击
        { Name: "未来", price: 3000000, quality: SJZXD_Quality.紫色, weight: 5, type: SJZXD_PropType.武器, description: "搭载穿甲弹药的战斗步枪，能有效击穿轻装甲目标，胜任反器材任务。", property: 250 }, // 武器属性为攻击
        { Name: "蝰蛇", price: 4500000, quality: SJZXD_Quality.紫色, weight: 5, type: SJZXD_PropType.武器, description: "这是一把如同毒蛇一般的狙击枪，一发毙命。", property: 280 }, // 武器属性为攻击
        { Name: "毒龙", price: 6500000, quality: SJZXD_Quality.紫色, weight: 5, type: SJZXD_PropType.武器, description: "短管战斗步枪，专为极近距离的殊死搏斗设计，威力巨大且反应迅捷。", property: 310 }, // 武器属性为攻击
        { Name: "大黄蜂", price: 8500000, quality: SJZXD_Quality.紫色, weight: 5, type: SJZXD_PropType.武器, description: "一把冲锋枪，兼顾精度与射速，能对中近距离目标进行快速连续打击。", property: 340 }, // 武器属性为攻击
        { Name: "鎏金M4", price: 13000000, quality: SJZXD_Quality.金色, weight: 5, type: SJZXD_PropType.武器, description: "全自动战斗步枪，以惊人的射速泼洒弹丸，将近距离变为绝对的死亡领域。", property: 370 }, // 武器属性为攻击
        { Name: "玩具", price: 16000000, quality: SJZXD_Quality.金色, weight: 5, type: SJZXD_PropType.武器, description: "经过现代化改造的经典步枪，在威力和操控性上达到了出色的平衡。", property: 400 }, // 武器属性为攻击
        { Name: "电路", price: 20000000, quality: SJZXD_Quality.金色, weight: 5, type: SJZXD_PropType.武器, description: "轻狙击，凭借高载弹量和稳定射速，能长时间提供压制性火力。", property: 430 }, // 武器属性为攻击
        { Name: "霓虹", price: 25000000, quality: SJZXD_Quality.金色, weight: 5, type: SJZXD_PropType.武器, description: "一把炫彩的战斗步枪，不要被他的外表欺骗了。", property: 470 }, // 武器属性为攻击
        { Name: "水枪", price: 30000000, quality: SJZXD_Quality.红色, weight: 5, type: SJZXD_PropType.武器, description: "个人防卫武器，射速极高，能在瞬息万变的近身战中抢占先机。", property: 500 }, // 武器属性为攻击
        { Name: "极客", price: 40000000, quality: SJZXD_Quality.红色, weight: 5, type: SJZXD_PropType.武器, description: "战斗步枪，牺牲载弹量换来无与伦比的瞬间爆发力，一击即可定乾坤。", property: 525 }, // 武器属性为攻击
        { Name: "次元战士", price: 50000000, quality: SJZXD_Quality.红色, weight: 5, type: SJZXD_PropType.武器, description: "他们是维度裂隙的守望者，是时空法则的活体代行者。", property: 550 }, // 武器属性为攻击
        { Name: "起源", price: 60000000, quality: SJZXD_Quality.红色, weight: 5, type: SJZXD_PropType.武器, description: "模块化多用途狙击枪，可通过配件适应任何战术环境，是特种作战的万能核心。", property: 600 }, // 武器属性为攻击
        { Name: "AWM", price: 70000000, quality: SJZXD_Quality.红色, weight: 5, type: SJZXD_PropType.武器, description: "现代狙击枪，拥有极高的命中率以及伤害，足矣一击毙命。", property: 650 }, // 武器属性为攻击
        { Name: "神·霓虹战斧", price: 2000000, quality: SJZXD_Quality.炫彩, weight: 5, type: SJZXD_PropType.武器, description: "顶尖工艺的栓动狙击平台，精度登峰造极，是传奇战士的身份象征。", property: 450 }, // 武器属性为攻击
        { Name: "神·青龙", price: 2000000, quality: SJZXD_Quality.炫彩, weight: 5, type: SJZXD_PropType.武器, description: "融合了仿生科技的战斗步枪，攻击时发出的龙音能震慑敌人。", property: 450 }, // 武器属性为攻击
        { Name: "神·猩红射手", price: 2000000, quality: SJZXD_Quality.炫彩, weight: 5, type: SJZXD_PropType.武器, description: "装饰着华丽光影特效的传奇武器，每次命中都可能引发能量侵蚀。", property: 450 }, // 武器属性为攻击
        { Name: "神·启灵流星锤", price: 100000000, quality: SJZXD_Quality.炫彩, weight: 5, type: SJZXD_PropType.武器, description: "高科技近战武器，拥有卓越的伤害，在战斗中能保持极高的威慑力。", property: 800 }, // 武器属性为攻击
        { Name: "神·未来之光", price: 140000000, quality: SJZXD_Quality.炫彩, weight: 5, type: SJZXD_PropType.武器, description: "先进的战斗步枪系统，射速与可靠性均达到极致，是突击手梦寐以求的破门利器。", property: 900 }, // 武器属性为攻击
        { Name: "神·王者之耀", price: 200000000, quality: SJZXD_Quality.炫彩, weight: 5, type: SJZXD_PropType.武器, description: "代表了单兵武器最高工艺的战斗步枪，能在极限射程上实现稳定且致命的精准打击。", property: 1000 }, // 武器属性为攻击


        { Name: "户外耳机帽", price: 5000, quality: SJZXD_Quality.绿色, weight: 5, type: SJZXD_PropType.头盔, description: "带有耳机的户外帽子，提供基础听力保护，减少噪音干扰。", property: 300 }, // 头盔属性为生命
        { Name: "轻型头盔", price: 30000, quality: SJZXD_Quality.绿色, weight: 5, type: SJZXD_PropType.头盔, description: "轻型防护头盔，提供基本头部保护，不影响视野。", property: 400 }, // 头盔属性为生命
        { Name: "防弹头盔", price: 3000000, quality: SJZXD_Quality.蓝色, weight: 5, type: SJZXD_PropType.头盔, description: "标准防弹头盔，可有效抵御子弹和碎片伤害。", property: 600 }, // 头盔属性为生命
        { Name: "MC防弹头盔", price: 5000000, quality: SJZXD_Quality.蓝色, weight: 5, type: SJZXD_PropType.头盔, description: "迷彩防弹头盔，具有良好的隐蔽性，提供中等防护。", property: 800 }, // 头盔属性为生命
        { Name: "战术头盔", price: 18000000, quality: SJZXD_Quality.紫色, weight: 5, type: SJZXD_PropType.头盔, description: "高级战术头盔，集成了通讯和瞄准系统，提供全方位防护。", property: 1000 }, // 头盔属性为生命
        { Name: "SAS战术头盔", price: 25000000, quality: SJZXD_Quality.紫色, weight: 5, type: SJZXD_PropType.头盔, description: "特种部队专用头盔，防护性能卓越，具备夜视功能。", property: 1300 }, // 头盔属性为生命
        { Name: "MF防爆头盔", price: 40000000, quality: SJZXD_Quality.金色, weight: 5, type: SJZXD_PropType.头盔, description: "防爆专用头盔，可抵御爆炸冲击波和碎片伤害。", property: 1550 }, // 头盔属性为生命
        { Name: "精锐头盔", price: 50000000, quality: SJZXD_Quality.金色, weight: 5, type: SJZXD_PropType.头盔, description: "重型防护头盔，提供最高级别的头部保护，但会降低移动速度。", property: 1700 }, // 头盔属性为生命
        { Name: "AEGIS装甲头盔", price: 98000000, quality: SJZXD_Quality.红色, weight: 5, type: SJZXD_PropType.头盔, description: "顶级装甲头盔，拥有智能防护系统，可抵御各种攻击。", property: 2000 }, // 头盔属性为生命

        { Name: "轻型战术背心", price: 8000, quality: SJZXD_Quality.绿色, weight: 5, type: SJZXD_PropType.防具, description: "轻型战术背心，提供基础防护，不影响行动灵活性。", property: 50 }, // 防具属性为防御
        { Name: "通用战术背心", price: 50000, quality: SJZXD_Quality.绿色, weight: 5, type: SJZXD_PropType.防具, description: "通用战术背心，平衡防护和机动性，适合常规作战。", property: 100 }, // 防具属性为防御
        { Name: "快拆防弹衣", price: 4000000, quality: SJZXD_Quality.蓝色, weight: 5, type: SJZXD_PropType.防具, description: "快拆式防弹衣，紧急情况下可快速脱卸，提供中等防护。", property: 150 }, // 防具属性为防御
        { Name: "MC轻型防弹衣", price: 6000000, quality: SJZXD_Quality.蓝色, weight: 5, type: SJZXD_PropType.防具, description: "迷彩轻型防弹衣，具有良好的隐蔽性，适合野外作战。", property: 200 }, // 防具属性为防御
        { Name: "作战防弹衣", price: 24000000, quality: SJZXD_Quality.紫色, weight: 5, type: SJZXD_PropType.防具, description: "专业作战防弹衣，提供高级防护，内置战术装备挂载系统。", property: 300 }, // 防具属性为防御
        { Name: "Gen4作战防弹衣", price: 30000000, quality: SJZXD_Quality.紫色, weight: 5, type: SJZXD_PropType.防具, description: "第四代作战防弹衣，采用先进材料，防护性能卓越。", property: 400 }, // 防具属性为防御
        { Name: "MF重型防弹衣", price: 60000000, quality: SJZXD_Quality.金色, weight: 5, type: SJZXD_PropType.防具, description: "重型防弹衣，提供最高级别的防护，适合高风险作战环境。", property: 600 }, // 防具属性为防御
        { Name: "重型突击防弹衣", price: 80000000, quality: SJZXD_Quality.金色, weight: 5, type: SJZXD_PropType.防具, description: "突击专用重型防弹衣，防护和机动性完美结合。", property: 800 }, // 防具属性为防御
        { Name: "AEGIS防弹装甲", price: 120000000, quality: SJZXD_Quality.红色, weight: 5, type: SJZXD_PropType.防具, description: "顶级防弹装甲，拥有主动防护系统，可抵御各种攻击。", property: 1000 }, // 防具属性为防御
    ]

    // 创建一个Map用于快速查找
    private static propDataMap: Map<string, SJZXD_PropDataItem> | null = null;
    public static getPropDataByName(name: string): SJZXD_PropDataItem | undefined {
        return this.getPropDataMap().get(name);
    }
    private static getPropDataMap(): Map<string, SJZXD_PropDataItem> {
        if (!this.propDataMap) {
            this.propDataMap = new Map<string, SJZXD_PropDataItem>();
            for (const prop of this.PropData) {
                this.propDataMap.set(prop.Name, prop);
            }
        }
        return this.propDataMap;
    }

    //获得所有指定类型的物品的集合
    public static getAllPropByType(Type: SJZXD_PropType): string[] {
        const recycleProp: string[] = [];
        for (const prop of this.PropData) {
            if (prop.type == Type) {
                recycleProp.push(prop.Name);
            }
        }
        return recycleProp;
    }


    //#endregion


    //#region 干员数据以及访问方法
    //升级干员所需的钱
    public static UpgradeAgentMoney: number[] = [0, 500000, 1000000, 2000000, 5000000, 10000000, 25000000, 50000000,
        150000000, 300000000, 0]


    public static AgentData: {
        Name: string, 攻击: number, 生命: number, 护甲: number, 主动技能: string, 被动技能: string,
        主动技能描述: string, 被动技能描述: string, 星级: number
    }[] = [
            {
                Name: "修勾", 攻击: 120, 生命: 300, 护甲: 120, 主动技能: "无", 被动技能: "无",
                主动技能描述: "无",
                被动技能描述: "无",
                星级: 3
            },
            {
                Name: "杰峰", 攻击: 50, 生命: 450, 护甲: 200, 主动技能: "致命飞镖", 被动技能: "机动性",
                主动技能描述: "投射出一个飞镖，造成大量伤害，最多可以存储3发",
                被动技能描述: "移动速度增加10%",
                星级: 4
            },
            {
                Name: "贤勾", 攻击: 200, 生命: 100, 护甲: 50, 主动技能: "超级恢复", 被动技能: "缓慢回血",
                主动技能描述: "获得治愈之力，恢复大量生命值",
                被动技能描述: "每秒自动回复生命值5点",
                星级: 4
            },
            {
                Name: "炼狱犬", 攻击: 150, 生命: 220, 护甲: 150, 主动技能: "无敌炮火", 被动技能: "外骨骼",
                主动技能描述: "发射天降火炮，造成大量伤害",
                被动技能描述: "滑铲CD减少1秒",
                星级: 5
            },
            {
                Name: "不死勾", 攻击: 80, 生命: 300, 护甲: 200, 主动技能: "烈焰焚天", 被动技能: "不死战神",
                主动技能描述: "扔出一颗燃烧弹，造成范围持续伤害！",
                被动技能描述: "防御力提升10%",
                星级: 5
            },
        ];
    //通过名字获得属性
    public static getAgentDataByName(Name: string): {
        Name: string, 攻击: number, 生命: number, 护甲: number, 主动技能: string, 被动技能: string,
        主动技能描述: string, 被动技能描述: string, 星级: number
    } {
        for (const agent of this.AgentData) {
            if (agent.Name == Name) {
                return agent;
            }
        }
        return undefined;
    }

    //#endregion

    //#region 皮肤数据以及访问方法
    public static SkinData: { Name: string, Price: number, Quality: string, AddHP: number, Description: string }[] = [
        { Name: "修勾", Price: 0, Quality: "普通", AddHP: 0, Description: "一只普通的修勾，在城市夹缝中顽强生存，学会了与人类共存，并在无意间卷入了改变命运的漩涡。" },
        { Name: "杰峰", Price: 0, Quality: "普通", AddHP: 0, Description: "曾是驯犬基地的明星工作犬，因意外流落街头，骄傲与责任感驱使它成为修勾中的守护者。" },
        { Name: "贤勾", Price: 0, Quality: "普通", AddHP: 0, Description: "诞生于旧城区巷弄的智者，善于观察人类行为，常以出人意料的机敏化解同伴危机，被族群视为“军师”。" },
        { Name: "炼狱犬", Price: 0, Quality: "普通", AddHP: 0, Description: "从废弃工业区诞生的斗士，身上沾染着油污与锈迹，在污染与危险中磨练出坚韧不屈的生存意志。" },
        { Name: "不死勾", Price: 0, Quality: "普通", AddHP: 0, Description: "历经多次重伤却奇迹生还的传说之犬，伤疤是它的勋章，在流浪者口中逐渐成为“不死”的精神象征。" },
        { Name: "老兵", Price: 1000000, Quality: "稀有", AddHP: 60, Description: "身披旧式战术背带与磨损勋章，仿佛历经无数战役的退役军犬，眼神沉淀着忠诚与风霜。(生命上限+60)" },
        { Name: "天使", Price: -1, Quality: "稀有", AddHP: 70, Description: "纯白毛发生长，周身萦绕柔和微光，举止优雅宁静，如降临尘世抚慰伤痛的圣洁使者。(生命上限+70)" },
        { Name: "军阀", Price: 3000000, Quality: "稀有", AddHP: 80, Description: "装饰着骨质图腾与兽皮战甲，桀骜目光中燃烧着征服欲，宛如统御荒野部族的犬中霸主。(生命上限+80)" },
        { Name: "蓝翼", Price: -1, Quality: "稀有", AddHP: 90, Description: "肩生半透明湛蓝光翼，跃动时洒落星点能量，似从科幻梦境中走出的高机动性守护者。(生命上限+90)" },
        { Name: "白衣战士", Price: 8000000, Quality: "稀有", AddHP: 100, Description: "穿戴整洁的定制医疗护甲，携带急救标识，仿佛战场前线最专业可靠的救援先锋。(生命上限+100)" },
        { Name: "摩尔科技", Price: -1, Quality: "传说", AddHP: 150, Description: "通体覆盖流线型数码装甲，关节处透出幽蓝光芒，搭载着尖端单兵作战辅助系统。(生命上限+150)" },
        { Name: "特种部队", Price: 25000000, Quality: "传说", AddHP: 170, Description: "装备模块化隐身迷彩与全息战术目镜，完美融入暗夜，是执行精密潜入任务的终极形态。(生命上限+170)" },
        { Name: "机甲修勾", Price: 30000000, Quality: "传说", AddHP: 200, Description: "重型机械骨架覆盖合金外甲，背部搭载可变形武器模块，堪称移动的狂暴火力堡垒。(生命上限+200)" },
        { Name: "未来战士", Price: 40000000, Quality: "传说", AddHP: 225, Description: "纳米纤维战衣随时拟态环境，来自时间尽头的终极战场幸存者。(生命上限+225)" },
        { Name: "烈焰犬", Price: 50000000, Quality: "传说", AddHP: 255, Description: "熔岩纹路在皮毛下涌动，踏足之处留下灼痕，宛如自地核诞生的永恒之火化身。(生命上限+255)" },
    ];
    //通过名字获得皮肤属性
    public static getSkinDataByName(Name: string): { Name: string, Price: number, Quality: string, AddHP: number, Description: string } {
        for (const skin of this.SkinData) {
            if (skin.Name == Name) {
                return skin;
            }
        }
        return undefined;
    }
    //#endregion


    //#region 武器数据以及访问方法
    public static WeaponData: SJZXD_WeaponItem[] = [
        { Name: "科技之刃", 武器类型: "近战", 射速: 1, 换弹时间: 0, 弹夹容量: 0, 开枪音效: "近战攻击" },
        { Name: "迷彩MP7", 武器类型: "远程", 射速: 2.5, 换弹时间: 0.8, 弹夹容量: 30, 开枪音效: "枪声" },
        { Name: "AK47", 武器类型: "远程", 射速: 2, 换弹时间: 1.7, 弹夹容量: 30, 开枪音效: "枪声" },
        { Name: "QBZ", 武器类型: "远程", 射速: 2.5, 换弹时间: 2, 弹夹容量: 25, 开枪音效: "枪声" },
        { Name: "狙击步枪", 武器类型: "远程", 射速: 0.5, 换弹时间: 4, 弹夹容量: 8, 开枪音效: "枪声" },
        { Name: "蓝调", 武器类型: "远程", 射速: 3, 换弹时间: 3, 弹夹容量: 50, 开枪音效: "枪声" },
        { Name: "腐蚀丛林", 武器类型: "远程", 射速: 0.75, 换弹时间: 2, 弹夹容量: 10, 开枪音效: "枪声" },
        { Name: "异星科技", 武器类型: "远程", 射速: 2.5, 换弹时间: 1, 弹夹容量: 30, 开枪音效: "枪声" },
        { Name: "未来", 武器类型: "远程", 射速: 2.5, 换弹时间: 1, 弹夹容量: 30, 开枪音效: "枪声" },
        { Name: "蝰蛇", 武器类型: "远程", 射速: 0.9, 换弹时间: 2, 弹夹容量: 12, 开枪音效: "枪声" },
        { Name: "毒龙", 武器类型: "远程", 射速: 2.5, 换弹时间: 1.5, 弹夹容量: 40, 开枪音效: "枪声" },
        { Name: "大黄蜂", 武器类型: "远程", 射速: 2.5, 换弹时间: 1.8, 弹夹容量: 35, 开枪音效: "枪声" },
        { Name: "鎏金M4", 武器类型: "远程", 射速: 2, 换弹时间: 1, 弹夹容量: 25, 开枪音效: "枪声" },
        { Name: "玩具", 武器类型: "远程", 射速: 2.5, 换弹时间: 1.5, 弹夹容量: 40, 开枪音效: "枪声" },
        { Name: "电路", 武器类型: "远程", 射速: 1.1, 换弹时间: 1.8, 弹夹容量: 18, 开枪音效: "枪声" },
        { Name: "霓虹", 武器类型: "远程", 射速: 2.3, 换弹时间: 1.3, 弹夹容量: 34, 开枪音效: "枪声" },
        { Name: "水枪", 武器类型: "远程", 射速: 3.2, 换弹时间: 1.5, 弹夹容量: 30, 开枪音效: "枪声" },
        { Name: "极客", 武器类型: "远程", 射速: 3, 换弹时间: 1, 弹夹容量: 20, 开枪音效: "枪声" },
        { Name: "次元战士", 武器类型: "远程", 射速: 2, 换弹时间: 1.4, 弹夹容量: 30, 开枪音效: "枪声" },
        { Name: "起源", 武器类型: "远程", 射速: 0.75, 换弹时间: 3, 弹夹容量: 11, 开枪音效: "枪声" },
        { Name: "AWM", 武器类型: "远程", 射速: 0.5, 换弹时间: 5, 弹夹容量: 5, 开枪音效: "枪声" },
        { Name: "神·霓虹战斧", 武器类型: "近战", 射速: 0.75, 换弹时间: 1, 弹夹容量: 30, 开枪音效: "近战攻击" },
        { Name: "神·青龙", 武器类型: "远程", 射速: 2.2, 换弹时间: 1.4, 弹夹容量: 35, 开枪音效: "枪声" },
        { Name: "神·猩红射手", 武器类型: "远程", 射速: 0.3, 换弹时间: 2, 弹夹容量: 14, 开枪音效: "枪声" },
        { Name: "神·启灵流星锤", 武器类型: "近战", 射速: 0.9, 换弹时间: 1, 弹夹容量: 30, 开枪音效: "近战攻击" },
        { Name: "神·未来之光", 武器类型: "远程", 射速: 2.4, 换弹时间: 1, 弹夹容量: 33, 开枪音效: "枪声" },
        { Name: "神·王者之耀", 武器类型: "远程", 射速: 2.5, 换弹时间: 0.7, 弹夹容量: 45, 开枪音效: "枪声" },
    ]

    //通过名字获取武器属性
    public static getWeaponDataByName(Name: string): SJZXD_WeaponItem {
        for (const weapon of this.WeaponData) {
            if (weapon.Name == Name) {
                return weapon;
            }
        }
        return undefined;
    }
    //#endregion

    //#region 皮肤名称以及访问方法
    //皮肤名称
    public static SkinName: { Name: string, SkeletonName: string }[] = [
        { Name: "修勾", SkeletonName: "juese" },
        { Name: "杰峰", SkeletonName: "juese1_jiefeng" },
        { Name: "贤勾", SkeletonName: "juese3_xianzhe" },
        { Name: "炼狱犬", SkeletonName: "juese2_lianyu" },
        { Name: "不死勾", SkeletonName: "juese4-huonan" },
        { Name: "未来战士", SkeletonName: "pifu1" },
        { Name: "白衣战士", SkeletonName: "pifu2" },
        { Name: "机甲修勾", SkeletonName: "pifu3" },
        { Name: "天使", SkeletonName: "pifu4" },
        { Name: "老兵", SkeletonName: "pifu5" },
        { Name: "特种部队", SkeletonName: "pifu6" },
        { Name: "蓝翼", SkeletonName: "pifu7" },
        { Name: "摩尔科技", SkeletonName: "pifu8" },
        { Name: "军阀", SkeletonName: "pifu9" },
        { Name: "烈焰犬", SkeletonName: "pifu10" },
    ]
    //通过名字获取皮肤名称
    public static getSkinNameByName(Name: string): { Name: string, SkeletonName: string } {
        for (const skin of this.SkinName) {
            if (skin.Name == Name) {
                return skin;
            }
        }
        return undefined;
    }
    //#endregion

    //#region 研究处升级配置
    public static LaboratoryLevelUpData: { Name: string, Price: number[], PropData: { Name: string, Num: number }[] }[] = [
        {
            Name: "基因研究所",
            Price: [100000, 500000, 1000000, 3000000, 5000000, 8000000, 12000000, 30000000, 50000000, 100000000],
            PropData: [{ Name: "纯金怀表", Num: 1 }, { Name: "纯金怀表", Num: 2 }, { Name: "纯金怀表", Num: 3 }, { Name: "唱片机", Num: 1 },
            { Name: "唱片机", Num: 2 }, { Name: "唱片机", Num: 3 }, { Name: "坦克模型", Num: 1 }, { Name: "坦克模型", Num: 2 },
            { Name: "坦克模型", Num: 3 }, { Name: "坦克模型", Num: 5 },
            ]
        },
        {
            Name: "武器研究所",
            Price: [100000, 500000, 1000000, 3000000, 5000000, 8000000, 12000000, 30000000, 50000000, 100000000],
            PropData: [{ Name: "黄金花瓶", Num: 1 }, { Name: "黄金花瓶", Num: 2 }, { Name: "黄金花瓶", Num: 3 }, { Name: "黄金电话", Num: 1 },
            { Name: "黄金电话", Num: 2 }, { Name: "黄金电话", Num: 3 }, { Name: "纯金战马雕像", Num: 1 }, { Name: "纯金战马雕像", Num: 2 },
            { Name: "科技原石", Num: 3 }, { Name: "海洋之泪", Num: 1 },
            ]
        },
        {
            Name: "情报研究所",
            Price: [100000, 500000, 1000000, 3000000, 5000000, 8000000, 12000000, 30000000, 50000000, 100000000],
            PropData: [{ Name: "黄金印章", Num: 1 }, { Name: "黄金印章", Num: 2 }, { Name: "黄金印章", Num: 3 }, { Name: "黄金香炉", Num: 1 },
            { Name: "黄金香炉", Num: 2 }, { Name: "黄金香炉", Num: 3 }, { Name: "招财狗", Num: 1 }, { Name: "招财狗", Num: 2 },
            { Name: "碳纤维原石", Num: 3 }, { Name: "碳纤维原石", Num: 5 },
            ]
        },
        {
            Name: "仓储研究所",
            Price: [100000, 500000, 1000000, 3000000, 5000000, 8000000, 12000000, 30000000, 50000000, 100000000],
            PropData: [{ Name: "天圆地方", Num: 1 }, { Name: "天圆地方", Num: 2 }, { Name: "天圆地方", Num: 3 }, { Name: "留声机", Num: 1 },
            { Name: "留声机", Num: 2 }, { Name: "留声机", Num: 3 }, { Name: "黄金油灯", Num: 1 }, { Name: "黄金油灯", Num: 2 },
            { Name: "鎏金三足鼎", Num: 3 }, { Name: "非洲之心", Num: 1 },
            ]
        },
    ]
    //获取仓储当前等级升级所需材料
    public static GetLaboratoryLevelUpData(Index: number): { price: number, Name: string, Num: number } {
        return {
            price: this.LaboratoryLevelUpData[Index].Price[SJZXD_GameData.Instance.LaboratoryLevel[Index]],
            Name: this.LaboratoryLevelUpData[Index].PropData[SJZXD_GameData.Instance.LaboratoryLevel[Index]].Name,
            Num: this.LaboratoryLevelUpData[Index].PropData[SJZXD_GameData.Instance.LaboratoryLevel[Index]].Num
        }
    }

    //科技处升级数值
    public static LaboratoryLevelData: number[][] = [
        [//生命
            0, 200, 400, 600, 800, 1100, 1400, 1700, 2000, 2250, 2500, 2500
        ],
        [//攻击
            0, 25, 50, 75, 100, 125, 150, 175, 200, 225, 275, 275
        ],
        [//爆率（百分比）
            0, 1.5, 3, 4, 5, 6, 7.5, 9, 10, 11, 12, 12
        ],
        [//背包容量
            0, 5, 7, 9, 11, 14, 17, 20, 24, 28, 35, 35
        ],
    ]
    //#endregion
}


