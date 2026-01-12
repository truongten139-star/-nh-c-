/* --- game_core.js: BỘ NÃO XỬ LÝ --- */

// 1. QUẢN LÝ ADDONS
const AddonManager = {
    tab: 'mc',
    data: {
        mc: [
            { name: "Gun Mod 3D", desc: "Vũ khí hiện đại", icon: "🔫", col: "#10b981" },
            { name: "Horror Mod", desc: "Ma kinh dị", icon: "👻", col: "#6366f1" },
            { name: "One Piece v5", desc: "Trái ác quỷ", icon: "🏴‍☠️", col: "#ef4444" },
            { name: "Shader 8K", desc: "Siêu thực tế", icon: "☀️", col: "#f59e0b" }
        ],
        lq: [
            { name: "Flo Tinh Hệ", desc: "Full Effect", icon: "🌸", col: "#d946ef" },
            { name: "Nakroth Lôi Quang", desc: "Mod Skin SS", icon: "⚡", col: "#3b82f6" },
            { name: "Raz Muay Thái", desc: "Âm thanh chuẩn", icon: "🥊", col: "#ef4444" }
        ]
    },
    switch(t) {
        this.tab = t;
        document.querySelectorAll('.sub-tab').forEach(e => e.classList.remove('active'));
        document.getElementById(`tab-${t}`).classList.add('active');
        this.render();
    },
    render() {
        const box = document.getElementById('addon-list');
        box.innerHTML = this.data[this.tab].map(i => `
            <div class="addon-item" onclick="alert('Đang tải: ${i.name}')">
                <div class="addon-icon" style="color:${i.col}; background:${i.col}20">${i.icon}</div>
                <div style="flex:1"><b>${i.name}</b><p style="font-size:12px; opacity:0.7">${i.desc}</p></div>
                <div class="btn-dl"><i class='bx bxs-download'></i></div>
            </div>
        `).join('');
    }
};

// 2. LOGIC CARO (X-O) BẤT BẠI
const XO = {
    b: Array(9).fill(null), turn: 'X', mode: 'ai', active: false,
    init(m) { this.mode=m; this.b.fill(null); this.turn='X'; this.active=true; this.render(); UI.status("LƯỢT CỦA BẠN (X)"); },
    click(i) {
        if(!this.active || this.b[i]) return;
        this.move(i, this.turn);
        if(!this.active) return;
        if(this.mode==='ai' && this.turn==='O') setTimeout(()=>this.ai(), 250);
    },
    move(i, p) {
        this.b[i] = p; this.render();
        let w = this.check(this.b);
        if(w) { this.active=false; UI.win(w==='Tie'?"HÒA!":(w==='X'?"BẠN THẮNG!":"AI THẮNG!")); return; }
        this.turn = this.turn==='X'?'O':'X';
        UI.status(this.mode==='ai'&&this.turn==='O' ? "AI ĐANG TÍNH..." : `LƯỢT CỦA ${this.turn}`);
    },
    ai() {
        let best=-Infinity, mv;
        for(let i=0;i<9;i++) if(!this.b[i]) { this.b[i]='O'; let s=this.minimax(this.b,0,false); this.b[i]=null; if(s>best){best=s; mv=i;} }
        this.move(mv, 'O');
    },
    minimax(b,d,isMax) {
        let w=this.check(b); if(w==='O') return 10-d; if(w==='X') return d-10; if(w==='Tie') return 0;
        if(isMax) { let best=-Infinity; for(let i=0;i<9;i++) if(!b[i]){b[i]='O'; best=Math.max(best,this.minimax(b,d+1,false)); b[i]=null;} return best; }
        else { let best=Infinity; for(let i=0;i<9;i++) if(!b[i]){b[i]='X'; best=Math.min(best,this.minimax(b,d+1,true)); b[i]=null;} return best; }
    },
    check(b) {
        const w=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for(let c of w) if(b[c[0]] && b[c[0]]===b[c[1]] && b[c[0]]===b[c[2]]) return b[c[0]];
        return b.includes(null)?null:'Tie';
    },
    render() {
        const box=document.getElementById('game-board'); box.className='xo-grid'; box.innerHTML='';
        this.b.forEach((c,i)=>{
            let d=document.createElement('div'); d.className=`xo-cell ${c?c.toLowerCase():''}`;
            d.innerText=c||''; d.onclick=()=>this.click(i); box.appendChild(d);
        });
    }
};

