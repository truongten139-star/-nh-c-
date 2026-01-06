const AddonStore = {
    // --- KHU VỰC CHỈNH SỬA ADDON ---
    data: [
        {
            id: 1,
            name: "Ocean Shader V3",
            shortDesc: "Đồ họa nước siêu thực",
            fullDesc: "Gói Shader nhẹ nhưng cực đẹp, tối ưu cho máy cấu hình thấp. Hiệu ứng nước phản chiếu, mây trôi 4K và ánh sáng Neon ban đêm.",
            icon: "🌊",
            imageColor: "#0ea5e9", // Màu nền ảnh đại diện (hoặc thay bằng link ảnh)
            link: "https://google.com" // Link tải
        },
        {
            id: 2,
            name: "Gundam Mecha Mod",
            shortDesc: "Robot chiến đấu khổng lồ",
            fullDesc: "Thêm vào game 5 loại Robot Gundam có thể cưỡi. Trang bị súng laser, tên lửa và khả năng bay lượn.",
            icon: "🤖",
            imageColor: "#ef4444",
            link: "#"
        },
        {
            id: 3,
            name: "Better UI/UX",
            shortDesc: "Giao diện trong suốt",
            fullDesc: "Thay đổi toàn bộ giao diện Inventory, Chest, Menu thành dạng kính mờ (Glassmorphism) cực sang trọng.",
            icon: "✨",
            imageColor: "#8b5cf6",
            link: "#"
        },
        {
            id: 4,
            name: "One Piece Addon",
            shortDesc: "Trái ác quỷ & Haki",
            fullDesc: "Hệ thống trái ác quỷ hoàn chỉnh, Haki vũ trang, Haki quan sát và các Boss hải tặc khét tiếng.",
            icon: "🏴‍☠️",
            imageColor: "#f59e0b",
            link: "#"
        }
    ],

    // --- LOGIC HỆ THỐNG (KHÔNG CẦN SỬA) ---
    init() {
        const container = document.getElementById('addon-list-container');
        if (!container) return;
        
        container.innerHTML = this.data.map(item => `
            <div class="item-row" onclick="AddonStore.open(${item.id})">
                <div class="item-img" style="background:${item.imageColor}">${item.icon}</div>
                <div style="flex:1">
                    <b>${item.name}</b>
                    <p style="font-size:11px; color:var(--text-sub)">${item.shortDesc}</p>
                </div>
                <i class='bx bx-chevron-right' style="font-size:24px; color:var(--primary)"></i>
            </div>
        `).join('');
    },

    open(id) {
        const item = this.data.find(i => i.id === id);
        if (!item) return;

        // Điền dữ liệu vào Modal
        document.getElementById('det-name').innerText = item.name;
        document.getElementById('det-desc').innerText = item.fullDesc;
        document.getElementById('det-img-box').style.backgroundColor = item.imageColor;
        document.getElementById('det-img-box').innerText = item.icon;
        
        // Gán link tải
        const btn = document.getElementById('det-download');
        btn.onclick = () => window.location.href = item.link;

        // Hiện Modal
        document.getElementById('addon-modal').style.display = 'flex';
    },

    close() {
        document.getElementById('addon-modal').style.display = 'none';
    }
};

// Tự động chạy khi web tải xong
document.addEventListener('DOMContentLoaded', () => AddonStore.init());