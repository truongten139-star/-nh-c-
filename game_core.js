/* --- OCEAN OS v39: NIGHTMARE AI EDITION --- */

const App = {
    init() {
        // Intro mượt, chống treo v38
        setTimeout(() => { const bar = document.getElementById('boot-bar'); if(bar) bar.style.width = '100%'; }, 100);
        setTimeout(() => {
            const intro = document.getElementById('intro-layer');
            if(intro) {
                intro.style.opacity = '0';
                setTimeout(() => { intro.style.display = 'none'; }, 500);
            }
        }, 2500); 
        Downloads.render();
    },
    switchTab(id) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        event.currentTarget.classList.add('active');
    }
};

// --- KHO TẢI ---
const Downloads = {
    tab: 'mc',
    data: {
        mc: [
            { name: "Gun Mod 3D v5", desc: "Súng ngắm, AK47, Shotgun", icon: "🔫", col: "#10b981" },
            { name: "Realistic Shader", desc: "Nước, mây cực đẹp", icon: "☀️", col: "#f59e0b" },
            { name: "One Piece Addon", desc: "Trái ác quỷ & Haki", icon: "🏴‍☠️", col: "#ef4444" }
        ],
        lq: [
            { name: "Flo Tinh Hệ", desc: "Full Effect + Sound", icon: "🌸", col: "#d946ef" },
            { name: "Nakroth Lôi Quang", desc: "Mod Skin SS Tuyệt Sắc", icon: "⚡", col: "#3b82f6" },
            { name: "Murad Siêu Việt", desc: "Biến về ảo diệu", icon: "⚔️", col: "#0ea5e9" }
        ]
    },
    switch(t) {
        this.tab = t;
        document.querySelectorAll('.sub-tab').forEach(e => e.classList.remove('active'));
        document.getElementById(`btn-${t}`).classList.add('active');
        this.render();
    },
    render() {
        const list = this.data[this.tab];
        document.getElementById('dl-list').innerHTML = list.map(i => `
            <div class="item" onclick="alert('Bắt đầu tải: ${i.name}')">
                <div class="i-icon" style="color:${i.col}; background:${i.col}15">${i.icon}</div>
                <div style="flex:1"><b>${i.name}</b><p style="font-size:12px; opacity:0.6">${i.desc}</p></div>
                <button class="btn-dl">TẢI</button>
            </div>
        `).join('');
    }
};

// --- GAME SYSTEM ---
const Game = {
    current: null, mode: 'ai',
    openMenu(gameType) { this.current = gameType; document.getElementById('modal-mode').style.display = 'flex'; },
    start(selectedMode) {
        this.mode = selectedMode; document.getElementById('modal-mode').style.display = 'none'; document.getElementById('game-ui').classList.add('show');
        const title = this.current === 'chess' ? "MASTER CHESS" : "CARO X-O";
        const sub = this.mode === 'ai' ? (this.current === 'chess' ? "NIGHTMARE AI" : "UNBEATABLE AI") : "1 VS 1 PLAYER";
        document.getElementById('g-title').innerHTML = `${title} <span style="font-size:12px; color:#ef4444; margin-left:10px; font-weight:bold">${sub}</span>`;
        if (this.current === 'chess') Chess.init(); else XO.init();
    },
    close() { document.getElementById('game-ui').classList.remove('show'); },
    end(msg) { document.getElementById('res-txt').innerText = msg; document.getElementById('res-sub').innerText = "Game Over"; document.getElementById('res-modal').style.display = 'flex'; },
    reset() { document.getElementById('res-modal').style.display = 'none'; if (this.current === 'chess') Chess.init(); else XO.init(); }
};

