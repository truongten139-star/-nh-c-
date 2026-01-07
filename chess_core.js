/* --- chess_core.js: BỘ NÃO & HỆ THỐNG KHỊA --- */

// KHO TÀNG "VÕ MỒM" CỦA AI
const TrashTalk = {
    start: ["Nhìn mặt là biết gà rồi.", "Đánh nhanh đi, tui còn đi ngủ.", "Chấp bạn đi trước đấy.", "Đừng để thua sớm quá nha."],
    winning: ["Đầu hàng đi cho đỡ nhục ní ơi.", "Cờ bí rồi à?", "Nước đi vào lòng đất.", "Tính kỹ chưa hay đánh bừa thế?", "Thôi xong, toang rồi ông giáo ạ!"],
    capture: ["Cảm ơn con hàng nhé!", "Non và xanh lắm.", "Ăn được con này sướng thế?", "Hiến tế à? Tui nhận nha."],
    check: ["Vua chạy đi đâu con sâu này!", "Chiếu tướng! Sợ chưa?", "Alo alo, Vua đâu rồi?"],
    undo: ["Sợ thua à mà Hoàn tác?", "Lại Undo, đánh kém thế?", "Cho lại 1 nước đấy, vẫn thua thôi.", "Chơi game ai lại Undo bao giờ?"],
    lose: ["Hack à? Sao hay thế?", "May mắn thôi nhé!", "Ván này nháp, làm lại ván nữa!"],
    
    speak(type) {
        const list = this[type];
        const msg = list[Math.floor(Math.random() * list.length)];
        const bubble = document.getElementById('ai-bubble');
        if(bubble) {
            bubble.innerText = msg;
            bubble.classList.add('show');
            // Tự tắt sau 3 giây
            setTimeout(() => bubble.classList.remove('show'), 3000);
        }
    }
};

const PST = {
    P: [[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]],
    N: [[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],[-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],[-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]],
    B: [[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]],
    K: [[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]]
};

