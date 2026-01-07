/* --- chess_core.js: FULL VERSION (AI + 1VS1 + HINTS) --- */

// --- 1. KHO TÀNG "VÕ MỒM" ---
const TrashTalk = {
    start: ["Nhìn mặt là biết 'tấm chiếu mới'.", "Đánh nhanh đi, tui còn chạy deadline.", "Chấp đi trước, đừng thua sớm nhé.", "Biết chơi không hay bấm loạn xạ thế?"],
    winning: ["Đầu hàng đi cho đỡ nhục.", "Cờ bí rồi à? Gọi người thân đi.", "Nước đi vào lòng đất.", "Toang! Cụ đi chân lạnh toát."],
    capture: ["Cảm ơn con hàng nhé!", "Non và xanh lắm.", "Hiến tế à? Tui nhận hết.", "Mất quân cay không?"],
    check: ["Chạy đi đâu con sâu này!", "Chiếu tướng! Tim đập chân run chưa?", "Alo Vua đâu? Ra trình diện mau!"],
    undo: ["Sợ thua à mà Hoàn tác?", "Lại Undo? Đánh kém thì nhận đi.", "Chơi game ai lại Undo, hèn thế?"],
    lose: ["Hack à? Sao hay thế?", "Máy lag thôi, ván này không tính!", "Kinh đấy, nhưng chắc do may mắn."],
    wait: ["Ngủ gật rồi à?", "Tính gì lâu thế, đánh đại đi.", "Đợi bạn đi xong tui già đi 10 tuổi."],
    
    speak(type) {
        const list = this[type];
        if(!list) return;
        const msg = list[Math.floor(Math.random() * list.length)];
        const bubble = document.getElementById('ai-bubble');
        if(bubble) {
            bubble.innerText = msg;
            bubble.classList.add('show');
            clearTimeout(this.timer);
            this.timer = setTimeout(() => bubble.classList.remove('show'), 4000);
        }
    }
};

// --- 2. BẢNG ĐIỂM VỊ TRÍ (PST) ---
const PST = {
    P: [[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]],
    N: [[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],[-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],[-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]],
    B: [[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]],
    R: [[0,0,0,0,0,0,0,0],[5,10,10,10,10,10,10,5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0]],
    Q: [[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],[-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]],
    K: [[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]]
};

