// 1. Ambil elemen-elemen dari HTML
const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Variabel untuk menyimpan riwayat percakapan (agar Gemini ingat konteks)
let conversationHistory = [];

// 2. Fungsi saat tombol 'Send' diklik
form.addEventListener('submit', async function (e) {
    e.preventDefault(); // Mencegah website reload sendiri

    const userMessage = input.value.trim();
    if (!userMessage) return; // Kalau kosong, jangan kirim apa-apa

    // Tampilkan pesan user di layar
    appendMessage('user', userMessage);
    input.value = ''; // Kosongkan kotak ketik

    // Tambahkan ke riwayat
    conversationHistory.push({ role: 'user', text: userMessage });

    // Tampilkan status "Sedang berpikir..."
    const loadingId = appendMessage('model', 'Sedang berpikir...', true);

    try {
        // 3. KIRIM KE SERVER (BACKEND)
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversation: conversationHistory }),
        });

        const data = await response.json();

        // Hapus pesan "Sedang berpikir..."
        removeMessage(loadingId);

        if (data.result) {
            // Tampilkan balasan Gemini
            appendMessage('model', data.result);
            // Simpan balasan Gemini ke riwayat
            conversationHistory.push({ role: 'model', text: data.result });
        } else {
            appendMessage('model', 'Maaf, terjadi kesalahan pada server.');
        }

    } catch (error) {
        removeMessage(loadingId);
        appendMessage('model', 'Gagal terhubung ke server. Cek koneksi internetmu.');
        console.error(error);
    }
});

// --- FUNGSI BANTUAN (HELPER) ---

// Fungsi untuk menambah balon chat ke layar
function appendMessage(sender, text, isLoading = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender); // Tambah class 'user' atau 'model'
    messageDiv.innerText = text;
    
    // Kalau ini loading, kasih ID biar bisa dihapus nanti
    const id = Math.random().toString(36).substring(7);
    if (isLoading) messageDiv.id = id;

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto scroll ke bawah
    return id;
}

// Fungsi untuk menghapus pesan loading
function removeMessage(id) {
    const element = document.getElementById(id);
    if (element) element.remove();
}