const Chess = {
    IMG: { 'p': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg', 'P': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg', 'r': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg', 'R': 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg', 'n': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg', 'N': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg', 'b': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg', 'B': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg', 'q': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg', 'Q': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg', 'k': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg', 'K': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg' },
    
    board: [], turn: 'W', sel: null, history: [], gameOver: false,
    
    reset() {
        this.board = [['r','n','b','q','k','b','n','r'],['p','p','p','p','p','p','p','p'],['.','.','.','.','.','.','.','.'],['.','.','.','.','.','.','.','.'],['.','.','.','.','.','.','.','.'],['.','.','.','.','.','.','.','.'],['P','P','P','P','P','P','P','P'],['R','N','B','Q','K','B','N','R']];
        this.turn = 'W'; this.sel = null; this.history = []; this.gameOver = false;
        document.getElementById('lock-layer').style.display = 'none';
        this.updateStatus("LƯỢT CỦA BẠN");
        this.draw();
        this.updateEval();
        TrashTalk.speak('start'); // Khịa ngay khi bắt đầu
    },

    draw() {
        const box = document.getElementById('board-box');
        if(box.querySelectorAll('.tile').length === 0) {
            box.innerHTML = '<div id="lock-layer" class="board-lock"></div>';
            for(let i=0; i<64; i++) {
                let r=Math.floor(i/8), c=i%8, t=document.createElement('div');
                t.className = `tile ${(r+c)%2===0?'l':'d'}`;
                t.onclick = () => this.click(r, c); box.appendChild(t);
            }
        }
        
        const tiles = box.querySelectorAll('.tile');
        let moves = this.sel ? this.getMoves(this.sel.r, this.sel.c) : [];
        
        tiles.forEach((t, i) => {
            let r=Math.floor(i/8), c=i%8;
            t.className = `tile ${(r+c)%2===0?'l':'d'}`; t.innerHTML = '';
            
            if(this.sel?.r===r && this.sel?.c===c) t.classList.add('sel');
            if(moves.some(m => m.r===r && m.c===c)) t.classList.add('hint');
            
            const p = this.board[r][c];
            if(p !== '.') {
                const img = document.createElement('div'); img.className='piece';
                img.style.backgroundImage=`url(${this.IMG[p]})`; t.appendChild(img);
            }
        });
    },

    click(r, c) {
        if(this.turn !== 'W' || this.gameOver) return;
        const p = this.board[r][c];
        if(this.sel && this.getMoves(this.sel.r, this.sel.c).some(m => m.r===r && m.c===c)) {
            this.execute(this.sel.r, this.sel.c, r, c);
            if(!this.gameOver) {
                document.getElementById('lock-layer').style.display = 'block';
                this.updateStatus("AI ĐANG TÍNH...");
                setTimeout(() => this.aiMove(), 100);
            }
        } else if(p !== '.' && p === p.toUpperCase()) {
            this.sel = {r,c};
        } else {
            this.sel = null;
        }
        this.draw();
    },

    execute(r1, c1, r2, c2) {
        this.history.push(JSON.stringify(this.board));
        
        let p = this.board[r1][c1];
        const target = this.board[r2][c2]; // Quân bị ăn

        // Nếu AI ăn quân của bạn, nó sẽ khịa
        if(this.turn === 'B' && target !== '.') TrashTalk.speak('capture');

        if(p.toLowerCase() === 'p' && (r2 === 0 || r2 === 7)) {
            p = this.turn === 'W' ? 'Q' : 'q';
        }

        this.board[r2][c2] = p; this.board[r1][c1] = '.';
        
        if(this.isKingMissing()) {
            this.gameOver = true;
            if(this.turn === 'W') {
                this.updateStatus("BẠN THẮNG!");
                TrashTalk.speak('lose');
            } else {
                this.updateStatus("BẠN THUA!");
                TrashTalk.speak('winning'); // Thắng rồi khịa thêm phát nữa
            }
        }

        this.turn = this.turn === 'W' ? 'B' : 'W'; 
        this.sel = null;
        this.updateEval();
    },

    isKingMissing() {
        let wk=false, bk=false;
        for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
            if(this.board[r][c]==='K') wk=true;
            if(this.board[r][c]==='k') bk=true;
        }
        return !wk || !bk;
    },

    undo() {
        if(this.history.length > 1 && !this.gameOver) {
            this.history.pop();
            this.board = JSON.parse(this.history.pop());
            this.turn = 'W'; this.draw(); this.updateEval();
            this.updateStatus("LƯỢT CỦA BẠN");
            TrashTalk.speak('undo'); // Khịa khi undo
        }
    },

    updateStatus(msg) { document.getElementById('game-status').innerText = msg; },

    // --- AI LOGIC ---
    aiMove() {
        const depth = 3; 
        const bestMove = this.minimaxRoot(depth, true);
        
        if(bestMove) {
            // Check nếu nước đi này ăn quân thì chuẩn bị khịa
            if(this.board[bestMove.t.r][bestMove.t.c] !== '.') TrashTalk.speak('capture');
            
            this.execute(bestMove.f.r, bestMove.f.c, bestMove.t.r, bestMove.t.c);
            
            // Nếu AI đang thắng thế lớn (Điểm > 200), khịa kiểu bề trên
            if(this.evaluate() < -200) TrashTalk.speak('winning');

        } else {
            this.gameOver = true;
            this.updateStatus("BẠN THẮNG (AI BÍ)!");
        }
        
        document.getElementById('lock-layer').style.display = 'none';
        if(!this.gameOver) this.updateStatus("LƯỢT CỦA BẠN");
        this.draw();
    },

    minimaxRoot(depth, isMax) {
        const moves = this.getAllMoves('B');
        let bestMove = null;
        let bestValue = -Infinity;
        moves.sort(() => Math.random() - 0.5);
        for(let m of moves) {
            const saved = JSON.stringify(this.board);
            this.board[m.t.r][m.t.c] = this.board[m.f.r][m.f.c]; this.board[m.f.r][m.f.c] = '.';
            const value = this.minimax(depth - 1, -Infinity, Infinity, false);
            this.board = JSON.parse(saved);
            if(value > bestValue) { bestValue = value; bestMove = m; }
        }
        return bestMove;
    },

    minimax(depth, alpha, beta, isMax) {
        if(depth === 0) return -this.evaluate();
        const moves = this.getAllMoves(isMax ? 'W' : 'B');
        if(moves.length === 0) return isMax ? -Infinity : Infinity;

        if (isMax) {
            let maxEval = -Infinity;
            for(let m of moves) {
                const saved = JSON.stringify(this.board);
                this.board[m.t.r][m.t.c] = this.board[m.f.r][m.f.c]; this.board[m.f.r][m.f.c] = '.';
                const eval = this.minimax(depth - 1, alpha, beta, false);
                this.board = JSON.parse(saved);
                maxEval = Math.max(maxEval, eval);
                alpha = Math.max(alpha, eval);
                if(beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for(let m of moves) {
                const saved = JSON.stringify(this.board);
                this.board[m.t.r][m.t.c] = this.board[m.f.r][m.f.c]; this.board[m.f.r][m.f.c] = '.';
                const eval = this.minimax(depth - 1, alpha, beta, true);
                this.board = JSON.parse(saved);
                minEval = Math.min(minEval, eval);
                beta = Math.min(beta, eval);
                if(beta <= alpha) break;
            }
            return minEval;
        }
    },

    evaluate() {
        let score = 0;
        const weights = { p:100, n:320, b:330, r:500, q:900, k:20000 };
        for(let r=0; r<8; r++) for(let c=0; c<8; c++) {
            const p = this.board[r][c];
            if(p === '.') continue;
            const type = p.toUpperCase();
            const isWhite = p === type;
            const pstVal = (PST[type] ? PST[type][isWhite?r:7-r][c] : 0);
            const val = weights[p.toLowerCase()] + pstVal;
            score += isWhite ? val : -val;
        }
        return score;
    },

    updateEval() {
        const score = this.evaluate();
        const bar = document.getElementById('eval-fill');
        if(bar) {
            let percent = 50 + (score / 20); 
            percent = Math.max(5, Math.min(95, percent));
            bar.style.width = percent + '%';
        }
    },

    getAllMoves(side) {
        let ms = [];
        for(let r=0; r<8; r++) for(let c=0; c<8; c++) {
            const p = this.board[r][c];
            if(p !== '.' && (side==='W' ? p===p.toUpperCase() : p===p.toLowerCase())) {
                this.getMoves(r, c).forEach(t => ms.push({f:{r,c}, t:t}));
            }
        }
        return ms;
    },

    getMoves(r, c) {
        let moves = [];
        for(let i=0; i<8; i++) for(let j=0; j<8; j++) if(this.can(r, c, i, j)) moves.push({r:i, c:j});
        return moves;
    },
    
    can(r1, c1, r2, c2) {
        const p = this.board[r1][c1].toLowerCase(), t = this.board[r2][c2];
        const isW = this.board[r1][c1] === this.board[r1][c1].toUpperCase();
        if(t !== '.' && (t === t.toUpperCase()) === isW) return false;
        const dr = r2-r1, dc = c2-c1;
        if(p==='p') {
            const d = isW ? -1 : 1;
            if(dc===0 && dr===d && t==='.') return true;
            if(dc===0 && dr===d*2 && t==='.' && (isW?r1===6:r1===1) && this.board[r1+d][c1]==='.') return true;
            return Math.abs(dc)===1 && dr===d && t!=='.';
        }
        if(p==='r') return (dr===0 || dc===0) && this.clear(r1,c1,r2,c2);
        if(p==='b') return Math.abs(dr)===Math.abs(dc) && this.clear(r1,c1,r2,c2);
        if(p==='q') return (dr===0 || dc===0 || Math.abs(dr)===Math.abs(dc)) && this.clear(r1,c1,r2,c2);
        if(p==='n') return (Math.abs(dr)===2&&Math.abs(dc)===1)||(Math.abs(dr)===1&&Math.abs(dc)===2);
        if(p==='k') return Math.abs(dr)<=1 && Math.abs(dc)<=1;
        return false;
    },
    clear(r1, c1, r2, c2) {
        let dr=Math.sign(r2-r1), dc=Math.sign(c2-c1), r=r1+dr, c=c1+dc;
        while(r!==r2 || c!==c2) { if(this.board[r][c]!=='.') return false; r+=dr; c+=dc; }
        return true;
    }
};
