const noteForm = document.getElementById('note-form');
const noteIdInput = document.getElementById('note-id');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const notesContainer = document.getElementById('notes-container');
const noteCount = document.getElementById('note-count');
const formTitle = document.getElementById('form-title');
const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');

let allNotes = [];

document.addEventListener('DOMContentLoaded', fetchNotes);

async function fetchNotes() {
    try {
        const response = await fetch('/api/notes');
        const data = await response.json();
        allNotes = data.notes;
        renderNotes(allNotes);
    } catch (error) {
        console.error('Error fetching notes:', error);
    }
}

function renderNotes(notes) {
    notesContainer.innerHTML = '';
    noteCount.textContent = `${notes.length} Note${notes.length === 1 ? '' : 's'}`;

    if (notes.length === 0) {
        notesContainer.innerHTML = `
            <div class="col-span-full bg-slate-800/50 border border-slate-700/60 rounded-2xl p-12 text-center text-slate-500">
                <i class="fa-regular fa-folder-open text-4xl mb-3 text-slate-600"></i>
                <p>No notes found. Create your first note using the form!</p>
            </div>
        `;
        return;
    }

    notesContainer.innerHTML = notes.map(note => `
        <div class="bg-slate-800 border border-slate-700 hover:border-blue-500/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition group">
            <div>
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-semibold text-white text-base group-hover:text-blue-400 transition">${escapeHTML(note.title)}</h3>
                    <span class="text-[10px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700/50">${formatDate(note.created_at)}</span>
                </div>
                <p class="text-slate-300 text-sm whitespace-pre-wrap line-clamp-4 mb-4">${escapeHTML(note.content)}</p>
            </div>
            <div class="flex justify-end space-x-2 pt-3 border-t border-slate-700/60">
                <button onclick="editNote(${note.id})" 
                    class="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-xs px-3 py-1.5 rounded-lg transition flex items-center space-x-1">
                    <i class="fa-solid fa-pen"></i><span>Edit</span>
                </button>
                <button onclick="deleteNote(${note.id})" 
                    class="bg-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white text-xs px-3 py-1.5 rounded-lg transition flex items-center space-x-1">
                    <i class="fa-solid fa-trash"></i><span>Delete</span>
                </button>
            </div>
        </div>
    `).join('');
}

noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = noteIdInput.value;
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    const payload = { title, content };

    try {
        let response;
        if (id) {
            response = await fetch(`/api/notes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            response = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        if (response.ok) {
            resetForm();
            fetchNotes();
        }
    } catch (error) {
        console.error('Error saving note:', error);
    }
});

function editNote(id) {
    const note = allNotes.find(n => n.id === id);
    if (!note) return;

    noteIdInput.value = note.id;
    titleInput.value = note.title;
    contentInput.value = note.content;
    
    formTitle.innerHTML = `<i class="fa-solid fa-pen-to-square mr-2"></i>Edit Note #${note.id}`;
    saveBtn.innerHTML = `<i class="fa-solid fa-check"></i><span>Update Note</span>`;
    cancelBtn.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
        try {
            const response = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchNotes();
            }
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    }
}

function resetForm() {
    noteIdInput.value = '';
    noteForm.reset();
    formTitle.innerHTML = `<i class="fa-solid fa-pen-to-square mr-2"></i>Create New Note`;
    saveBtn.innerHTML = `<i class="fa-solid fa-plus"></i><span>Save Note</span>`;
    cancelBtn.classList.add('hidden');
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

function formatDate(dateString) {
    const utcDate = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
    const options = { 
        timeZone: 'Asia/Manila', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return utcDate.toLocaleDateString('en-PH', options);
}