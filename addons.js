const AddonStore = {
    // --- KHU VỰC CHỈNH SỬA ADDON ---
    data: [
        {
            id: 1,
            name: "Mutants Addons",
            shortDesc: "Addons khám phá phiêu lưu",
            fullDesc: "Addon này sẽ biến cho các con quái trở nên khổng lồ khiến bạn khó khăn hơn trong sinh tồn.",
            icon: "", // Để trống vì đã có ảnh nền
            // SỬA Ở ĐÂY: Dùng url('link_anh')
            imageColor: "url('https://i.ibb.co/B7W25dq/mqdefault.jpg') center/cover no-repeat", 
            link: "https://limewire.com/d/6hqy9#x49ozk4OI5 "
        },
        {
            id: 2,
            name: "Gundam Mecha Mod",
            shortDesc: "Robot chiến đấu khổng lồ",
            fullDesc: "Thêm vào game 5 loại Robot Gundam có thể cưỡi. Trang bị súng laser, tên lửa và khả năng bay lượn.",
            icon: "🤖",
            imageColor: "#ef4444",
            link: "#"
        }
    ],

    // --- LOGIC HỆ THỐNG (GIỮ NGUYÊN) ---
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

        document.getElementById('det-name').innerText = item.name;
        document.getElementById('det-desc').innerText = item.fullDesc;
        
        // Cập nhật ảnh cho Modal chi tiết
        const imgBox = document.getElementById('det-img-box');
        imgBox.style.background = item.imageColor;
        imgBox.style.backgroundColor = item.imageColor.includes('url') ? 'transparent' : item.imageColor;
        imgBox.innerText = item.icon;
        
        const btn = document.getElementById('det-download');
        btn.onclick = () => window.location.href = item.link;

        document.getElementById('addon-modal').style.display = 'flex';
    },

    close() {
        document.getElementById('addon-modal').style.display = 'none';
    }
};

document.addEventListener('DOMContentLoaded', () => AddonStore.init());
