/* --- game_core.js: BỘ NÃO XỬ LÝ TOÀN BỘ GAME & ADDONS --- */

// 1. QUẢN LÝ KHO TẢI VỀ (Fix lỗi không chuyển tab)
const AddonManager = {
    currentTab: 'mc', // Mặc định là Minecraft
    
    // Dữ liệu Addon
    data: {
        mc: [
            { name: "Gun Mod 3D", desc: "Súng 3D siêu đẹp, nạp đạn thực tế", icon: "🔫", col: "#10b981" },
            { name: "Realistic Shader", desc: "Nước, mây, ánh sáng như thật", icon: "☀️", col: "#f59e0b" },
            { name: "One Piece Mod", desc: "Trái ác quỷ và Haki bá đạo", icon: "🏴‍☠️", col: "#ef4444" },
            { name: "Better UI", desc: "Giao diện tối giản, FPS cao", icon: "🖥️", col: "#3b82f6" }
        ],
        lq: [
            { name: "Flo Tinh Hệ", desc: "Full hiệu ứng kỹ năng, âm thanh", icon: "🌸", col: "#8b5cf6" },
            { name: "Raz Muay Thái", desc: "Mod skin Raz đấm ra lửa", icon: "🥊", col: "#ef4444" },
            { name: "Nakroth Lôi Quang", desc: "Skin mượt, giảm giật lag", icon: "⚡", col: "#3b82f6" },
            { name: "Murad Siêu Việt", desc: "Hiệu ứng biến về cực xịn", icon: "⚔️", col: "#0ea5e9" }
        ]
    },

    // Hàm chuyển Tab
    switchTab(tab) {
        this.currentTab = tab;
        
        // Cập nhật giao diện nút bấm
        document.querySelectorAll('.sub-tab').forEach(el => el.classList.remove('active'));
        if(tab === 'mc') document.getElementById('btn-mc').classList.add('active');
        if(tab === 'lq') document.getElementById('btn-lq').classList.add('active');
        
        // Vẽ lại danh sách
        this.render();
    },

    // Hàm hiển thị danh sách
    render() {
        const container = document.getElementById('addon-list-container');
        if(!container) return;
        
        const list = this.data[this.currentTab];
        
        container.innerHTML = list.map(item => `
            <div class="item-row" onclick="alert('Đang bắt đầu tải: ${item.name}...')">
                <div class="item-img" style="background:${item.col}">${item.icon}</div>
                <div style="flex:1">
                    <b>${item.name}</b>
                    <p style="font-size:11px; color:#94a3b8">${item.desc}</p>
                </div>
                <div class="dl-btn">TẢI</div>
            </div>
        `).join('');
    }
};

