const PptxGenJS = require('pptxgenjs');
const pptx = new PptxGenJS();

// Brand colors
const C = {
  primary: 'FF6B6B', dark: 'E55A5A', accent: 'FFB347',
  bg: 'FFFBF7', text: '333333', light: '999999', white: 'FFFFFF',
  boy: '4DA6FF', girl: 'FF7EB3', baby: 'FFB347'
};

pptx.defineLayout({ name:'CUSTOM', width:13.33, height:7.5 });
pptx.layout = 'CUSTOM';

// ========================================
// Slide 1: Cover
// ========================================
{
  const s = pptx.addSlide();
  s.background = { fill: C.primary };
  s.addShape(pptx.ShapeType.ellipse, { x:9.5, y:-1, w:5, h:5, fill: { color:'FFFFFF', transparency:92 } });
  s.addShape(pptx.ShapeType.ellipse, { x:-1.5, y:4, w:4, h:4, fill: { color:'FFFFFF', transparency:93 } });
  s.addText('迎鑫童鞋', { x:1, y:1.8, w:8, h:1.5, fontSize:54, color:C.white, bold:true, fontFace:'Microsoft YaHei' });
  s.addText('线上商品展示系统', { x:1, y:3.3, w:8, h:0.8, fontSize:28, color:C.white, fontFace:'Microsoft YaHei' });
  s.addText('移动端童鞋商城 · 微信朋友圈展示 · 妈妈自己管商品', { x:1, y:4.3, w:10, h:0.6, fontSize:16, color:C.white, transparency:15, fontFace:'Microsoft YaHei' });
  s.addText('2026年5月', { x:1, y:5.5, w:4, h:0.5, fontSize:14, color:C.white, transparency:25, fontFace:'Microsoft YaHei' });
}

// ========================================
// Slide 2: Project Overview
// ========================================
{
  const s = pptx.addSlide();
  s.background = { fill: C.bg };
  s.addText('项目概述', { x:0.8, y:0.5, w:8, h:0.8, fontSize:30, color:C.text, bold:true, fontFace:'Microsoft YaHei' });
  s.addShape(pptx.ShapeType.rect, { x:0.8, y:1.3, w:1.5, h:0.06, fill: { color:C.primary } });

  const items = [
    { icon:'🎯', title:'项目定位', desc:'为黑龙江讷河市迎鑫童鞋店打造的移动端线上商品展示页，适合在微信中打开、分享给顾客浏览商品。' },
    { icon:'👩‍💼', title:'目标用户', desc:'店主（妈妈）：通过手机管理后台添加/编辑/上下架商品；顾客：微信打开链接浏览商品、联系店主。' },
    { icon:'📱', title:'访问方式', desc:'顾客通过微信群/朋友圈链接打开，管理后台通过固定网址 + 密码登录。手机、电脑均可访问。' },
    { icon:'💡', title:'设计理念', desc:'移动优先、操作极简。顾客无需注册登录，打开即看；妈妈无需懂电脑，后台表单即填即用。' }
  ];

  items.forEach(function(item, i) {
    const y = 1.8 + i * 1.3;
    s.addShape(pptx.ShapeType.roundRect, { x:0.8, y:y, w:11.5, h:1.1, fill:{color:C.white}, shadow:{type:'outer', blur:6, offset:2, color:'000000', opacity:0.08}, rectRadius:0.15 });
    s.addText(item.icon, { x:1.1, y:y+0.1, w:0.7, h:0.9, fontSize:28, align:'center', fontFace:'Microsoft YaHei' });
    s.addText(item.title, { x:2.0, y:y+0.1, w:9, h:0.4, fontSize:16, color:C.text, bold:true, fontFace:'Microsoft YaHei' });
    s.addText(item.desc, { x:2.0, y:y+0.5, w:9.8, h:0.5, fontSize:12, color:C.light, fontFace:'Microsoft YaHei' });
  });
}

