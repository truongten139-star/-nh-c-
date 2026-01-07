/* --- chess_core.js: BỘ NÃO SUPER & HỆ THỐNG KHỊA CỰC MẠNH --- */

// --- 1. KHO TÀNG "VÕ MỒM" (ĐÃ NÂNG CẤP) ---
const TrashTalk = {
    start: [
        "Nhìn mặt là biết 'tấm chiếu mới' rồi.", 
        "Đánh nhanh đi, tui còn đi chạy deadline.", 
        "Chấp bạn đi trước, đừng để thua trước 10 nước nhé.",
        "Alo, biết chơi cờ không hay vào bấm loạn xạ thế?"
    ],
    winning: [
        "Đầu hàng đi cho đỡ nhục ní ơi.", 
        "Cờ bí rồi à? Gọi người thân trợ giúp đi.", 
        "Nước đi này... đi vào lòng đất à?", 
        "Toang! Cụ đi chân lạnh toát.",
        "Vùng vẫy trong vô vọng à?",
        "Tầm này thì vua cũng phải đi bán muối thôi."
    ],
    capture: [
        "Cảm ơn con hàng nhé! Ngon quá.", 
        "Non và xanh lắm.", 
        "Hiến tế à? Tui nhận hết.",
        "Mất quân cay không? Cay không?",
        "Ú òa! Mất tiêu con hàng."
    ],
    check: [
        "Chạy đi đâu con sâu này!", 
        "Chiếu tướng! Tim đập chân run chưa?", 
        "Alo alo, Vua đâu rồi? Ra trình diện mau!",
        "Vua chạy như vịt thế kia?"
    ],
    undo: [
        "Sợ thua à mà Hoàn tác?", 
        "Lại Undo? Đánh kém thì nhận đi.", 
        "Cho lại 1 nước đấy, kết quả vẫn thế thôi.", 
        "Chơi game ai lại Undo, hèn thế?"
    ],
    lose: [
        "Hack à? Sao hay thế?", 
        "Máy tui bị lag thôi, ván này không tính!", 
        "Kinh đấy, nhưng chắc do may mắn thôi."
    ],
    wait: [
        "Ngủ gật rồi à?", 
        "Tính toán gì lâu thế, đánh đại đi.",
        "Đợi bạn đi xong tui già đi 10 tuổi."
    ],
    
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

// --- 2. BẢNG ĐIỂM VỊ TRÍ (PST) - AI KHÔN HƠN ---
// Giúp AI biết định vị quân cờ (Vd: Mã nên đứng giữa, Tốt nên tiến lên)
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
    castling: { wq: true, wk: true, bq: true, bk: true }, // Quyền nhập thành
    epSquare: null, // Ô bắt tốt qua đường (En Passant)

    init() {
        // Thêm nút chuyển chế độ vào giao diện nếu chưa có
        if(!document.getElementById('mode-btn')) {
            const controls = document.querySelector('.controls');
            if(controls) {
                const btn = document.createElement('button');
                btn.id = 'mode-btn';
                btn.className = 'btn';
                btn.innerText = 'Chế độ: Đấu AI';
                btn.onclick = () => this.toggleMode();
                controls.insertBefore(btn, controls.firstChild);
            }
        }
        this.reset();
    },

    toggleMode() {
        this.gameMode = this.gameMode === 'ai' ? 'human' : 'ai';
        const btn = document.getElementById('mode-btn');
        if(btn) btn.innerText = this.gameMode === 'ai' ? 'Chế độ: Đấu AI' : 'Chế độ: 2 Người';
        this.reset();
    },

    reset() {
        this.board = [
            ['r','n','b','q','k','b','n','r'],
            ['p','p','p','p','p','p','p','p'],
            ['.','.','.','.','.','.','.','.'],
            ['.','.','.','.','.','.','.','.'],
            ['.','.','.','.','.','.','.','.'],
            ['.','.','.','.','.','.','.','.'],
            ['P','P','P','P','P','P','P','P'],
            ['R','N','B','Q','K','B','N','R']
        ];
        this.turn = 'W'; this.sel = null; this.history = []; this.gameOver = false;
        this.castling = { wq: true, wk: true, bq: true, bk: true };
        this.epSquare = null;
        
        document.getElementById('lock-layer').style.display = 'none';
        this.updateStatus(this.gameMode === 'ai' ? "LƯỢT CỦA BẠN" : "LƯỢT TRẮNG (P1)");
        this.draw();
        this.updateEval();
        if(this.gameMode === 'ai') TrashTalk.speak('start');
    },

    draw() {
        const box = document.getElementById('board-box');
        if(box.querySelectorAll('.tile').length === 0) {
            box.innerHTML = '<div id="lock-layer" class="board-lock"></div>';
            for(let i=0; i<64; i++) {
                let r=Math.floor(i/8), c=i%8, t=document.createElement('div');
                t.className = `tile ${(r+c)%2===0?'l':'d'}`;
                t.onclick = () => this.click(r, c); 
                t.id = `tile-${r}-${c}`;
                box.appendChild(t);
            }
        }
        
        const validMoves = this.sel ? this.getValidMoves(this.sel.r, this.sel.c) : [];
        
        for(let r=0; r<8; r++) {
            for(let c=0; c<8; c++) {
                const t = document.getElementById(`tile-${r}-${c}`);
                t.innerHTML = '';
                t.className = `tile ${(r+c)%2===0?'l':'d'}`; // Reset class
                
                if(this.sel?.r===r && this.sel?.c===c) t.classList.add('sel');
                // Highlight nước đi cũ
                if(this.history.length > 0) {
                    const lastMove = this.history[this.history.length-1].move;
                    if((lastMove.f.r===r && lastMove.f.c===c) || (lastMove.t.r===r && lastMove.t.c===c)) {
                        t.classList.add('last-move');
                    }
                }

                if(validMoves.some(m => m.r===r && m.c===c)) {
                    const mark = document.createElement('div');
                    mark.className = this.board[r][c] !== '.' || (this.epSquare && r===this.epSquare.r && c===this.epSquare.c) ? 'hint-cap' : 'hint';
                    t.appendChild(mark);
                }
                
                const p = this.board[r][c];
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
        if(this.gameMode === 'ai' && this.turn === 'B') return; // Không click khi AI đang nghĩ

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
            this.draw();
        } else {
            this.sel = null;
            this.draw();
        }
    },

    makeMove(from, to, special = null) {
        // Lưu history để Undo
        this.history.push({
            board: JSON.parse(JSON.stringify(this.board)),
            turn: this.turn,
            castling: {...this.castling},
            ep: this.epSquare,
            move: {f: from, t: to}
        });

        const piece = this.board[from.r][from.c];
        const target = this.board[to.r][to.c];

        // Khịa khi ăn quân
        if(this.gameMode === 'ai' && this.turn === 'B' && target !== '.') TrashTalk.speak('capture');

        // Di chuyển quân
        this.board[to.r][to.c] = piece;
        this.board[from.r][from.c] = '.';

        // Xử lý nước đặc biệt
        if(special === 'castle-k') { // Nhập thành gần
            this.board[from.r][5] = this.board[from.r][7];
            this.board[from.r][7] = '.';
        } else if(special === 'castle-q') { // Nhập thành xa
            this.board[from.r][3] = this.board[from.r][0];
            this.board[from.r][0] = '.';
        } else if(special === 'ep') { // Bắt tốt qua đường
            this.board[from.r][to.c] = '.'; 
            if(this.gameMode === 'ai' && this.turn === 'B') TrashTalk.speak('capture');
        } else if(special === 'promo') { // Phong cấp
             // Mặc định lên Hậu cho AI và Player để đơn giản (có thể thêm UI chọn sau)
            this.board[to.r][to.c] = this.turn === 'W' ? 'Q' : 'q';
        }

        // Cập nhật quyền nhập thành
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

        // Cập nhật En Passant
        this.epSquare = null;
        if(piece.toLowerCase() === 'p' && Math.abs(to.r - from.r) === 2) {
            this.epSquare = { r: (from.r + to.r)/2, c: from.c };
        }

        // Đổi lượt
        this.turn = this.turn === 'W' ? 'B' : 'W';
        this.sel = null;
        
        // Kiểm tra hết cờ / chiếu
        if(this.inCheck(this.turn)) {
            if(this.gameMode === 'ai' && this.turn === 'W') TrashTalk.speak('check'); // AI chiếu Player
        }

        const possibleMoves = this.getAllMoves(this.turn);
        if(possibleMoves.length === 0) {
            this.gameOver = true;
            if(this.inCheck(this.turn)) {
                const winner = this.turn === 'W' ? "ĐEN THẮNG" : "TRẮNG THẮNG";
                this.updateStatus(winner);
                if(this.gameMode === 'ai') TrashTalk.speak(this.turn === 'W' ? 'winning' : 'lose');
            } else {
                this.updateStatus("HÒA (CỜ BÍ)");
            }
        } else {
            // Update trạng thái
            if(this.gameMode === 'human') {
                this.updateStatus(this.turn === 'W' ? "LƯỢT TRẮNG (P1)" : "LƯỢT ĐEN (P2)");
            } else {
                this.updateStatus(this.turn === 'W' ? "LƯỢT CỦA BẠN" : "AI ĐANG TÍNH...");
            }
        }

        this.updateEval();
        this.draw();

        // Trigger AI
        if(!this.gameOver && this.gameMode === 'ai' && this.turn === 'B') {
            document.getElementById('lock-layer').style.display = 'block';
            // setTimeout để UI kịp update
            setTimeout(() => this.aiMove(), 50);
        } else {
             document.getElementById('lock-layer').style.display = 'none';
        }
        
        // Timer khịa nếu người chơi nghĩ lâu
        if(!this.gameOver && this.gameMode === 'ai' && this.turn === 'W') {
             clearTimeout(this.waitTimer);
             this.waitTimer = setTimeout(() => TrashTalk.speak('wait'), 15000); // 15s chưa đi
        }
    },

    undo() {
        if(this.history.length === 0) return;
        
        // Nếu chơi với AI, phải undo 2 lượt (của AI và của mình)
        // Trừ khi AI vừa thắng hoặc chưa đi
        let steps = (this.gameMode === 'ai' && this.turn === 'W' && !this.gameOver) ? 2 : 1;
        
        while(steps > 0 && this.history.length > 0) {
            const state = this.history.pop();
            this.board = state.board;
            this.turn = state.turn;
            this.castling = state.castling;
            this.epSquare = state.ep;
            steps--;
        }
        
        this.gameOver = false;
        this.sel = null;
        this.draw();
        this.updateEval();
        this.updateStatus(this.gameMode === 'ai' ? "LƯỢT CỦA BẠN" : (this.turn === 'W' ? "LƯỢT TRẮNG" : "LƯỢT ĐEN"));
        if(this.gameMode === 'ai') TrashTalk.speak('undo');
    },

    // --- LOGIC LUẬT CỜ (VALIDATION) ---
    // Kiểm tra nước đi có hợp lệ không (Không để vua bị chiếu)
    getValidMoves(r, c) {
        const moves = this.getPseudoMoves(r, c);
        const valid = [];
        const myKing = this.turn === 'W' ? 'K' : 'k';
        
        for(let m of moves) {
            // Giả lập nước đi
            const saveBoard = JSON.parse(JSON.stringify(this.board));
            const saveEp = this.epSquare;
            
            // Execute tạm trên bàn cờ thật (đỡ tốn mem tạo mới)
            this.board[m.r][m.c] = this.board[r][c];
            this.board[r][c] = '.';
            if(m.special === 'ep') this.board[r][m.c] = '.'; // Xóa tốt bị bắt qua đường
            
            // Kiểm tra vua mình có bị chiếu không
            if(!this.inCheck(this.turn)) {
                valid.push(m);
            }
            
            // Hoàn trả
            this.board = saveBoard;
            this.epSquare = saveEp;
        }
        return valid;
    },

    // Lấy nước đi theo quy tắc di chuyển (chưa check chiếu)
    getPseudoMoves(r, c) {
        let moves = [];
        const p = this.board[r][c];
        const type = p.toLowerCase();
        const isW = p === p.toUpperCase();
        const d = isW ? -1 : 1; // Hướng đi của Tốt
        
        if(type === 'p') {
            // Đi thẳng 1 ô
            if(this.board[r+d] && this.board[r+d][c] === '.') {
                let special = (r+d === 0 || r+d === 7) ? 'promo' : null;
                moves.push({r: r+d, c: c, special});
                // Đi thẳng 2 ô
                if((isW && r===6) || (!isW && r===1)) {
                    if(this.board[r+d*2][c] === '.') moves.push({r: r+d*2, c: c});
                }
            }
            // Ăn chéo
            [[d, -1], [d, 1]].forEach(off => {
                const tr = r + off[0], tc = c + off[1];
                if(this.onBoard(tr, tc)) {
                    const target = this.board[tr][tc];
                    let special = (tr === 0 || tr === 7) ? 'promo' : null;
                    if(target !== '.' && (isW !== (target === target.toUpperCase()))) {
                        moves.push({r: tr, c: tc, special});
                    }
                    // En Passant
                    if(target === '.' && this.epSquare && this.epSquare.r === tr && this.epSquare.c === tc) {
                        moves.push({r: tr, c: tc, special: 'ep'});
                    }
                }
            });
        }
        else if(type === 'n') {
            [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]].forEach(m => this.addMove(r, c, m[0], m[1], moves, isW));
        }
        else if(type === 'k') {
            [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(m => this.addMove(r, c, m[0], m[1], moves, isW));
            // Castling (Nhập thành)
            if(!this.inCheck(isW ? 'W' : 'B')) {
                if(isW && this.castling.wk && this.board[7][5]==='.' && this.board[7][6]==='.' && !this.isAttacked(7,5,'B') && !this.isAttacked(7,6,'B')) moves.push({r:7, c:6, special:'castle-k'});
                if(isW && this.castling.wq && this.board[7][3]==='.' && this.board[7][2]==='.' && this.board[7][1]==='.' && !this.isAttacked(7,3,'B')) moves.push({r:7, c:2, special:'castle-q'});
                if(!isW && this.castling.bk && this.board[0][5]==='.' && this.board[0][6]==='.' && !this.isAttacked(0,5,'W') && !this.isAttacked(0,6,'W')) moves.push({r:0, c:6, special:'castle-k'});
                if(!isW && this.castling.bq && this.board[0][3]==='.' && this.board[0][2]==='.' && this.board[0][1]==='.' && !this.isAttacked(0,3,'W')) moves.push({r:0, c:2, special:'castle-q'});
            }
        }
        else { // R, B, Q (Sliding pieces)
            const dirs = {
                'r': [[1,0],[-1,0],[0,1],[0,-1]],
                'b': [[1,1],[1,-1],[-1,1],[-1,-1]],
                'q': [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]
            }[type];
            dirs.forEach(d => {
                let i=1;
                while(true) {
                    let tr = r + d[0]*i, tc = c + d[1]*i;
                    if(!this.onBoard(tr, tc)) break;
                    const target = this.board[tr][tc];
                    if(target === '.') { moves.push({r:tr, c:tc}); }
                    else {
                        if(isW !== (target === target.toUpperCase())) moves.push({r:tr, c:tc});
                        break;
                    }
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
            if(target === '.' || (isW !== (target === target.toUpperCase()))) {
                list.push({r: tr, c: tc});
            }
        }
    },

    onBoard(r, c) { return r>=0 && r<8 && c>=0 && c<8; },

    // Kiểm tra phe `side` (W/B) có đang bị chiếu không
    inCheck(side) {
        // Tìm vua
        let kr, kc;
        const king = side === 'W' ? 'K' : 'k';
        for(let r=0; r<8; r++) for(let c=0; c<8; c++) if(this.board[r][c] === king) { kr=r; kc=c; break; }
        // Kiểm tra xem vua có bị quân địch tấn công không
        return this.isAttacked(kr, kc, side === 'W' ? 'B' : 'W');
    },

    // Kiểm tra ô (r,c) có bị phe `attacker` tấn công không
    isAttacked(r, c, attacker) {
        // Cách kiểm tra: Đặt các quân địch vào vị trí vua, xem có đi được tới quân địch thật không (Reverse check)
        // 1. Check tốt
        const d = attacker === 'W' ? 1 : -1; // Tốt địch đi hướng nào so với mình
        if(this.onBoard(r+d, c-1)) { const p = this.board[r+d][c-1]; if(p === (attacker==='W'?'P':'p')) return true; }
        if(this.onBoard(r+d, c+1)) { const p = this.board[r+d][c+1]; if(p === (attacker==='W'?'P':'p')) return true; }
        
        // 2. Check Mã
        const knights = [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]];
        for(let m of knights) {
            const tr=r+m[0], tc=c+m[1];
            if(this.onBoard(tr, tc) && this.board[tr][tc] === (attacker==='W'?'N':'n')) return true;
        }

        // 3. Check Vua địch (để tránh 2 vua đứng cạnh nhau)
        const kings = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
        for(let m of kings) {
            const tr=r+m[0], tc=c+m[1];
            if(this.onBoard(tr, tc) && this.board[tr][tc] === (attacker==='W'?'K':'k')) return true;
        }
        
        // 4. Check Xe/Hậu (ngang dọc)
        const straight = [[1,0],[-1,0],[0,1],[0,-1]];
        for(let dir of straight) {
            let i=1;
            while(true) {
                let tr=r+dir[0]*i, tc=c+dir[1]*i;
                if(!this.onBoard(tr,tc)) break;
                const p = this.board[tr][tc];
                if(p !== '.') {
                    if(p === (attacker==='W'?'R':'r') || p === (attacker==='W'?'Q':'q')) return true;
                    break;
                }
                i++;
            }
        }

        // 5. Check Tượng/Hậu (chéo)
        const diag = [[1,1],[1,-1],[-1,1],[-1,-1]];
        for(let dir of diag) {
            let i=1;
            while(true) {
                let tr=r+dir[0]*i, tc=c+dir[1]*i;
                if(!this.onBoard(tr,tc)) break;
                const p = this.board[tr][tc];
                if(p !== '.') {
                    if(p === (attacker==='W'?'B':'b') || p === (attacker==='W'?'Q':'q')) return true;
                    break;
                }
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
            // Score > 0 là trắng lợi, < 0 đen lợi
            // Clamp từ -1000 đến 1000 để hiện thanh
            let percent = 50 + (score / 15); 
            percent = Math.max(5, Math.min(95, percent));
            bar.style.width = percent + '%';
        }
    },

    // --- AI ALGORITHM (MINIMAX + ALPHA BETA) ---
    aiMove() {
        // Tăng độ khó: Depth 4 (Nếu máy yếu có thể giảm xuống 3)
        const depth = 3; 
        const best = this.minimaxRoot(depth, true);
        
        if(best) {
            this.makeMove(best.f, best.t, best.special);
        } else {
            console.log("AI Panic: No moves");
        }
    },

    minimaxRoot(depth, isMaximizing) {
        const moves = this.getAllMoves('B'); // AI là Đen
        // Move Ordering: Ưu tiên nước ăn quân để cắt tỉa Alpha-Beta tốt hơn
        moves.sort((a, b) => {
            const tA = this.board[a.t.r][a.t.c] !== '.' ? 10 : 0;
            const tB = this.board[b.t.r][b.t.c] !== '.' ? 10 : 0;
            return tB - tA;
        });

        let bestMove = null;
        let bestVal = -Infinity;

        // Loop chính
        for(let m of moves) {
            // Backup State
            const savedBoard = JSON.parse(JSON.stringify(this.board));
            const savedEp = this.epSquare;
            const savedCastle = {...this.castling};

            // Execute giả
            this.board[m.t.r][m.t.c] = this.board[m.f.r][m.f.c];
            this.board[m.f.r][m.f.c] = '.';
            if(m.special === 'ep') this.board[m.f.r][m.t.c] = '.';
            if(m.special === 'promo') this.board[m.t.r][m.t.c] = 'q';

            // Gọi Minimax
            const val = this.minimax(depth - 1, -Infinity, Infinity, false);
            
            // Restore State
            this.board = savedBoard;
            this.epSquare = savedEp;
            this.castling = savedCastle;

            if(val > bestVal) {
                bestVal = val;
                bestMove = m;
            }
        }
        return bestMove;
    },

    minimax(depth, alpha, beta, isMaximizing) {
        if(depth === 0) return -this.evaluateBoard(); // Đen muốn điểm càng âm (theo góc nhìn trắng) -> Đảo dấu

        const moves = this.getAllMoves(isMaximizing ? 'W' : 'B');
        if(moves.length === 0) {
            if(this.inCheck(isMaximizing ? 'W' : 'B')) return isMaximizing ? -10000 : 10000; // Checkmate
            return 0; // Stalemate
        }

        // Move ordering sơ khai
        moves.sort((a, b) => (this.board[b.t.r][b.t.c]!=='.' ? 1 : 0) - (this.board[a.t.r][a.t.c]!=='.' ? 1 : 0));

        if(isMaximizing) { // Lượt Trắng (Người)
            let maxEval = -Infinity;
            for(let m of moves) {
                // Backup
                const savedBoard = JSON.parse(JSON.stringify(this.board));
                const savedEp = this.epSquare; const savedCastle = {...this.castling};
                
                // Exe
                this.board[m.t.r][m.t.c] = this.board[m.f.r][m.f.c]; this.board[m.f.r][m.f.c] = '.';
                if(m.special==='ep') this.board[m.f.r][m.t.c]='.';
                if(m.special==='promo') this.board[m.t.r][m.t.c]='Q';

                const eval = this.minimax(depth - 1, alpha, beta, false);
                
                // Restore
                this.board = savedBoard; this.epSquare = savedEp; this.castling = savedCastle;

                maxEval = Math.max(maxEval, eval);
                alpha = Math.max(alpha, eval);
                if(beta <= alpha) break;
            }
            return maxEval;
        } else { // Lượt Đen (AI)
            let minEval = Infinity;
            for(let m of moves) {
                // Backup
                const savedBoard = JSON.parse(JSON.stringify(this.board));
                const savedEp = this.epSquare; const savedCastle = {...this.castling};
                
                // Exe
                this.board[m.t.r][m.t.c] = this.board[m.f.r][m.f.c]; this.board[m.f.r][m.f.c] = '.';
                if(m.special==='ep') this.board[m.f.r][m.t.c]='.';
                if(m.special==='promo') this.board[m.t.r][m.t.c]='q';

                const eval = this.minimax(depth - 1, alpha, beta, true);
                
                // Restore
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
            
            // PST Score (Vị trí)
            let pstVal = 0;
            if(PST[type]) {
                pstVal = isWhite ? PST[type][r][c] : PST[type][7-r][c];
            }

            if(isWhite) score += (val + pstVal);
            else score -= (val + pstVal);
        }
        return score;
    }
};

// Start
Chess.init();