// --- XO (UNBEATABLE MINIMAX) ---
const XO = {
    b: [], turn: 'X', active: false,
    init() { this.b = Array(9).fill(null); this.turn = 'X'; this.active = true; this.render(); this.status(); },
    render() { document.getElementById('board-area').innerHTML = `<div class="xo-board">${this.b.map((c, i) => `<div class="xo-cell ${c||''}" onclick="XO.move(${i})">${c||''}</div>`).join('')}</div>`; },
    move(i) {
        if (!this.active || this.b[i]) return;
        this.b[i] = this.turn; this.render();
        if (this.checkWin()) return;
        this.turn = this.turn === 'X' ? 'O' : 'X'; this.status();
        if (Game.mode === 'ai' && this.turn === 'O') setTimeout(() => this.ai(), 300);
    },
    status() { document.getElementById('g-stt').innerText = (Game.mode === 'ai' && this.turn === 'O') ? "AI ĐANG TÍNH..." : `LƯỢT CỦA ${this.turn}`; },
    checkWin() {
        const w = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for (let l of w) { if (this.b[l[0]] && this.b[l[0]] === this.b[l[1]] && this.b[l[0]] === this.b[l[2]]) { this.active = false; Game.end(this.b[l[0]] === 'X' ? "BẠN THẮNG!" : "AI THẮNG!"); return true; } }
        if (!this.b.includes(null)) { this.active = false; Game.end("HÒA!"); return true; } return false;
    },
    ai() { let best = -Infinity, mv; for(let i=0; i<9; i++) if(!this.b[i]) { this.b[i] = 'O'; let s = this.minimax(this.b, 0, false); this.b[i] = null; if(s > best) { best = s; mv = i; } } this.move(mv); },
    minimax(b, d, isMax) {
        const w = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for (let l of w) if(b[l[0]] && b[l[0]]===b[l[1]] && b[l[0]]===b[l[2]]) return b[l[0]]==='O' ? 10-d : d-10;
        if (!b.includes(null)) return 0;
        if(isMax) { let best = -Infinity; for(let i=0; i<9; i++) if(!b[i]) { b[i]='O'; best = Math.max(best, this.minimax(b, d+1, false)); b[i]=null; } return best; } else { let best = Infinity; for(let i=0; i<9; i++) if(!b[i]) { b[i]='X'; best = Math.min(best, this.minimax(b, d+1, true)); b[i]=null; } return best; }
    }
};