// ========================================
// Slide 3: Architecture
// ========================================
{
  const s = pptx.addSlide();
  s.background = { fill: C.bg };
  s.addText('系统架构', { x:0.8, y:0.5, w:8, h:0.8, fontSize:30, color:C.text, bold:true, fontFace:'Microsoft YaHei' });
  s.addShape(pptx.ShapeType.rect, { x:0.8, y:1.3, w:1.5, h:0.06, fill: { color:C.primary } });

  const arch = [
    { label:'顾客端', sub:'手机/微信浏览器', color:C.boy, items:['首页 分类入口 + 推荐','商品列表 分类筛选','商品详情 尺码颜色','联系我们 电话微信'] },
    { label:'Cloudflare Pages', sub:'yingxin-tongxie.pages.dev', color:C.primary, items:['托管 HTML/CSS/JS','_worker.js 同域 API','全球 CDN 加速','拖拽上传部署'] },
    { label:'_worker.js', sub:'Pages Advanced Mode', color:C.accent, items:['商品 CRUD API','图片上传/返回','管理后台页面','密码验证'] },
    { label:'Cloudflare D1', sub:'SQLite 数据库', color:C.girl, items:['商品数据持久化','图片 base64 存储','免费 5GB 额度','云端自动备份'] }
  ];

  arch.forEach(function(a, i) {
    const x = 0.5 + i * 3.15;
    s.addShape(pptx.ShapeType.roundRect, { x:x, y:1.7, w:2.95, h:5.0, fill:{color:C.white}, shadow:{type:'outer', blur:4, offset:1, color:'000000', opacity:0.06}, rectRadius:0.12 });
    s.addShape(pptx.ShapeType.rect, { x:x, y:1.7, w:2.95, h:0.08, fill:{color:a.color} });
    s.addText(a.label, { x:x+0.2, y:1.95, w:2.5, h:0.45, fontSize:15, color:a.color, bold:true, fontFace:'Microsoft YaHei' });
    s.addText(a.sub, { x:x+0.2, y:2.35, w:2.5, h:0.3, fontSize:9, color:C.light, fontFace:'Microsoft YaHei' });
    a.items.forEach(function(item, j) {
      s.addText('▸ ' + item, { x:x+0.2, y:2.8 + j*0.45, w:2.5, h:0.35, fontSize:11, color:C.text, fontFace:'Microsoft YaHei' });
    });
  });
}

// ========================================
// Slide 4: Customer Pages
// ========================================
{
  const s = pptx.addSlide();
  s.background = { fill: C.bg };
  s.addText('顾客端页面', { x:0.8, y:0.5, w:8, h:0.8, fontSize:30, color:C.text, bold:true, fontFace:'Microsoft YaHei' });
  s.addShape(pptx.ShapeType.rect, { x:0.8, y:1.3, w:1.5, h:0.06, fill: { color:C.primary } });

  const pages = [
    { name:'首页', desc:'Hero 大图区\n三个分类入口（男童/女童/婴儿）\n精选推荐商品网格\n联系店主入口 + 底部导航', color:C.primary },
    { name:'商品列表', desc:'分类 Tab 切换\n有货优先排序显示\n双列瀑布流卡片\n无商品时友好提示', color:C.boy },
    { name:'商品详情', desc:'多图轮播展示\n可选尺码 / 可选颜色\n材质与描述信息\n一键联系店主按钮', color:C.girl },
    { name:'联系我们', desc:'一键拨打店主电话\n微信号点击复制\n地图导航到店\n营业时间 / 服务承诺', color:C.accent }
  ];

  pages.forEach(function(p, i) {
    const x = 0.5 + i * 3.15;
    s.addShape(pptx.ShapeType.roundRect, { x:x, y:1.7, w:2.95, h:4.8, fill:{color:C.white}, shadow:{type:'outer', blur:4, offset:1, color:'000000', opacity:0.06}, rectRadius:0.12 });
    s.addShape(pptx.ShapeType.roundRect, { x:x+0.3, y:2.0, w:2.35, h:0.7, fill:{color:p.color}, rectRadius:0.08 });
    s.addText(p.name, { x:x+0.3, y:2.0, w:2.35, h:0.7, fontSize:18, color:C.white, bold:true, align:'center', fontFace:'Microsoft YaHei' });
    s.addText(p.desc, { x:x+0.3, y:3.0, w:2.35, h:3.2, fontSize:12, color:C.text, lineSpacing:22, fontFace:'Microsoft YaHei' });
  });
}

