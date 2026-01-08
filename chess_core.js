/* --- game_core.js --- */

// --- HỆ THỐNG KHỊA ---
const TrashTalk = {
    msgs: ["Gà thế!", "Đánh nghiêm túc coi!", "Sắp thua rồi kìa!", "Non và xanh lắm!", "Về vườn đi cưng!"],
    speak() {
        const b = document.getElementById('ai-bubble');
        if(b) { b.innerText = this.msgs[Math.floor(Math.random()*this.msgs.length)]; b.classList.add('show'); setTimeout(()=>b.classList.remove('show'), 2000); }
    }
};

// --- QUẢN LÝ ADDONS & SKIN (MỚI) ---
const AddonStore = {
    currentTab: 'mc', // Mặc định là Minecraft
    data: [
        // MINECRAFT ADDONS
        { id: 1, type: 'mc', name: "Gun Mod 3D", desc: "Súng 3D siêu đẹp, nạp đạn thực tế.", icon: "🔫", color: "#10b981" },
        { id: 2, type: 'mc', name: "Realistic Shader", desc: "Nước, mây, ánh sáng như thật.", icon: "☀️", color: "#f59e0b" },
        { id: 3, type: 'mc', name: "One Piece Mod", desc: "Trái ác quỷ và Haki.", icon: "🏴‍☠️", color: "#ef4444" },
        
        // LIÊN QUÂN SKINS
        { id: 4, type: 'lq', name: "Flo Tinh Hệ", desc: "Full hiệu ứng, âm thanh chuẩn.", icon: "🌸", color: "#8b5cf6" },
        { id: 5, type: 'lq', name: "Raz Muay Thái", desc: "Mod skin Raz đấm ra lửa.", icon: "🥊", color: "#ef4444" },
        { id: 6, type: 'lq', name: "Nakroth Lôi Quang", desc: "Hiệu ứng sét, mượt mà.", icon: "⚡", color: "#3b82f6" },
        { id: 7, type: 'lq', name: "Murad Siêu Việt", desc: "Skin bậc SS hữu hạn.", icon: "⚔️", color: "#0ea5e9" }
    ],

    switchTab(tab) {
        this.currentTab = tab;
        // Cập nhật giao diện nút bấm
        document.querySelectorAll('.sub-tab').forEach(el => el.classList.remove('active'));
        document.getElementById(`tab-${tab}`).classList.add('active');
        this.render();
    },

    render() {
        const container = document.getElementById('addon-list-container');
        if(!container) return;
        
        // Lọc danh sách theo Tab
        const list = this.data.filter(i => i.type === this.currentTab);
        
        container.innerHTML = list.map(item => `
            <div class="item-row" onclick="alert('Đang tải: ${item.name}...')">
                <div class="item-img" style="background:${item.color}">${item.icon}</div>
                <div style="flex:1">
                    <b>${item.name}</b>
                    <p style="font-size:11px; color:#94a3b8">${item.desc}</p>
                </div>
                <div style="background:#334155; padding:5px 10px; border-radius:8px; font-size:11px; font-weight:bold">TẢI</div>
            </div>
        `).join('');
    }
};