// --- CHESS (NIGHTMARE AI ENGINE) ---
const Chess = {
    b: [], turn: 'w', sel: null,
    // Trọng số quân cờ
    weights: { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 },
    // Bảng vị trí (Ưu tiên quân Mã/Tốt ở giữa, Vua ở góc)
    pst: {
        p: [[0,0,0,0,0,0,0,0],[5,5,5,5,5,5,5,5],[1,1,2,3,3,2,1,1],[0.5,0.5,1,2.5,2.5,1,0.5,0.5],[0,0,0,2,2,0,0,0],[0.5,-0.5,-1,0,0,-1,-0.5,0.5],[0.5,1,1,-2,-2,1,1,0.5],[0,0,0,0,0,0,0,0]],
        n: [[-5,-4,-3,-3,-3,-3,-4,-5],[-4,-2,0,0,0,0,-2,-4],[-3,0,1,1.5,1.5,1,0,-3],[-3,0.5,1.5,2,2,1.5,0.5,-3],[-3,0,1.5,2,2,1.5,0,-3],[-3,0.5,1,1.5,1.5,1,0.5,-3],[-4,-2,0,0.5,0.5,0,-2,-4],[-5,-4,-3,-3,-3,-3,-4,-5]],
        b: [[-2,-1,-1,-1,-1,-1,-1,-2],[-1,0,0,0,0,0,0,-1],[-1,0,0.5,1,1,0.5,0,-1],[-1,0.5,0.5,1,1,0.5,0.5,-1],[-1,0,1,1,1,1,0,-1],[-1,1,1,1,1,1,1,-1],[-1,0.5,0,0,0,0,0.5,-1],[-2,-1,-1,-1,-1,-1,-1,-2]],
        r: [[0,0,0,0,0,0,0,0],[0.5,1,1,1,1,1,1,0.5],[-0.5,0,0,0,0,0,0,-0.5],[-0.5,0,0,0,0,0,0,-0.5],[-0.5,0,0,0,0,0,0,-0.5],[-0.5,0,0,0,0,0,0,-0.5],[-0.5,0,0,0,0,0,0,-0.5],[0,0,0,0.5,0.5,0,0,0]],
        q: [[-2,-1,-1,-0.5,-0.5,-1,-1,-2],[-1,0,0,0,0,0,0,-1],[-1,0,0.5,0.5,0.5,0.5,0,-1],[-0.5,0,0.5,0.5,0.5,0.5,0,-0.5],[0,0,0.5,0.5,0.5,0.5,0,-0.5],[-1,0.5,0.5,0.5,0.5,0.5,0,-1],[-1,0,0.5,0,0,0,0,-1],[-2,-1,-1,-0.5,-0.5,-1,-1,-2]],
        k: [[-3,-4,-4,-5,-5,-4,-4,-3],[-3,-4,-4,-5,-5,-4,-4,-3],[-3,-4,-4,-5,-5,-4,-4,-3],[-3,-4,-4,-5,-5,-4,-4,-3],[-2,-3,-3,-4,-4,-3,-3,-2],[-1,-2,-2,-2,-2,-2,-2,-1],[2,2,0,0,0,0,2,2],[2,3,1,0,0,1,3,2]]
    },

    init() {
        this.b = [['r','n','b','q','k','b','n','r'], ['p','p','p','p','p','p','p','p'], [0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0], ['P','P','P','P','P','P','P','P'], ['R','N','B','Q','K','B','N','R']];
        this.turn = 'w'; this.sel = null; this.render(); this.status();
    },
    render() {
        const area = document.getElementById('board-area'); area.innerHTML = ''; const boardDiv = document.createElement('div'); boardDiv.className = 'chess-board';
        const validMoves = this.sel ? this.getMoves(this.sel.r, this.sel.c) : [];
        for(let r=0; r<8; r++) { for(let c=0; c<8; c++) { const sq = document.createElement('div'); sq.className = `sq ${(r+c)%2===0 ? 'l' : 'd'}`; if(this.sel?.r===r && this.sel?.c===c) sq.classList.add('sel'); if(validMoves.find(m => m.r===r && m.c===c)) sq.classList.add(this.b[r][c] ? 'cap' : 'hint'); if(this.b[r][c]) { const pc = document.createElement('div'); const code = this.b[r][c]; const color = code === code.toUpperCase() ? 'w' : 'b'; pc.className = 'pc'; pc.style.backgroundImage = `url('https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${color}${code.toLowerCase()}.png')`; sq.appendChild(pc); } sq.onclick = () => this.click(r, c); boardDiv.appendChild(sq); } } area.appendChild(boardDiv);
    },
    click(r, c) {
        if(Game.mode === 'ai' && this.turn === 'b') return;
        if(this.sel) { const validMoves = this.getMoves(this.sel.r, this.sel.c); if(validMoves.find(m => m.r===r && m.c===c)) { this.exec(this.sel.r, this.sel.c, r, c); return; } }
        const p = this.b[r][c]; if(p) { const isMyPiece = (this.turn === 'w' && p === p.toUpperCase()) || (this.turn === 'b' && p === p.toLowerCase()); if(isMyPiece) { this.sel = {r, c}; this.render(); } else { this.sel = null; this.render(); } } else { this.sel = null; this.render(); }
    },
    exec(r1, c1, r2, c2) {
        this.b[r2][c2] = this.b[r1][c1]; this.b[r1][c1] = 0;
        if(this.b[r2][c2].toLowerCase() === 'p' && (r2===0 || r2===7)) this.b[r2][c2] = this.turn === 'w' ? 'Q' : 'q';
        if(!this.b.flat().includes('k')) { Game.end("TRẮNG THẮNG!"); return; } if(!this.b.flat().includes('K')) { Game.end("ĐEN THẮNG!"); return; }
        this.turn = this.turn === 'w' ? 'b' : 'w'; this.sel = null; this.render(); this.status();
        if(Game.mode === 'ai' && this.turn === 'b') { setTimeout(() => this.aiBestMove(), 100); }
    },
    status() { document.getElementById('g-stt').innerText = (Game.mode === 'ai' && this.turn === 'b') ? "AI ĐANG TÍNH (Hard)..." : `Lượt: ${this.turn==='w'?'Trắng':'Đen'}`; },
    
    // --- NIGHTMARE AI LOGIC (MINIMAX + ALPHA-BETA) ---
    aiBestMove() {
        // Độ sâu tìm kiếm: 3 (Nghĩ trước 3 bước). Đừng tăng lên 4 nếu không muốn treo máy!
        let bestMove = this.minimaxRoot(3, true); 
        if(bestMove) this.exec(bestMove.f.r, bestMove.f.c, bestMove.t.r, bestMove.t.c);
        else Game.end("BẠN THẮNG!"); // AI hết nước đi
    },
    evaluate() {
        let score = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let p = this.b[r][c];
                if (!p) continue;
                let val = this.weights[p.toLowerCase()] || 0;
                // Thêm điểm vị trí (PST)
                let pstVal = this.pst[p.toLowerCase()] ? this.pst[p.toLowerCase()][p===p.toUpperCase()?r:7-r][c] : 0;
                val += pstVal;
                score += (p === p.toUpperCase()) ? val : -val; // Trắng +, Đen -
            }
        }
        return score; // Trắng muốn điểm cao, Đen muốn điểm thấp
    },
    minimaxRoot(depth, isMax) {
        let newGameMoves = this.getAllMoves('b'); // AI là quân đen
        let bestMove = -Infinity;
        let bestMoveFound;

        // Xáo trộn nước đi để AI không đánh giống hệt nhau mỗi ván
        newGameMoves.sort(() => Math.random() - 0.5);

        for(let i = 0; i < newGameMoves.length; i++) {
            let m = newGameMoves[i];
            let temp = this.b[m.t.r][m.t.c];
            this.b[m.t.r][m.t.c] = this.b[m.f.r][m.f.c]; this.b[m.f.r][m.f.c] = 0; // Đi thử
            let value = this.minimax(depth - 1, -Infinity, Infinity, !isMax);
            this.b[m.f.r][m.f.c] = this.b[m.t.r][m.t.c]; this.b[m.t.r][m.t.c] = temp; // Hoàn tác

            if(value >= bestMove) { bestMove = value; bestMoveFound = m; }
        }
        return bestMoveFound;
    },
    minimax(depth, alpha, beta, isMax) {
        if (depth === 0) return -this.evaluate(); // Đảo dấu vì AI là đen (Minimizing player trong logic chuẩn, nhưng ở đây ta cần max điểm cho đen)
        
        let newGameMoves = this.getAllMoves(isMax ? 'b' : 'w');
        if (newGameMoves.length === 0) return isMax ? -9999 : 9999; // Hết nước đi

        if (isMax) {
            let bestMove = -Infinity;
            for (let i = 0; i < newGameMoves.length; i++) {
                let m = newGameMoves[i];
                let temp = this.b[m.t.r][m.t.c];
                this.b[m.t.r][m.t.c] = this.b[m.f.r][m.f.c]; this.b[m.f.r][m.f.c] = 0;
                bestMove = Math.max(bestMove, this.minimax(depth - 1, alpha, beta, !isMax));
                this.b[m.f.r][m.f.c] = this.b[m.t.r][m.t.c]; this.b[m.t.r][m.t.c] = temp;
                alpha = Math.max(alpha, bestMove);
                if (beta <= alpha) return bestMove;
            }
            return bestMove;
        } else {
            let bestMove = Infinity;
            for (let i = 0; i < newGameMoves.length; i++) {
                let m = newGameMoves[i];
                let temp = this.b[m.t.r][m.t.c];
                this.b[m.t.r][m.t.c] = this.b[m.f.r][m.f.c]; this.b[m.f.r][m.f.c] = 0;
                bestMove = Math.min(bestMove, this.minimax(depth - 1, alpha, beta, !isMax));
                this.b[m.f.r][m.f.c] = this.b[m.t.r][m.t.c]; this.b[m.t.r][m.t.c] = temp;
                beta = Math.min(beta, bestMove);
                if (beta <= alpha) return bestMove;
            }
            return bestMove;
        }
    },
    getAllMoves(color) {
        let moves = [];
        for(let r=0; r<8; r++) for(let c=0; c<8; c++) {
            let p = this.b[r][c];
            if(p && ((color==='w' && p===p.toUpperCase()) || (color==='b' && p===p.toLowerCase()))) {
                let ms = this.getMoves(r, c);
                ms.forEach(m => moves.push({f:{r,c}, t:m}));
            }
        }
        return moves;
    },
    getMoves(r, c) { // Logic tìm nước đi cũ (Giữ nguyên cho nhẹ)
        let ms = []; const p = this.b[r][c], w = p === p.toUpperCase(); const dirs = { n:[[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]], b:[[1,1],[1,-1],[-1,1],[-1,-1]], r:[[1,0],[-1,0],[0,1],[0,-1]], q:[[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]], k:[[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]] };
        const add = (r, c) => { if(r>=0&&r<8&&c>=0&&c<8) { const t = this.b[r][c]; if(!t) return true; if(w !== (t===t.toUpperCase())) return 'cap'; } return false; };
        if(p.toLowerCase() === 'p') { let k = w?-1:1; if(add(r+k, c) === true) { ms.push({r:r+k, c}); if((w?r===6:r===1) && add(r+2*k, c) === true) ms.push({r:r+2*k, c}); } [-1,1].forEach(z => { if(add(r+k, c+z) === 'cap') ms.push({r:r+k, c:c+z}); }); } else if(dirs[p.toLowerCase()]) { dirs[p.toLowerCase()].forEach(d => { let x = r+d[0], y = c+d[1]; while(true) { let res = add(x, y); if(!res) break; ms.push({r:x, c:y}); if(res === 'cap' || "nk".includes(p.toLowerCase())) break; x += d[0]; y += d[1]; } }); } return ms;
    }
};

window.onload = App.init;