// ========================================
// Slide 5: Admin Backend
// ========================================
{
  const s = pptx.addSlide();
  s.background = { fill: C.bg };
  s.addText('管理后台', { x:0.8, y:0.5, w:8, h:0.8, fontSize:30, color:C.text, bold:true, fontFace:'Microsoft YaHei' });
  s.addShape(pptx.ShapeType.rect, { x:0.8, y:1.3, w:1.5, h:0.06, fill: { color:C.primary } });

  const features = [
    { title:'密码登录', desc:'管理员通过密码进入后台。密码通过 Cloudflare Secret 加密存储，不在任何代码文件里写明文。', icon:'🔐' },
    { title:'商品管理', desc:'添加/编辑/删除商品。支持名称、分类、款式、价格、尺码、颜色、材质、描述，可勾选"首页推荐"和"上架中"。', icon:'📦' },
    { title:'图片上传', desc:'手机拍照或选相册，前端 Canvas 自动压缩（最长边 1200px + 多档质量），压缩后上传。妈妈无需手动处理图片。', icon:'📷' },
    { title:'上下架切换', desc:'一键切换商品上架/下架状态，顾客端实时同步。下架商品显示"已售罄"标记，不会从商品列表消失。', icon:'🔄' }
  ];

  features.forEach(function(f, i) {
    const y = 1.7 + i * 1.25;
    s.addShape(pptx.ShapeType.roundRect, { x:0.8, y:y, w:11.5, h:1.05, fill:{color:C.white}, shadow:{type:'outer', blur:3, offset:1, color:'000000', opacity:0.05}, rectRadius:0.1 });
    s.addText(f.icon, { x:1.1, y:y+0.1, w:0.6, h:0.8, fontSize:26, fontFace:'Microsoft YaHei' });
    s.addText(f.title, { x:1.9, y:y+0.08, w:3, h:0.35, fontSize:15, color:C.text, bold:true, fontFace:'Microsoft YaHei' });
    s.addText(f.desc, { x:1.9, y:y+0.45, w:9.8, h:0.5, fontSize:11, color:C.light, fontFace:'Microsoft YaHei' });
  });
}

// ========================================
// Slide 6: Key Highlights
// ========================================
{
  const s = pptx.addSlide();
  s.background = { fill: C.bg };
  s.addText('核心亮点', { x:0.8, y:0.5, w:8, h:0.8, fontSize:30, color:C.text, bold:true, fontFace:'Microsoft YaHei' });
  s.addShape(pptx.ShapeType.rect, { x:0.8, y:1.3, w:1.5, h:0.06, fill: { color:C.primary } });

  const cards = [
    { title:'移动优先', desc:'480px 容器居中\n大字大按钮大间距\n触控友好操作简单', color:C.primary },
    { title:'图片自动压缩', desc:'Canvas 前端压缩\n最长边 1200px\n目标 ≤500KB', color:C.boy },
    { title:'静态兜底', desc:'Worker 故障 / 网络异常\n自动降级静态数据\n顾客始终能看到商品', color:C.girl },
    { title:'秒开体验', desc:'Cloudflare 全球 CDN\n国内访问延迟低\n微信中打开即看', color:C.accent },
    { title:'零费用运行', desc:'全部免费计划\n无需绑定银行卡\n永远不产生费用', color:'4CAF50' },
    { title:'安全可靠', desc:'管理密码加密存储\n图片格式/大小校验\nD1 数据持久化', color:'9C27B0' }
  ];

  cards.forEach(function(card, i) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.8 + col * 4.0;
    const y = 1.7 + row * 2.7;
    s.addShape(pptx.ShapeType.roundRect, { x:x, y:y, w:3.7, h:2.4, fill:{color:C.white}, shadow:{type:'outer', blur:5, offset:2, color:'000000', opacity:0.06}, rectRadius:0.12 });
    s.addShape(pptx.ShapeType.rect, { x:x, y:y, w:3.7, h:0.07, fill:{color:card.color} });
    s.addText(card.title, { x:x+0.3, y:y+0.3, w:3.1, h:0.5, fontSize:20, color:card.color, bold:true, fontFace:'Microsoft YaHei' });
    s.addText(card.desc, { x:x+0.3, y:y+0.9, w:3.1, h:1.3, fontSize:13, color:C.light, lineSpacing:26, fontFace:'Microsoft YaHei' });
  });
}