// 2. LOGIC CARO (X-O) BẤT BẠI
const TicTacToe = {
    board: Array(9).fill(null), curr: 'X', mode: 'ai', active: false,
    
    init(m) { 
        this.mode = m; 
        this.board.fill(null); 
        this.curr = 'X'; 
        this.active = true; 
        this.render(); 
        this.status("LƯỢT CỦA X"); 
    },

    click(i) {
        if(!this.active || this.board[i]) return;
        this.board[i] = this.curr;
        this.render();
        
        if(this.checkWin()) return;
        
        this.curr = this.curr === 'X' ? 'O' : 'X';
        this.status(`LƯỢT CỦA ${this.curr}`);
        
        if(this.mode === 'ai' && this.curr === 'O') {
            setTimeout(() => this.ai(), 300);
        }
    },

    // AI Minimax (Không thể thua)
    ai() {
        let best = -Infinity, move;
        for(let i=0; i<9; i++) {
            if(!this.board[i]) {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false);
                this.board[i] = null;
                if(score > best) { best = score; move = i; }
            }
        }
        if(move !== undefined) {
            this.board[move] = 'O';
            this.render();
            if(!this.checkWin()) {
                this.curr = 'X';
                this.status("LƯỢT CỦA X");
            }
        }
    },

    minimax(b, depth, isMax) {
        let result = this.checkWinner(b);
        if(result === 'O') return 10 - depth;
        if(result === 'X') return depth - 10;
        if(b.every(x => x)) return 0;

        if(isMax) {
            let best = -Infinity;
            for(let i=0; i<9; i++) {
                if(!b[i]) { b[i] = 'O'; best = Math.max(best, this.minimax(b, depth+1, false)); b[i] = null; }
            }
            return best;
        } else {
            let best = Infinity;
            for(let i=0; i<9; i++) {
                if(!b[i]) { b[i] = 'X'; best = Math.min(best, this.minimax(b, depth+1, true)); b[i] = null; }
            }
            return best;
        }
    },

    checkWinner(b) {
        const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for(let w of wins) {
            if(b[w[0]] && b[w[0]] === b[w[1]] && b[w[0]] === b[w[2]]) return b[w[0]];
        }
        return null;
    },

    checkWin() {
        let w = this.checkWinner(this.board);
        if(w) { alert(w + " THẮNG!"); this.active = false; return true; }
        if(this.board.every(x => x)) { alert("HÒA!"); this.active = false; return true; }
        return false;
    },

    render() {
        const box = document.getElementById('board-box');
        box.className = 'xo-grid'; // Đổi style sang lưới X-O
        box.innerHTML = '';
        for(let i=0; i<9; i++) {
            let t = document.createElement('div');
            t.className = 'xo-tile';
            t.innerText = this.board[i] || '';
            t.style.color = this.board[i] === 'X' ? '#3b82f6' : '#ef4444';
            t.onclick = () => this.click(i);
            box.appendChild(t);
        }
    },

    status(msg) { document.getElementById('game-status').innerText = msg; }
};

