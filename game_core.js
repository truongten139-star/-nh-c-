/* --- game_core.js: BỘ NÃO SIÊU CẤP V33 --- */

// --- QUẢN LÝ GIAO DIỆN & ADDONS ---
const UI = {
    showResult(msg) {
        document.getElementById('result-msg').innerText = msg;
        document.getElementById('result-modal').style.display = 'flex';
    },
    hideResult() {
        document.getElementById('result-modal').style.display = 'none';
        GameManager.reset();
    }
};

const AddonManager = {
    currentTab: 'mc',
    data: {
        mc: [
            { name: "Gun Mod 3D", desc: "Súng 3D cực ngầu", icon: "🔫", col: "#10b981" },
            { name: "Realistic Shader", desc: "Đồ họa 4K siêu thực", icon: "☀️", col: "#f59e0b" },
            { name: "One Piece", desc: "Trái ác quỷ & Haki", icon: "🏴‍☠️", col: "#ef4444" }
        ],
        lq: [
            { name: "Flo Tinh Hệ", desc: "Full hiệu ứng, múa cực mượt", icon: "🌸", col: "#8b5cf6" },
            { name: "Raz Muay Thái", desc: "Âm thanh đấm đá chân thực", icon: "🥊", col: "#ef4444" },
            { name: "Nakroth Lôi Quang", desc: "Skin SS hữu hạn", icon: "⚡", col: "#3b82f6" }
        ]
    },
    switchTab(tab) {
        this.currentTab = tab;
        document.querySelectorAll('.sub-tab').forEach(el => el.classList.remove('active'));
        if(tab==='mc') document.getElementById('btn-mc').classList.add('active');
        else document.getElementById('btn-lq').classList.add('active');
        this.render();
    },
    render() {
        const container = document.getElementById('addon-list-container');
        if(!container) return;
        const list = this.data[this.currentTab];
        container.innerHTML = list.map(item => `
            <div class="item-row" onclick="alert('Đang tải: ${item.name}...')">
                <div class="item-img" style="background:${item.col}">${item.icon}</div>
                <div style="flex:1"><b>${item.name}</b><p>${item.desc}</p></div>
                <div class="dl-btn">TẢI</div>
            </div>
        `).join('');
    }
};

// --- GAME 1: TIC TAC TOE (BẤT BẠI) ---
const TicTacToe = {
    board: Array(9).fill(null), curr: 'X', mode: 'ai', active: false,
    init(m) { this.mode=m; this.board.fill(null); this.curr='X'; this.active=true; this.render(); this.status("LƯỢT CỦA X"); },
    
    click(i) {
        if(!this.active || this.board[i]) return;
        this.move(i, this.curr);
        if(!this.active) return;
        if(this.mode === 'ai' && this.curr === 'O') setTimeout(() => this.ai(), 300);
    },
    
    move(i, p) {
        this.board[i] = p; this.render();
        const win = this.checkWinState(this.board);
        if(win) { this.active=false; UI.showResult(win==='Tie' ? "HÒA CÂN NÃO!" : (win==='X'?"BẠN THẮNG!":"AI THẮNG!")); return; }
        this.curr = this.curr==='X'?'O':'X'; this.status(`LƯỢT CỦA ${this.curr}`);
    },

    // AI Minimax Tuyển Thủ (Không thể thua)
    ai() {
        let bestScore = -Infinity, move;
        for(let i=0; i<9; i++) {
            if(!this.board[i]) {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false);
                this.board[i] = null;
                if(score > bestScore) { bestScore = score; move = i; }
            }
        }
        this.move(move, 'O');
    },

    minimax(board, depth, isMaximizing) {
        let result = this.checkWinState(board);
        if(result === 'O') return 10 - depth;
        if(result === 'X') return depth - 10;
        if(result === 'Tie') return 0;

        if(isMaximizing) {
            let bestScore = -Infinity;
            for(let i=0; i<9; i++) {
                if(!board[i]) { board[i] = 'O'; let score = this.minimax(board, depth + 1, false); board[i] = null; bestScore = Math.max(score, bestScore); }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for(let i=0; i<9; i++) {
                if(!board[i]) { board[i] = 'X'; let score = this.minimax(board, depth + 1, true); board[i] = null; bestScore = Math.min(score, bestScore); }
            }
            return bestScore;
        }
    },

    checkWinState(b) {
        const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for(let c of wins) if(b[c[0]] && b[c[0]]===b[c[1]] && b[c[0]]===b[c[2]]) return b[c[0]];
        return b.includes(null) ? null : 'Tie';
    },

    render() {
        const box = document.getElementById('board-box');
        box.className = 'xo-grid'; box.innerHTML = '';
        this.board.forEach((cell, i) => {
            let t = document.createElement('div'); t.className = 'xo-tile';
            if(cell) { t.innerText = cell; t.classList.add(cell.toLowerCase()); }
            t.onclick = () => this.click(i);
            box.appendChild(t);
        });
    },
    status(msg) { document.getElementById('game-status').innerText = msg; }
};