// ========================================
// Slide 7: Cost
// ========================================
{
  const s = pptx.addSlide();
  s.background = { fill: C.bg };
  s.addText('费用说明', { x:0.8, y:0.5, w:8, h:0.8, fontSize:30, color:C.text, bold:true, fontFace:'Microsoft YaHei' });
  s.addShape(pptx.ShapeType.rect, { x:0.8, y:1.3, w:1.5, h:0.06, fill: { color:C.primary } });
  s.addText('全部使用 Cloudflare 免费计划，零费用运行', { x:0.8, y:1.7, w:10, h:0.5, fontSize:20, color:C.primary, bold:true, fontFace:'Microsoft YaHei' });

  const table = [
    ['服务', '免费额度', '本店用量', '月费'],
    ['Cloudflare Pages', '无限带宽', '顾客浏览', '¥0'],
    ['Cloudflare Workers', '10 万请求/天', '几十次/天', '¥0'],
    ['Cloudflare D1', '5GB 存储 / 500万读/天', '< 1MB / < 100次', '¥0'],
    ['图片存储', 'D1 base64', '几十张图', '¥0'],
    ['合计', '', '', '¥0 / 月']
  ];

  table.forEach(function(row, i) {
    const y = 2.5 + i * 0.7;
    const isHeader = i === 0;
    const isFooter = i === table.length - 1;
    const bgColor = (isHeader || isFooter) ? C.primary : C.white;
    const textColor = (isHeader || isFooter) ? C.white : C.text;
    s.addShape(pptx.ShapeType.roundRect, { x:1.5, y:y, w:10.3, h:0.55, fill:{color:bgColor}, rectRadius:0.06 });
    row.forEach(function(cell, j) {
      s.addText(cell, { x:1.5 + j*2.6, y:y+0.05, w:2.5, h:0.45, fontSize:13, color:textColor, bold:(isHeader||isFooter), align:'center', fontFace:'Microsoft YaHei' });
    });
  });

  s.addShape(pptx.ShapeType.roundRect, { x:2, y:6.2, w:9.3, h:0.7, fill:{color:'FFF0F0'}, rectRadius:0.1 });
  s.addText('无需绑定银行卡，无需信用卡，不涉及任何付费计划。只要不主动升级，永远不会被扣费。', { x:2.3, y:6.25, w:8.7, h:0.6, fontSize:13, color:C.dark, fontFace:'Microsoft YaHei' });
}

// ========================================
// Slide 8: Contact / Thank You
// ========================================
{
  const s = pptx.addSlide();
  s.background = { fill: C.primary };
  s.addShape(pptx.ShapeType.ellipse, { x:9, y:-1.5, w:6, h:6, fill: { color:'FFFFFF', transparency:92 } });
  s.addShape(pptx.ShapeType.ellipse, { x:-2, y:4, w:5, h:5, fill: { color:'FFFFFF', transparency:93 } });

  s.addText('谢谢！', { x:1, y:1.5, w:8, h:1.5, fontSize:54, color:C.white, bold:true, fontFace:'Microsoft YaHei' });
  s.addText('迎鑫童鞋 · 让宝贝的每一步都舒适健康', { x:1, y:3.2, w:10, h:0.7, fontSize:22, color:C.white, fontFace:'Microsoft YaHei' });

  s.addShape(pptx.ShapeType.roundRect, { x:1, y:4.3, w:11, h:0.05, fill:{color:'FFFFFF', transparency:60}, rectRadius:0.03 });

  const links = [
    '顾客页面: yingxin-tongxie.pages.dev',
    '管理后台: yingxin-tongxie.pages.dev/admin',
    '联系电话: 15164692421',
    '店铺地址: 黑龙江省齐齐哈尔市讷河市通江路238号'
  ];
  links.forEach(function(l, i) {
    s.addText(l, { x:1, y:4.7 + i*0.45, w:10, h:0.4, fontSize:14, color:C.white, transparency:20, fontFace:'Microsoft YaHei' });
  });
}

// Save
const outPath = 'C:/Users/1ok/tongxie-shop/迎鑫童鞋-项目介绍.pptx';
pptx.writeFile({ fileName: outPath }).then(function() {
  console.log('Created: ' + outPath);
}).catch(function(err) {
  console.error('Error:', err);
});