// 3. LOGIC CỜ VUA (HARDCORE)
const Chess = {
    b:[], turn:'w', mode:'ai', sel:null,
    init(m) {
        this.mode=m; this.turn='w'; this.sel=null;
        this.b=[['r','n','b','q','k','b','n','r'],['p','p','p','p','p','p','p','p'],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],['P','P','P','P','P','P','P','P'],['R','N','B','Q','K','B','N','R']];
        this.render(); UI.status("LƯỢT TRẮNG");
    },
    click(r,c) {
        if(this.mode==='ai' && this.turn==='b') return;
        let ms = this.sel ? this.getMs(this.sel.r, this.sel.c, this.b) : [];
        if(ms.find(m=>m.r===r && m.c===c)) {
            this.move(this.sel.r, this.sel.c, r, c);
        } else {
            let p=this.b[r][c];
            if(p && ((this.turn==='w' && p===p.toUpperCase()) || (this.turn==='b' && p===p.toLowerCase()))) {
                this.sel={r,c}; this.render();
            } else { this.sel=null; this.render(); }
        }
    },
    move(r1,c1,r2,c2) {
        this.b[r2][c2]=this.b[r1][c1]; this.b[r1][c1]=0;
        if(this.b[r2][c2].toLowerCase()==='p' && (r2===0||r2===7)) this.b[r2][c2]=this.turn==='w'?'Q':'q';
        if(!this.b.flat().includes('k')) return UI.win("TRẮNG THẮNG!");
        if(!this.b.flat().includes('K')) return UI.win("ĐEN THẮNG!");
        this.turn=this.turn==='w'?'b':'w'; this.sel=null; this.render();
        UI.status(this.mode==='ai' && this.turn==='b' ? "AI ĐANG TÍNH..." : (this.turn==='w'?"LƯỢT TRẮNG":"LƯỢT ĐEN"));
        if(this.mode==='ai' && this.turn==='b') setTimeout(()=>this.ai(), 50);
    },
    ai() {
        let ms=this.getAll('b'), best=null, max=-Infinity;
        if(ms.length===0) return UI.win("BẠN THẮNG!");
        ms.sort((a,b)=>(this.b[b.t.r][b.t.c]?10:0)-(this.b[a.t.r][a.t.c]?10:0)); // Ưu tiên ăn quân
        for(let m of ms) {
            let s=JSON.parse(JSON.stringify(this.b)); this.b[m.t.r][m.t.c]=this.b[m.f.r][m.f.c]; this.b[m.f.r][m.f.c]=0;
            let v = -this.minimax(1, -Infinity, Infinity, 'w'); this.b=s;
            if(v > max) { max=v; best=m; }
        }
        if(best) this.move(best.f.r, best.f.c, best.t.r, best.t.c);
    },
    minimax(d,a,b,t) {
        if(d===0) return this.eval(t);
        let ms=this.getAll(t), max=-Infinity;
        for(let m of ms) {
            let s=this.b[m.t.r][m.t.c], f=this.b[m.f.r][m.f.c]; this.b[m.t.r][m.t.c]=f; this.b[m.f.r][m.f.c]=0;
            let v = -this.minimax(d-1, -b, -a, t==='w'?'b':'w');
            this.b[m.f.r][m.f.c]=f; this.b[m.t.r][m.t.c]=s;
            max=Math.max(max,v); a=Math.max(a,v); if(a>=b) break;
        }
        return max;
    },
    eval(t) {
        let s=0, v={p:10,n:30,b:30,r:50,q:90,k:900};
        this.b.forEach(r=>r.forEach(p=>{if(p) s+=(p===p.toUpperCase()?v[p.toLowerCase()]:-v[p.toLowerCase()]);}));
        return t==='w'?s:-s;
    },
    getAll(c) {
        let ms=[]; this.b.forEach((r,i)=>r.forEach((p,j)=>{if(p&&((c==='w'&&p===p.toUpperCase())||(c==='b'&&p===p.toLowerCase()))) this.getMs(i,j,this.b).forEach(t=>ms.push({f:{r:i,c:j},t:t}));}));
        return ms;
    },
    getMs(r,c,b) {
        let ms=[], p=b[r][c], w=p===p.toUpperCase(), d={n:[[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]],b:[[1,1],[1,-1],[-1,1],[-1,-1]],r:[[1,0],[-1,0],[0,1],[0,-1]],q:[[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]],k:[[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]};
        if(p.toLowerCase()==='p'){let k=w?-1:1;if(!b[r+k]?.[c]){ms.push({r:r+k,c});if((w?r===6:r===1)&&!b[r+2*k]?.[c])ms.push({r:r+2*k,c});}[-1,1].forEach(z=>{let t=b[r+k]?.[c+z];if(t&&(w?t!==t.toUpperCase():t!==t.toLowerCase()))ms.push({r:r+k,c:c+z});});}
        else if(d[p.toLowerCase()]) d[p.toLowerCase()].forEach(k=>{let x=r+k[0],y=c+k[1];while(x>=0&&x<8&&y>=0&&y<8){let t=b[x][y];if(!t){ms.push({r:x,c:y});if("nk".includes(p.toLowerCase()))break;}else{if(w?t!==t.toUpperCase():t!==t.toLowerCase())ms.push({r:x,c:y});break;}x+=k[0];y+=k[1];}});
        return ms;
    },
    render() {
        const box=document.getElementById('game-board'); box.className='chess-grid'; box.innerHTML='';
        let ms = this.sel ? this.getMs(this.sel.r, this.sel.c, this.b) : [];
        for(let i=0;i<64;i++){
            let r=Math.floor(i/8), c=i%8, p=this.b[r][c], t=document.createElement('div');
            t.className=`tile ${(r+c)%2===0?'l':'d'}`;
            if(this.sel && this.sel.r===r && this.sel.c===c) t.classList.add('sel');
            if(ms.find(m=>m.r===r&&m.c===c)) t.classList.add(p?'capture':'hint');
            if(p){let d=document.createElement('div'); d.className='piece'; d.style.backgroundImage=`url('https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${p===p.toUpperCase()?'w':'b'}${p.toLowerCase()}.png')`; t.appendChild(d);}
            t.onclick=()=>this.click(r,c); box.appendChild(t);
        }
    }
};

// 4. QUẢN LÝ APP
const UI = {
    game: null,
    status(m) { document.getElementById('g-status').innerText=m; },
    win(m) { document.getElementById('res-msg').innerText=m; document.getElementById('res-msg').style.color=m.includes("THẮNG")?"#00f3ff":"#ff003c"; document.getElementById('modal-res').style.display='flex'; },
    menu(g) { this.game=g; document.getElementById('modal-mode').style.display='flex'; },
    start(m) {
        document.getElementById('modal-mode').style.display='none'; document.getElementById('game-view').style.display='flex';
        document.getElementById('g-title').innerText = this.game==='chess'?"CHESS PRO":"TIC TAC TOE";
        if(this.game==='chess') Chess.init(m); else XO.init(m);
    },
    reset() { if(this.game==='chess') Chess.init(Chess.mode); else XO.init(XO.mode); document.getElementById('modal-res').style.display='none'; }
};
AddonManager.render();