// --- 3. CORE CHESS ENGINE ---
const Chess = {
    IMG: { 'p': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg', 'P': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg', 'r': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg', 'R': 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg', 'n': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg', 'N': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg', 'b': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg', 'B': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg', 'q': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg', 'Q': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg', 'k': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg', 'K': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg' },
    
    board: [], 
    turn: 'W', 
    gameMode: 'ai', // 'ai' hoặc 'human'
    sel: null, 
    history: [], 
    gameOver: false,
    castling: { wq: true, wk: true, bq: true, bk: true },
    epSquare: null,

    init() {
        // Tạo khu vực nút bấm điều khiển
        const box = document.getElementById('board-box');
        let controls = document.getElementById('control-area');
        if(!controls) {
            controls = document.createElement('div');
            controls.id = 'control-area';
            box.parentNode.insertBefore(controls, box);
        }
        
        // Thêm nút Ván Mới và Chuyển chế độ
        controls.innerHTML = `
            <button class="btn-game" onclick="Chess.reset()">Ván Mới</button>
            <button class="btn-game mode" id="btn-mode" onclick="Chess.toggleMode()">Chế độ: Đấu AI</button>
        `;

        this.reset();
    },

    toggleMode() {
        this.gameMode = this.gameMode === 'ai' ? 'human' : 'ai';
        const btn = document.getElementById('btn-mode');
        if(btn) btn.innerText = this.gameMode === 'ai' ? 'Chế độ: Đấu AI' : 'Chế độ: 1 vs 1';
        this.reset();
    },

    reset() {
        this.board = [
            ['r','n','b','q','k','b','n','r'], ['p','p','p','p','p','p','p','p'],
            ['.','.','.','.','.','.','.','.'], ['.','.','.','.','.','.','.','.'],
            ['.','.','.','.','.','.','.','.'], ['.','.','.','.','.','.','.','.'],
            ['P','P','P','P','P','P','P','P'], ['R','N','B','Q','K','B','N','R']
        ];
        this.turn = 'W'; this.sel = null; this.history = []; this.gameOver = false;
        this.castling = { wq: true, wk: true, bq: true, bk: true };
        this.epSquare = null;
        
        document.getElementById('lock-layer').style.display = 'none';
        
        if(this.gameMode === 'human') this.updateStatus("LƯỢT TRẮNG (P1)");
        else this.updateStatus("LƯỢT CỦA BẠN");

        this.draw();
        this.updateEval();
        if(this.gameMode === 'ai') TrashTalk.speak('start');
    },

    draw() {
        const box = document.getElementById('board-box');
        if(box.querySelectorAll('.tile').length === 0) {
            box.innerHTML = '<div id="lock-layer" class="board-lock" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; z-index:99;"></div>';
            for(let i=0; i<64; i++) {
                let r=Math.floor(i/8), c=i%8, t=document.createElement('div');
                t.className = `tile ${(r+c)%2===0?'l':'d'}`;
                t.onclick = () => this.click(r, c); 
                t.id = `tile-${r}-${c}`;
                t.style.position = 'relative'; // Để đặt hint
                box.appendChild(t);
            }
        }
        
        const validMoves = this.sel ? this.getValidMoves(this.sel.r, this.sel.c) : [];
        const inCheckSide = this.inCheck(this.turn);

        for(let r=0; r<8; r++) {
            for(let c=0; c<8; c++) {
                const t = document.getElementById(`tile-${r}-${c}`);
                t.innerHTML = '';
                t.className = `tile ${(r+c)%2===0?'l':'d'}`; 
                
                // Highlight quân đang chọn
                if(this.sel?.r===r && this.sel?.c===c) t.classList.add('sel');
                
                // Highlight nước vừa đi
                if(this.history.length > 0) {
                    const lastMove = this.history[this.history.length-1].move;
                    if((lastMove.f.r===r && lastMove.f.c===c) || (lastMove.t.r===r && lastMove.t.c===c)) {
                        t.classList.add('last-move');
                    }
                }

                // Cảnh báo Vua bị chiếu
                const p = this.board[r][c];
                if(inCheckSide && p !== '.') {
                     const isKing = (this.turn === 'W' && p === 'K') || (this.turn === 'B' && p === 'k');
                     if(isKing) t.classList.add('in-check');
                }

                // --- HIỂN THỊ GỢI Ý (ĐI ĐƯỢC / ĂN ĐƯỢC) ---
                if(validMoves.some(m => m.r===r && m.c===c)) {
                    const mark = document.createElement('div');
                    // Nếu ô đó có quân HOẶC là bắt tốt qua đường -> hint-cap (viền đỏ)
                    const isCapture = this.board[r][c] !== '.' || (this.epSquare && r===this.epSquare.r && c===this.epSquare.c);
                    mark.className = isCapture ? 'hint-cap' : 'hint';
                    t.appendChild(mark);
                }
                
                if(p !== '.') {
                    const img = document.createElement('div'); img.className='piece';
                    img.style.backgroundImage=`url(${this.IMG[p]})`; 
                    t.appendChild(img);
                }
            }
        }
    },

    click(r, c) {
        if(this.gameOver) return;
        // CHỈ KHÓA KHI ĐÁNH VỚI AI VÀ ĐANG LÀ LƯỢT MÁY
        if(this.gameMode === 'ai' && this.turn === 'B') return; 

        const p = this.board[r][c];
        const isOwnPiece = p !== '.' && (this.turn === 'W' ? p === p.toUpperCase() : p === p.toLowerCase());

        if(this.sel && !isOwnPiece) {
            // Thử di chuyển
            const moves = this.getValidMoves(this.sel.r, this.sel.c);
            const move = moves.find(m => m.r === r && m.c === c);
            if(move) {
                this.makeMove(this.sel, {r,c}, move.special);
                return;
            }
        }
        
        if(isOwnPiece) {
            this.sel = {r,c};
            this.draw(); // Vẽ lại để hiện gợi ý
        } else {
            this.sel = null;
            this.draw();
        }
    },

    makeMove(from, to, special = null) {
        this.history.push({
            board: JSON.parse(JSON.stringify(this.board)),
            turn: this.turn,
            castling: {...this.castling},
            ep: this.epSquare,
            move: {f: from, t: to}
        });

        const piece = this.board[from.r][from.c];
        const target = this.board[to.r][to.c];

        if(this.gameMode === 'ai' && this.turn === 'B' && target !== '.') TrashTalk.speak('capture');

        this.board[to.r][to.c] = piece;
        this.board[from.r][from.c] = '.';

        if(special === 'castle-k') { this.board[from.r][5] = this.board[from.r][7]; this.board[from.r][7] = '.'; }
        else if(special === 'castle-q') { this.board[from.r][3] = this.board[from.r][0]; this.board[from.r][0] = '.'; }
        else if(special === 'ep') { this.board[from.r][to.c] = '.'; if(this.gameMode === 'ai') TrashTalk.speak('capture'); }
        else if(special === 'promo') { this.board[to.r][to.c] = this.turn === 'W' ? 'Q' : 'q'; }

        if(piece === 'K') { this.castling.wk = false; this.castling.wq = false; }
        if(piece === 'k') { this.castling.bk = false; this.castling.bq = false; }
        if(piece === 'R') {
            if(from.r===7 && from.c===0) this.castling.wq = false;
            if(from.r===7 && from.c===7) this.castling.wk = false;
        }
        if(piece === 'r') {
            if(from.r===0 && from.c===0) this.castling.bq = false;
            if(from.r===0 && from.c===7) this.castling.bk = false;
        }

        this.epSquare = null;
        if(piece.toLowerCase() === 'p' && Math.abs(to.r - from.r) === 2) {
            this.epSquare = { r: (from.r + to.r)/2, c: from.c };
        }

        this.turn = this.turn === 'W' ? 'B' : 'W';
        this.sel = null;
        
        const inCheck = this.inCheck(this.turn);
        if(inCheck && this.gameMode === 'ai' && this.turn === 'W') TrashTalk.speak('check');

        const possibleMoves = this.getAllMoves(this.turn);
        if(possibleMoves.length === 0) {
            this.gameOver = true;
            if(inCheck) {
                const winner = this.turn === 'W' ? "ĐEN THẮNG" : "TRẮNG THẮNG";
                this.updateStatus(winner);
                if(this.gameMode === 'ai') TrashTalk.speak(this.turn === 'W' ? 'winning' : 'lose');
            } else {
                this.updateStatus("HÒA (CỜ BÍ)");
            }
        } else {
            if(this.gameMode === 'human') this.updateStatus(this.turn === 'W' ? "LƯỢT TRẮNG (P1)" : "LƯỢT ĐEN (P2)");
            else this.updateStatus(this.turn === 'W' ? "LƯỢT CỦA BẠN" : "AI ĐANG TÍNH...");
        }

        this.updateEval();
        this.draw();

        // CHỈ GỌI AI NẾU ĐANG CHƠI CHẾ ĐỘ AI
        if(!this.gameOver && this.gameMode === 'ai' && this.turn === 'B') {
            const lock = document.getElementById('lock-layer');
            if(lock) lock.style.display = 'block';
            setTimeout(() => this.aiMove(), 50);
        } else {
             const lock = document.getElementById('lock-layer');
             if(lock) lock.style.display = 'none';
        }
        
        if(!this.gameOver && this.gameMode === 'ai' && this.turn === 'W') {
             clearTimeout(this.waitTimer);
             this.waitTimer = setTimeout(() => TrashTalk.speak('wait'), 15000);
        }
    },

    undo() {
        if(this.history.length === 0) return;
        let steps = (this.gameMode === 'ai' && this.turn === 'W' && !this.gameOver) ? 2 : 1;
        
        while(steps > 0 && this.history.length > 0) {
            const state = this.history.pop();
            this.board = state.board;
            this.turn = state.turn;
            this.castling = state.castling;
            this.epSquare = state.ep;
            steps--;
        }
        this.gameOver = false; this.sel = null;
        this.draw(); this.updateEval();
        if(this.gameMode === 'ai') {
            this.updateStatus("LƯỢT CỦA BẠN");
            TrashTalk.speak('undo');
        } else {
            this.updateStatus(this.turn === 'W' ? "LƯỢT TRẮNG (P1)" : "LƯỢT ĐEN (P2)");
        }
    },

    getValidMoves(r, c) {
        const moves = this.getPseudoMoves(r, c);
        const valid = [];
        for(let m of moves) {
            const saveBoard = JSON.parse(JSON.stringify(this.board));
            const saveEp = this.epSquare;
            this.board[m.r][m.c] = this.board[r][c];
            this.board[r][c] = '.';
            if(m.special === 'ep') this.board[r][m.c] = '.';
            
            if(!this.inCheck(this.turn)) valid.push(m);
            
            this.board = saveBoard; this.epSquare = saveEp;
        }
        return valid;
    },

    getPseudoMoves(r, c) {
        let moves = [];
        const p = this.board[r][c];
        const type = p.toLowerCase();
        const isW = p === p.toUpperCase();
        const d = isW ? -1 : 1;
        
        if(type === 'p') {
            if(this.board[r+d] && this.board[r+d][c] === '.') {
                let special = (r+d === 0 || r+d === 7) ? 'promo' : null;
                moves.push({r: r+d, c: c, special});
                if((isW && r===6) || (!isW && r===1)) {
                    if(this.board[r+d*2][c] === '.') moves.push({r: r+d*2, c: c});
                }
            }
            [[d, -1], [d, 1]].forEach(off => {
                const tr = r + off[0], tc = c + off[1];
                if(this.onBoard(tr, tc)) {
                    const target = this.board[tr][tc];
                    let special = (tr === 0 || tr === 7) ? 'promo' : null;
                    if(target !== '.' && (isW !== (target === target.toUpperCase()))) moves.push({r: tr, c: tc, special});
                    if(target === '.' && this.epSquare && this.epSquare.r === tr && this.epSquare.c === tc) moves.push({r: tr, c: tc, special: 'ep'});
                }
            });
        }
        else if(type === 'n') {
            [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]].forEach(m => this.addMove(r, c, m[0], m[1], moves, isW));
        }
        else if(type === 'k') {
            [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(m => this.addMove(r, c, m[0], m[1], moves, isW));
            if(!this.inCheck(isW ? 'W' : 'B')) {
                if(isW && this.castling.wk && this.board[7][5]==='.' && this.board[7][6]==='.' && !this.isAttacked(7,5,'B') && !this.isAttacked(7,6,'B')) moves.push({r:7, c:6, special:'castle-k'});
                if(isW && this.castling.wq && this.board[7][3]==='.' && this.board[7][2]==='.' && this.board[7][1]==='.' && !this.isAttacked(7,3,'B')) moves.push({r:7, c:2, special:'castle-q'});
                if(!isW && this.castling.bk && this.board[0][5]==='.' && this.board[0][6]==='.' && !this.isAttacked(0,5,'W') && !this.isAttacked(0,6,'W')) moves.push({r:0, c:6, special:'castle-k'});
                if(!isW && this.castling.bq && this.board[0][3]==='.' && this.board[0][2]==='.' && this.board[0][1]==='.' && !this.isAttacked(0,3,'W')) moves.push({r:0, c:2, special:'castle-q'});
            }
        }
        else { 
            const dirs = type==='r' ? [[1,0],[-1,0],[0,1],[0,-1]] : type==='b' ? [[1,1],[1,-1],[-1,1],[-1,-1]] : [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
            dirs.forEach(d => {
                let i=1;
                while(true) {
                    let tr = r + d[0]*i, tc = c + d[1]*i;
                    if(!this.onBoard(tr, tc)) break;
                    const target = this.board[tr][tc];
                    if(target === '.') { moves.push({r:tr, c:tc}); }
                    else { if(isW !== (target === target.toUpperCase())) moves.push({r:tr, c:tc}); break; }
                    i++;
                }
            });
        }
        return moves;
    },

    addMove(r, c, dr, dc, list, isW) {
        const tr = r+dr, tc = c+dc;
        if(this.onBoard(tr, tc)) {
            const target = this.board[tr][tc];
            if(target === '.' || (isW !== (target === target.toUpperCase()))) list.push({r: tr, c: tc});
        }
    },
    onBoard(r, c) { return r>=0 && r<8 && c>=0 && c<8; },
    
    inCheck(side) {
        let kr, kc;
        const king = side === 'W' ? 'K' : 'k';
        for(let r=0; r<8; r++) for(let c=0; c<8; c++) if(this.board[r][c] === king) { kr=r; kc=c; break; }
        return this.isAttacked(kr, kc, side === 'W' ? 'B' : 'W');
    },

    isAttacked(r, c, attacker) {
        const d = attacker === 'W' ? 1 : -1;
        if(this.onBoard(r+d, c-1)) { const p = this.board[r+d][c-1]; if(p === (attacker==='W'?'P':'p')) return true; }
        if(this.onBoard(r+d, c+1)) { const p = this.board[r+d][c+1]; if(p === (attacker==='W'?'P':'p')) return true; }
        
        const knights = [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]];
        for(let m of knights) {
            const tr=r+m[0], tc=c+m[1];
            if(this.onBoard(tr, tc) && this.board[tr][tc] === (attacker==='W'?'N':'n')) return true;
        }
        
        const kings = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
        for(let m of kings) {
            const tr=r+m[0], tc=c+m[1];
            if(this.onBoard(tr, tc) && this.board[tr][tc] === (attacker==='W'?'K':'k')) return true;
        }
        
        const straight = [[1,0],[-1,0],[0,1],[0,-1]];
        for(let dir of straight) {
            let i=1;
            while(true) {
                let tr=r+dir[0]*i, tc=c+dir[1]*i;
                if(!this.onBoard(tr,tc)) break;
                const p = this.board[tr][tc];
                if(p !== '.') { if(p === (attacker==='W'?'R':'r') || p === (attacker==='W'?'Q':'q')) return true; break; }
                i++;
            }
        }

        const diag = [[1,1],[1,-1],[-1,1],[-1,-1]];
        for(let dir of diag) {
            let i=1;
            while(true) {
                let tr=r+dir[0]*i, tc=c+dir[1]*i;
                if(!this.onBoard(tr,tc)) break;
                const p = this.board[tr][tc];
                if(p !== '.') { if(p === (attacker==='W'?'B':'b') || p === (attacker==='W'?'Q':'q')) return true; break; }
                i++;
            }
        }
        return false;
    },

    getAllMoves(side) {
        let all = [];
        for(let r=0; r<8; r++) for(let c=0; c<8; c++) {
            const p = this.board[r][c];
            if(p !== '.' && (side==='W' ? p===p.toUpperCase() : p===p.toLowerCase())) {
                const moves = this.getValidMoves(r, c);
                moves.forEach(m => all.push({f:{r,c}, t:m, special: m.special}));
            }
        }
        return all;
    },

    updateStatus(msg) { document.getElementById('game-status').innerText = msg; },
    
    updateEval() {
        const score = this.evaluateBoard();
        const bar = document.getElementById('eval-fill');
        if(bar) {
            let percent = 50 + (score / 15); 
            percent = Math.max(5, Math.min(95, percent));
            bar.style.width = percent + '%';
        }
    },

    // --- AI ALGORITHM (MINIMAX + ALPHA BETA) ---
    aiMove() {
        const depth = 3; 
        const best = this.minimaxRoot(depth, true);
        if(best) this.makeMove(best.f, best.t, best.special);
        else console.log("AI Panic: No moves");
    },

    minimaxRoot(depth, isMaximizing) {
        const moves = this.getAllMoves('B');
        moves.sort((a, b) => {
            const tA = this.board[a.t.r][a.t.c] !== '.' ? 10 : 0;
            const tB = this.board[b.t.r][b.t.c] !== '.' ? 10 : 0;
            return tB - tA;
        });

        let bestMove = null;
        let bestVal = -Infinity;

        for(let m of moves) {
            const savedBoard = JSON.parse(JSON.stringify(this.board));
            const savedEp = this.epSquare; const savedCastle = {...this.castling};

            this.board[m.t.r][m.t.c] = this.board[m.f.r][m.f.c]; this.board[m.f.r][m.f.c] = '.';
            if(m.special === 'ep') this.board[m.f.r][m.t.c] = '.';
            if(m.special === 'promo') this.board[m.t.r][m.t.c] = 'q';

            const val = this.minimax(depth - 1, -Infinity, Infinity, false);
            
            this.board = savedBoard; this.epSquare = savedEp; this.castling = savedCastle;

            if(val > bestVal) { bestVal = val; bestMove = m; }
        }
        return bestMove;
    },

    minimax(depth, alpha, beta, isMaximizing) {
        if(depth === 0) return -this.evaluateBoard();

        const moves = this.getAllMoves(isMaximizing ? 'W' : 'B');
        if(moves.length === 0) {
            if(this.inCheck(isMaximizing ? 'W' : 'B')) return isMaximizing ? -10000 : 10000;
            return 0;
        }

        moves.sort((a, b) => (this.board[b.t.r][b.t.c]!=='.' ? 1 : 0) - (this.board[a.t.r][a.t.c]!=='.' ? 1 : 0));

        if(isMaximizing) {
            let maxEval = -Infinity;
            for(let m of moves) {
                const savedBoard = JSON.parse(JSON.stringify(this.board));
                const savedEp = this.epSquare; const savedCastle = {...this.castling};
                
                this.board[m.t.r][m.t.c] = this.board[m.f.r][m.f.c]; this.board[m.f.r][m.f.c] = '.';
                if(m.special==='ep') this.board[m.f.r][m.t.c]='.';
                if(m.special==='promo') this.board[m.t.r][m.t.c]='Q';

                const eval = this.minimax(depth - 1, alpha, beta, false);
                
                this.board = savedBoard; this.epSquare = savedEp; this.castling = savedCastle;

                maxEval = Math.max(maxEval, eval);
                alpha = Math.max(alpha, eval);
                if(beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for(let m of moves) {
                const savedBoard = JSON.parse(JSON.stringify(this.board));
                const savedEp = this.epSquare; const savedCastle = {...this.castling};
                
                this.board[m.t.r][m.t.c] = this.board[m.f.r][m.f.c]; this.board[m.f.r][m.f.c] = '.';
                if(m.special==='ep') this.board[m.f.r][m.t.c]='.';
                if(m.special==='promo') this.board[m.t.r][m.t.c]='q';

                const eval = this.minimax(depth - 1, alpha, beta, true);
                
                this.board = savedBoard; this.epSquare = savedEp; this.castling = savedCastle;

                minEval = Math.min(minEval, eval);
                beta = Math.min(beta, eval);
                if(beta <= alpha) break;
            }
            return minEval;
        }
    },

    evaluateBoard() {
        let score = 0;
        const weights = { p:100, n:320, b:330, r:500, q:900, k:20000 };
        for(let r=0; r<8; r++) for(let c=0; c<8; c++) {
            const p = this.board[r][c];
            if(p === '.') continue;
            const type = p.toUpperCase();
            const isWhite = p === type;
            const val = weights[p.toLowerCase()];
            let pstVal = 0;
            if(PST[type]) pstVal = isWhite ? PST[type][r][c] : PST[type][7-r][c];
            if(isWhite) score += (val + pstVal);
            else score -= (val + pstVal);
        }
        return score;
    }
};

Chess.init();