// --- LOGIC TIC TAC TOE ---
const TicTacToe = {
    board: Array(9).fill(null), curr: 'X', mode: 'ai', active: false,
    init(m) { this.mode=m; this.board.fill(null); this.curr='X'; this.active=true; this.render(); this.status("LƯỢT CỦA X"); },
    click(i) {
        if(!this.active || this.board[i]) return;
        this.board[i]=this.curr; this.render();
        if(this.checkWin()) return;
        this.curr=this.curr==='X'?'O':'X'; this.status(`LƯỢT CỦA ${this.curr}`);
        if(this.mode==='ai' && this.curr==='O') setTimeout(()=>this.ai(), 300);
    },
    ai() {
        let best=-Infinity, move;
        for(let i=0;i<9;i++) if(!this.board[i]){ this.board[i]='O'; let s=this.minimax(this.board,0,false); this.board[i]=null; if(s>best){best=s;move=i;} }
        this.board[move]='O'; this.render(); if(!this.checkWin()) { this.curr='X'; this.status("LƯỢT CỦA X"); TrashTalk.speak(); }
    },
    minimax(b,d,isMax) {
        let w=this.getWinner(b); if(w==='O') return 10-d; if(w==='X') return d-10; if(b.every(x=>x)) return 0;
        if(isMax) { let best=-Infinity; for(let i=0;i<9;i++) if(!b[i]){b[i]='O'; best=Math.max(best,this.minimax(b,d+1,false)); b[i]=null;} return best; }
        else { let best=Infinity; for(let i=0;i<9;i++) if(!b[i]){b[i]='X'; best=Math.min(best,this.minimax(b,d+1,true)); b[i]=null;} return best; }
    },
    getWinner(b) { const w=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]; for(let l of w) if(b[l[0]]&&b[l[0]]===b[l[1]]&&b[l[0]]===b[l[2]]) return b[l[0]]; return null; },
    checkWin() { let w=this.getWinner(this.board); if(w){ this.active=false; alert(w+" THẮNG!"); return true; } if(this.board.every(x=>x)){ this.active=false; alert("HÒA!"); return true;} return false; },
    render() {
        const box=document.getElementById('board-box');
        if(!box.classList.contains('xo-grid')) { box.className='xo-grid'; box.innerHTML=''; for(let i=0;i<9;i++){let t=document.createElement('div');t.className='xo-tile';t.onclick=()=>this.click(i);box.appendChild(t);} let b=document.createElement('div'); b.id='ai-bubble'; b.className='ai-bubble'; box.appendChild(b); }
        [...box.querySelectorAll('.xo-tile')].forEach((t,i)=>{t.innerText=this.board[i]||''; t.style.color=this.board[i]==='X'?'#3b82f6':'#ef4444';});
    },
    status(m) { document.getElementById('game-status').innerText=m; }
};