// 3. LOGIC CỜ VUA (CHESS)
const Chess = {
    board: [], turn: 'w', mode: 'ai', sel: null, valid: [],
    
    // Khởi tạo bàn cờ
    init(m) {
        this.mode = m;
        this.board = [
            ['r','n','b','q','k','b','n','r'],
            ['p','p','p','p','p','p','p','p'],
            [0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],
            ['P','P','P','P','P','P','P','P'],
            ['R','N','B','Q','K','B','N','R']
        ];
        this.turn = 'w'; this.sel = null; this.valid = [];
        this.render(); this.status();
    },

    // Lấy nước đi hợp lệ
    getMoves(r, c) {
        let moves = []; 
        const p = this.board[r][c]; 
        if(!p) return moves;
        const isWhite = p === p.toUpperCase();
        
        // Logic di chuyển cơ bản
        const steps = {
            n: [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]],
            b: [[1,1],[1,-1],[-1,1],[-1,-1]],
            r: [[1,0],[-1,0],[0,1],[0,-1]],
            q: [[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]],
            k: [[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]
        };

        if(p.toLowerCase() === 'p') {
            let dir = isWhite ? -1 : 1;
            // Đi thẳng
            if(!this.board[r+dir]?.[c]) {
                moves.push({r:r+dir, c:c});
                if((isWhite && r===6) || (!isWhite && r===1)) {
                    if(!this.board[r+dir*2]?.[c]) moves.push({r:r+dir*2, c:c});
                }
            }
            // Ăn chéo
            [-1, 1].forEach(offset => {
                let target = this.board[r+dir]?.[c+offset];
                if(target && (isWhite ? target===target.toLowerCase() : target===target.toUpperCase())) {
                    moves.push({r:r+dir, c:c+offset});
                }
            });
        } 
        else if(steps[p.toLowerCase()]) {
            steps[p.toLowerCase()].forEach(step => {
                let x = r + step[0], y = c + step[1];
                while(x>=0 && x<8 && y>=0 && y<8) {
                    let target = this.board[x][y];
                    if(!target) {
                        moves.push({r:x, c:y});
                        if(['n','k'].includes(p.toLowerCase())) break;
                    } else {
                        if(isWhite ? target===target.toLowerCase() : target===target.toUpperCase()) {
                            moves.push({r:x, c:y});
                        }
                        break;
                    }
                    x += step[0]; y += step[1];
                }
            });
        }
        return moves;
    },

    click(r, c) {
        if(this.mode === 'ai' && this.turn === 'b') return; // Không cho click khi AI đang nghĩ

        // Nếu bấm vào ô đã được gợi ý -> Di chuyển
        if(this.sel && this.valid.find(m => m.r === r && m.c === c)) {
            this.move(this.sel.r, this.sel.c, r, c);
        } 
        // Chọn quân mới
        else {
            let p = this.board[r][c];
            if(p && ((this.turn === 'w' && p === p.toUpperCase()) || (this.turn === 'b' && p === p.toLowerCase()))) {
                this.sel = {r, c};
                this.valid = this.getMoves(r, c);
                this.render();
            } else {
                this.sel = null; this.valid = []; this.render();
            }
        }
    },

    move(r1, c1, r2, c2) {
        this.board[r2][c2] = this.board[r1][c1];
        this.board[r1][c1] = 0;
        
        // Phong cấp Tốt
        if(this.board[r2][c2].toLowerCase() === 'p' && (r2 === 0 || r2 === 7)) {
            this.board[r2][c2] = this.turn === 'w' ? 'Q' : 'q';
        }

        // Kiểm tra thắng thua (Mất Vua)
        if(!this.board.flat().includes('k')) { alert("TRẮNG THẮNG!"); return; }
        if(!this.board.flat().includes('K')) { alert("ĐEN THẮNG!"); return; }

        this.turn = this.turn === 'w' ? 'b' : 'w';
        this.sel = null; 
        this.valid = []; 
        this.render(); 
        this.status();

        if(this.mode === 'ai' && this.turn === 'b') {
            setTimeout(() => this.aiMove(), 200);
        }
    },

    aiMove() {
        let allMoves = [];
        for(let r=0; r<8; r++) {
            for(let c=0; c<8; c++) {
                if(this.board[r][c] && this.board[r][c] === this.board[r][c].toLowerCase()) {
                    this.getMoves(r, c).forEach(m => {
                        // Tính điểm đơn giản: Ăn quân = điểm cao
                        let score = this.board[m.r][m.c] ? 10 : Math.random();
                        allMoves.push({from:{r,c}, to:m, score: score});
                    });
                }
            }
        }

        if(allMoves.length > 0) {
            allMoves.sort((a, b) => b.score - a.score); // Chọn nước đi điểm cao nhất
            let best = allMoves[0];
            this.move(best.from.r, best.from.c, best.to.r, best.to.c);
        } else {
            alert("BẠN THẮNG!");
        }
    },

    render() {
        const box = document.getElementById('board-box');
        box.className = 'chess-grid'; // Đổi style sang bàn cờ vua
        box.innerHTML = '';

        for(let i=0; i<64; i++) {
            let r = Math.floor(i/8);
            let c = i%8;
            let p = this.board[r][c];
            
            let t = document.createElement('div');
            t.className = `tile ${(r+c)%2===0 ? 'l' : 'd'}`;
            
            if(this.sel && this.sel.r === r && this.sel.c === c) t.classList.add('sel');
            if(this.valid.find(m => m.r === r && m.c === c)) t.classList.add(p ? 'capture' : 'hint');

            if(p) {
                let piece = document.createElement('div');
                piece.className = 'piece';
                // Link ảnh quân cờ
                piece.style.backgroundImage = `url('https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${p===p.toUpperCase()?'w':'b'}${p.toLowerCase()}.png')`;
                t.appendChild(piece);
            }
            
            t.onclick = () => this.click(r, c);
            box.appendChild(t);
        }
    },

    status() {
        let msg = this.mode === 'ai' ? 
            (this.turn === 'w' ? "LƯỢT CỦA BẠN" : "AI ĐANG TÍNH...") : 
            (this.turn === 'w' ? "LƯỢT TRẮNG" : "LƯỢT ĐEN");
        document.getElementById('game-status').innerText = msg;
    }
};

// Khởi chạy mặc định danh sách Addon khi tải trang
AddonManager.render();