/** @type{HTMLCanvasElement} */   //VsCode Canvas方法参数智能提示
var canv = document.getElementById('mycanv');
var ctx = canv.getContext('2d');
var g_level = document.getElementById('g-level');

//解析地图,获取游戏信息
var level = 0;  //游戏关卡等级
var game = {  //游戏信息-角色信息多使用对象存储
    wall: {color: '#333',data: [],},
    target: {color: '#00dc99',data: [],},
    box: {color: 'rgba(249,76,90,0.7)',data: [],},
    player: {color: 'rgba(95,135,238,0.8)',data: [],},
}; //game.wall   game['wall']
var keys = ['wall', 'target', 'box', 'player'];
//遍历游戏地图，获取游戏信息
g_init(0);

function g_init(lv) {
    let map = levels[lv];
    keys.forEach(k => (game[k].data = []));
    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
            let data = map[i][j];
            let id = i * 16 + j; // id从0开始编号
            if (data > 0) {
                let key = keys[data - 1];
                //把墙、目标点、箱子、玩家的ID（你也可以写坐标点i,j）找到并存入对应数据对象
                if (data == 5) {
                    game['target'].data.push(id);
                    game['box'].data.push(id);
                } else {
                    game[key].data.push(id);
                }
            }
        }
    }
    renderMap();
}

function renderMap() {
    ctx.clearRect(0, 0, 576, 576);
    keys.forEach(k => game[k].data.forEach(n => drawRRect(k, n)));
}

function select_level(n) {
    if(n==0){
        g_init(level);
        return
    }
    let lv = n == undefined ? g_level.value * 1 : level + n; // 指定关、上一关、下一关
    level = lv < 0 ? 0 : lv > 99 ? 99 : lv; // 这里把 level 改掉了
    g_level.value = level;
    g_init(level);
}

//绘制圆角矩形
function drawRRect(who, id) {
    let w = 576 / 16;  // width 栅格宽度
    let r = 6;   // raduis 圆角半径 
    let m = 1;  // margin 栅格之间的间隔
    //通过 ID 换算解析成坐标位置 x、y   
    let [x, y] = [(id % 16) * w, Math.floor(id / 16) * w];
    if (who == 'target') { //目标点画成圆形，别的角色画为圆角矩形
        r = 13;
        m = 5;
    }
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + m, y + m + r);
    ctx.arcTo(x + m, y + w - m, x + m + r, y + w - m, r);
    ctx.arcTo(x + w - m, y + w - m, x + w - m, y + w - m - r, r);
    ctx.arcTo(x + w - m, y + m, x + w - m - r, y + m, r);
    ctx.arcTo(x + m, y + m, x + m, y + m + r, r);
    ctx.closePath()
    ctx.fillStyle = game[who].color;
    ctx.fill(); // 填充颜色
    ctx.restore();
}

//键盘事件
document.addEventListener('keydown', ev => {
    let keyCode=ev.keyCode
    console.log('keyCode: ', keyCode);
    if([27,37,38,39,40].includes(keyCode)){
        if(keyCode==27){ //ESC键
            select_level(0);
            return;
        }
        //设置移动方向
        let dir = [-1, -16, 1, 16][keyCode - 37]; //上下左右
        let player = game.player.data[0]; //当前玩家位置id
        //判断是否撞墙
        let next = player + dir; //下一个位置id
        if (game.wall.data.includes(next)) return; //下一个位置是墙，直接返回（忽略事件）
        //下一个位置是箱子
        if (game.box.data.includes(next)) {
            let box = next;
            let bnext = box + dir;
            //判断箱子前面是否为墙或者箱子
            if (game.wall.data.includes(bnext) || game.box.data.includes(bnext)) return;
            //推箱子
            move('box', box, dir);
            //判断输赢(游戏结束)
            checkOver();
        }
        //进行移动:player
        move('player', player, dir);
    }
});

//移动角色
function move(who, id, dir) {
    //根据移动方向,找到下一个位置:next
    let next = id + dir;
    //更新who角色数据 更新玩家和盒子移动后位置的id信息
    let index = game[who].data.indexOf(id);
    game[who].data[index] = next;
    //重新渲染地图
    renderMap();
}

//判断输赢
function checkOver() {
    //箱子id数组的每个元素是否都在目标id数组里，即两个数组元素一致游戏胜利
    let over = game.box.data.every(b => game.target.data.includes(b)); //true\false
    if (over) {
        setTimeout(() => {
            alert('恭喜你通过本关！🧸');
            select_level(1);
        }, 100);
    }
}