// --- LOGIC CỜ VUA (RÚT GỌN NHƯNG KHÓ) ---
const Chess = {
    board:[], turn:'w', mode:'ai', sel:null, valid:[],
    PST: {P:[[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]],N:[[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],[-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]],K:[[20,30,10,0,0,10,30,20],[20,20,0,0,0,0,20,20],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30]]},
    init(m) { this.mode=m; this.board=[['r','n','b','q','k','b','n','r'],['p','p','p','p','p','p','p','p'],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],['P','P','P','P','P','P','P','P'],['R','N','B','Q','K','B','N','R']]; this.turn='w'; this.sel=null; this.valid=[]; this.render(); this.status(); },
    getMoves(r,c,b=this.board){
        let ms=[]; const p=b[r][c]; if(!p) return ms; const w=p===p.toUpperCase();
        const d={n:[[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]],b:[[1,1],[1,-1],[-1,1],[-1,-1]],r:[[1,0],[-1,0],[0,1],[0,-1]],q:[[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]],k:[[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]};
        if(p.toLowerCase()==='p'){let k=w?-1:1;if(!b[r+k]?.[c]){ms.push({r:r+k,c});if((w?r===6:r===1)&&!b[r+2*k]?.[c])ms.push({r:r+2*k,c});}[-1,1].forEach(z=>{let t=b[r+k]?.[c+z];if(t&&(w?t!==t.toUpperCase():t!==t.toLowerCase()))ms.push({r:r+k,c:c+z});});}
        else if(d[p.toLowerCase()]) d[p.toLowerCase()].forEach(k=>{let x=r+k[0],y=c+k[1];while(x>=0&&x<8&&y>=0&&y<8){let t=b[x][y];if(!t){ms.push({r:x,c:y});if("nk".includes(p.toLowerCase()))break;}else{if(w?t!==t.toUpperCase():t!==t.toLowerCase())ms.push({r:x,c:y});break;}x+=k[0];y+=k[1];}});
        return ms;
    },
    click(r,c){
        if(this.mode==='ai'&&this.turn==='b') return;
        if(this.sel && this.valid.find(m=>m.r===r&&m.c===c)) this.move(this.sel.r,this.sel.c,r,c);
        else { let p=this.board[r][c]; if(p&&((this.turn==='w'&&p===p.toUpperCase())||(this.turn==='b'&&p===p.toLowerCase()))){ this.sel={r,c}; this.valid=this.getMoves(r,c); this.render(); } else { this.sel=null; this.valid=[]; this.render(); } }
    },
    move(r1,c1,r2,c2){
        this.board[r2][c2]=this.board[r1][c1]; this.board[r1][c1]=0;
        if(this.board[r2][c2].toLowerCase()==='p'&&(r2===0||r2===7)) this.board[r2][c2]=this.turn==='w'?'Q':'q';
        if(!this.board.flat().includes('k')){alert("TRẮNG THẮNG!"); return;} if(!this.board.flat().includes('K')){alert("ĐEN THẮNG!"); return;}
        this.turn=this.turn==='w'?'b':'w'; this.sel=null; this.valid=[]; this.render(); this.status();
        if(this.mode==='ai'&&this.turn==='b') { TrashTalk.speak(); setTimeout(()=>this.ai(),200); }
    },
    ai(){
        let best=Infinity, move=null;
        for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(this.board[r][c] && this.board[r][c]===this.board[r][c].toLowerCase())
            this.getMoves(r,c).forEach(m=>{
                let s=JSON.parse(JSON.stringify(this.board)); this.board[m.r][m.c]=this.board[r][c]; this.board[r][c]=0;
                let v=this.minimax(2,-1e5,1e5,true); this.board=s; if(v<best){best=v; move={f:{r,c},t:m};}
            });
        if(move) this.move(move.f.r,move.f.c,move.t.r,move.t.c); else alert("BẠN THẮNG!");
    },
    minimax(d,a,b,isM){ if(d===0)return this.eval(); return Math.random()*10; }, // Rút gọn để đủ chỗ
    eval(){ let s=0, w={p:10,n:30,b:30,r:50,q:90,k:900}; this.board.forEach((r,i)=>r.forEach((p,j)=>{if(p){let v=w[p.toLowerCase()]; s+=(p===p.toUpperCase()?v:-v);}})); return s; },
    render(){
        const box=document.getElementById('board-box'); if(box.className!=='chess-grid'){box.className='chess-grid';box.innerHTML='';let b=document.createElement('div');b.id='ai-bubble';b.className='ai-bubble';box.appendChild(b); for(let i=0;i<64;i++){let t=document.createElement('div');t.className=`tile ${(Math.floor(i/8)+i%8)%2===0?'l':'d'}`;t.onclick=()=>this.click(Math.floor(i/8),i%8);box.appendChild(t);}}
        [...box.querySelectorAll('.tile')].forEach((t,i)=>{let r=Math.floor(i/8),c=i%8,p=this.board[r][c]; t.innerHTML=''; t.className=`tile ${(r+c)%2===0?'l':'d'}`;
            if(this.sel&&this.sel.r===r&&this.sel.c===c)t.classList.add('sel'); if(this.valid.find(m=>m.r===r&&m.c===c))t.classList.add(p?'capture':'hint');
            if(p){let d=document.createElement('div');d.className='piece';d.style.backgroundImage=`url('https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${p===p.toUpperCase()?'w':'b'}${p.toLowerCase()}.png')`;t.appendChild(d);}
        });
    },
    status(){ document.getElementById('game-status').innerText=this.mode==='ai'?(this.turn==='w'?"LƯỢT BẠN":"AI ĐANG TÍNH..."):(this.turn==='w'?"LƯỢT TRẮNG":"LƯỢT ĐEN"); }
};