// --- GAME 2: CỜ VUA (HARDCORE) ---
const Chess = {
    board: [], turn: 'w', mode: 'ai', sel: null, valid: [],
    // Bảng điểm vị trí (PST) - Giúp AI biết dàn quân
    pst: {
        p: [[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]],
        n: [[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],[-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]],
        k: [[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]]
    },

    init(m) { 
        this.mode = m; 
        this.board = [['r','n','b','q','k','b','n','r'],['p','p','p','p','p','p','p','p'],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],['P','P','P','P','P','P','P','P'],['R','N','B','Q','K','B','N','R']];
        this.turn = 'w'; this.sel = null; this.valid = []; this.render(); this.status();
    },

    click(r, c) {
        if(this.mode === 'ai' && this.turn === 'b') return;
        if(this.sel && this.valid.find(m => m.r === r && m.c === c)) {
            this.move(this.sel.r, this.sel.c, r, c);
        } else {
            let p = this.board[r][c];
            if(p && ((this.turn === 'w' && p === p.toUpperCase()) || (this.turn === 'b' && p === p.toLowerCase()))) {
                this.sel = {r, c}; this.valid = this.getMoves(r, c, this.board); this.render();
            } else { this.sel = null; this.valid = []; this.render(); }
        }
    },

    move(r1, c1, r2, c2) {
        this.board[r2][c2] = this.board[r1][c1]; this.board[r1][c1] = 0;
        if(this.board[r2][c2].toLowerCase() === 'p' && (r2 === 0 || r2 === 7)) this.board[r2][c2] = this.turn === 'w' ? 'Q' : 'q';
        
        if(!this.board.flat().includes('k')) { UI.showResult("TRẮNG THẮNG!"); return; }
        if(!this.board.flat().includes('K')) { UI.showResult("ĐEN THẮNG!"); return; }

        this.turn = this.turn === 'w' ? 'b' : 'w'; this.sel = null; this.valid = []; this.render(); this.status();
        if(this.mode === 'ai' && this.turn === 'b') setTimeout(() => this.aiMove(), 100);
    },

    // AI Evaluation (Tính điểm)
    eval(board) {
        let score = 0; const weights = { p:100, n:320, b:330, r:500, q:900, k:20000 };
        for(let r=0; r<8; r++) for(let c=0; c<8; c++) {
            let p = board[r][c];
            if(p) {
                let type = p.toLowerCase(), isW = p === p.toUpperCase();
                let val = weights[type] + (this.pst[type] ? (this.pst[type][isW?r:7-r][c]) : 0);
                score += isW ? val : -val;
            }
        }
        return score;
    },

    // AI Minimax Alpha-Beta Pruning (Tính sâu)
    aiMove() {
        let bestMove = null, bestVal = Infinity;
        let moves = this.getAllMoves('b');
        
        // Sắp xếp nước đi để cắt tỉa tốt hơn (ưu tiên ăn quân)
        moves.sort((a,b) => (this.board[b.t.r][b.t.c]?10:0) - (this.board[a.t.r][a.t.c]?10:0));

        for(let m of moves) {
            let saved = JSON.parse(JSON.stringify(this.board));
            this.board[m.t.r][m.t.c] = this.board[m.f.r][m.f.c]; this.board[m.f.r][m.f.c] = 0;
            let val = this.minimax(2, -Infinity, Infinity, true); // Depth 2 là đủ hành newbie, tăng lên 3 nếu muốn pro
            this.board = saved;
            if(val < bestVal) { bestVal = val; bestMove = m; }
        }
        if(bestMove) this.move(bestMove.f.r, bestMove.f.c, bestMove.t.r, bestMove.t.c);
        else UI.showResult("BẠN THẮNG! (AI HẾT NƯỚC)");
    },

    minimax(depth, alpha, beta, isMax) {
        if(depth === 0) return this.eval(this.board);
        if(isMax) {
            let maxEval = -Infinity;
            for(let m of this.getAllMoves('w')) {
                let saved = this.board[m.t.r][m.t.c], start = this.board[m.f.r][m.f.c];
                this.board[m.t.r][m.t.c] = start; this.board[m.f.r][m.f.c] = 0;
                let eval = this.minimax(depth - 1, alpha, beta, false);
                this.board[m.f.r][m.f.c] = start; this.board[m.t.r][m.t.c] = saved;
                maxEval = Math.max(maxEval, eval); alpha = Math.max(alpha, eval);
                if(beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for(let m of this.getAllMoves('b')) {
                let saved = this.board[m.t.r][m.t.c], start = this.board[m.f.r][m.f.c];
                this.board[m.t.r][m.t.c] = start; this.board[m.f.r][m.f.c] = 0;
                let eval = this.minimax(depth - 1, alpha, beta, true);
                this.board[m.f.r][m.f.c] = start; this.board[m.t.r][m.t.c] = saved;
                minEval = Math.min(minEval, eval); beta = Math.min(beta, eval);
                if(beta <= alpha) break;
            }
            return minEval;
        }
    },

    getAllMoves(color) {
        let ms = [];
        for(let r=0; r<8; r++) for(let c=0; c<8; c++) {
            let p = this.board[r][c];
            if(p && ((color==='w' && p===p.toUpperCase()) || (color==='b' && p===p.toLowerCase()))) {
                this.getMoves(r, c, this.board).forEach(m => ms.push({f:{r,c}, t:m}));
            }
        }
        return ms;
    },

    getMoves(r, c, b) {
        let ms = []; const p = b[r][c], w = p === p.toUpperCase();
        const d = {n:[[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]], b:[[1,1],[1,-1],[-1,1],[-1,-1]], r:[[1,0],[-1,0],[0,1],[0,-1]], q:[[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]], k:[[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]};
        
        if(p.toLowerCase()==='p'){
            let k=w?-1:1; if(!b[r+k]?.[c]){ms.push({r:r+k,c}); if((w?r===6:r===1)&&!b[r+2*k]?.[c])ms.push({r:r+2*k,c});}
            [-1,1].forEach(z=>{let t=b[r+k]?.[c+z]; if(t&&(w?t!==t.toUpperCase():t!==t.toLowerCase()))ms.push({r:r+k,c:c+z});});
        } else if(d[p.toLowerCase()]) {
            d[p.toLowerCase()].forEach(k=>{let x=r+k[0],y=c+k[1]; while(x>=0&&x<8&&y>=0&&y<8){let t=b[x][y]; if(!t){ms.push({r:x,c:y}); if("nk".includes(p.toLowerCase()))break;} else {if(w?t!==t.toUpperCase():t!==t.toLowerCase())ms.push({r:x,c:y}); break;} x+=k[0]; y+=k[1];}});
        }
        return ms;
    },

    render() {
        const box = document.getElementById('board-box'); box.className = 'chess-grid'; box.innerHTML = '';
        for(let i=0; i<64; i++) {
            let r=Math.floor(i/8), c=i%8, p=this.board[r][c], t=document.createElement('div');
            t.className = `tile ${(r+c)%2===0?'l':'d'}`;
            if(this.sel && this.sel.r===r && this.sel.c===c) t.classList.add('sel');
            if(this.valid.find(m=>m.r===r && m.c===c)) t.classList.add(p?'capture':'hint');
            if(p) { let d=document.createElement('div'); d.className='piece'; d.style.backgroundImage=`url('https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${p===p.toUpperCase()?'w':'b'}${p.toLowerCase()}.png')`; t.appendChild(d); }
            t.onclick=()=>this.click(r,c); box.appendChild(t);
        }
    },
    status() { document.getElementById('game-status').innerText = this.mode==='ai'?(this.turn==='w'?"LƯỢT BẠN":"AI ĐANG TÍNH..."):(this.turn==='w'?"LƯỢT TRẮNG":"LƯỢT ĐEN"); }
};

AddonManager.render();
