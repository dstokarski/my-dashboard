let currentUser = null;
let editMode = false;
let currentEditingCard = null;

const DEFAULT_CARDS = [
    {
        id: 'world-news',
        title: 'World News',
        order: 0,
        links: [
            { text: 'BBC News', url: 'https://www.bbc.com/news' },
            { text: 'CNN', url: 'https://www.cnn.com' },
            { text: 'The Guardian', url: 'https://www.theguardian.com' },
            { text: 'Al Jazeera', url: 'https://www.aljazeera.com' },
            { text: 'Reuters', url: 'https://www.reuters.com' }
        ]
    },
    {
        id: 'canada-news',
        title: 'Canada News',
        order: 1,
        links: [
            { text: 'CBC News', url: 'https://www.cbc.ca/news' },
            { text: 'CTV News', url: 'https://www.ctvnews.ca' },
            { text: 'Global News', url: 'https://globalnews.ca' },
            { text: 'The Globe and Mail', url: 'https://www.theglobeandmail.com' },
            { text: 'National Post', url: 'https://nationalpost.com' }
        ]
    },
    {
        id: 'ottawa-news',
        title: 'Ottawa News',
        order: 2,
        links: [
            { text: 'CBC Ottawa', url: 'https://www.cbc.ca/news/canada/ottawa' },
            { text: 'CTV Ottawa', url: 'https://ottawa.ctvnews.ca' },
            { text: 'Ottawa Citizen', url: 'https://ottawacitizen.com' },
            { text: 'Ottawa Matters', url: 'https://www.ottawamatters.com' },
            { text: 'Apt613', url: 'https://www.apt613.ca' }
        ]
    }
];

function initFirebase() {
    if (!window.firebase) {
        window.addEventListener('firebaseReady', initFirebase, { once: true });
        return;
    }

    const signInBtn = document.getElementById('sign-in-btn');
    const signOutBtn = document.getElementById('sign-out-btn');
    const userSection = document.getElementById('user-section');
    const userName = document.getElementById('user-name');
    const editBtn = document.getElementById('edit-btn');

    // Auth state listener
    window.firebase.auth.onAuthStateChanged(window.firebase.auth.auth, (user) => {
        if (user) {
            currentUser = user;
            signInBtn.style.display = 'none';
            userSection.style.display = 'flex';
            userName.textContent = user.displayName || user.email;
            loadCardsFromFirebase();
        } else {
            currentUser = null;
            signInBtn.style.display = 'inline-flex';
            userSection.style.display = 'none';
            exitEditMode();
            renderDefaultCards();
        }
    });

    // Sign in
    signInBtn.addEventListener('click', async () => {
        try {
            await window.firebase.auth.signInWithPopup(
                window.firebase.auth.auth,
                window.firebase.auth.provider
            );
        } catch (error) {
            console.error('Sign in error:', error);
            alert('Sign in failed. Please try again.');
        }
    });

    // Sign out
    signOutBtn.addEventListener('click', async () => {
        try {
            await window.firebase.auth.signOut(window.firebase.auth.auth);
        } catch (error) {
            console.error('Sign out error:', error);
        }
    });

    // Edit mode toggle
    editBtn.addEventListener('click', () => {
        editMode = !editMode;
        if (editMode) {
            enterEditMode();
            editBtn.textContent = 'Done';
            editBtn.classList.remove('btn-secondary');
            editBtn.classList.add('btn-primary');
        } else {
            exitEditMode();
            editBtn.textContent = 'Edit';
            editBtn.classList.remove('btn-primary');
            editBtn.classList.add('btn-secondary');
        }
    });

    setupModal();
    renderDefaultCards();
}

function setupModal() {
    const modal = document.getElementById('edit-modal');
    const modalClose = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('cancel-btn');
    const saveBtn = document.getElementById('save-btn');
    const deleteBtn = document.getElementById('delete-card-btn');
    const addLinkBtn = document.getElementById('add-link-btn');

    modalClose.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    modal.querySelector('.modal-overlay').addEventListener('click', closeModal);

    addLinkBtn.addEventListener('click', () => {
        addLinkRow();
    });

    saveBtn.addEventListener('click', saveCard);
    deleteBtn.addEventListener('click', deleteCard);
}

function enterEditMode() {
    document.querySelector('.cards-grid').classList.add('edit-mode');
    addEditButtons();
    addAddCardButton();
}

function exitEditMode() {
    document.querySelector('.cards-grid').classList.remove('edit-mode');
    removeEditButtons();
    removeAddCardButton();
}

function addEditButtons() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        if (!card.querySelector('.card-edit-btn')) {
            const btn = document.createElement('button');
            btn.className = 'btn btn-secondary btn-sm card-edit-btn';
            btn.textContent = 'Edit';
            btn.addEventListener('click', () => openEditModal(card));
            card.appendChild(btn);
        }
    });
}

function removeEditButtons() {
    document.querySelectorAll('.card-edit-btn').forEach(btn => btn.remove());
}

function addAddCardButton() {
    if (!document.getElementById('add-card-btn')) {
        const btn = document.createElement('div');
        btn.id = 'add-card-btn';
        btn.className = 'add-card-btn';
        btn.textContent = '+ Add Card';
        btn.addEventListener('click', () => openEditModal(null));
        document.querySelector('.cards-grid').appendChild(btn);
    }
}

function removeAddCardButton() {
    const btn = document.getElementById('add-card-btn');
    if (btn) btn.remove();
}

function openEditModal(cardElement) {
    const modal = document.getElementById('edit-modal');
    const titleInput = document.getElementById('card-title-input');
    const linksContainer = document.getElementById('links-container');
    const deleteBtn = document.getElementById('delete-card-btn');

    linksContainer.innerHTML = '';

    if (cardElement) {
        // Editing existing card
        const cardId = cardElement.dataset.cardId;
        if (!cardId) {
            console.error('Card ID is missing from element');
            alert('Unable to edit this card - missing ID');
            return;
        }
        const title = cardElement.querySelector('.card-title').textContent;
        const links = Array.from(cardElement.querySelectorAll('.card-links a')).map(a => ({
            text: a.textContent,
            url: a.href
        }));

        const order = parseInt(cardElement.dataset.order);
        currentEditingCard = {
            id: cardId,
            order: isNaN(order) ? 0 : order
        };

        titleInput.value = title;
        links.forEach(link => addLinkRow(link.text, link.url));
        deleteBtn.style.display = 'block';
    } else {
        // Adding new card
        currentEditingCard = null;
        titleInput.value = '';
        addLinkRow();
        deleteBtn.style.display = 'none';
    }

    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('edit-modal').style.display = 'none';
    currentEditingCard = null;
}

function addLinkRow(text = '', url = '') {
    const container = document.getElementById('links-container');
    const row = document.createElement('div');
    row.className = 'link-row';
    row.innerHTML = `
        <input type="text" class="link-text" placeholder="Link text" value="${text}">
        <input type="url" class="link-url" placeholder="https://example.com" value="${url}">
        <button class="remove-link-btn" type="button">×</button>
    `;

    row.querySelector('.remove-link-btn').addEventListener('click', () => {
        row.remove();
    });

    container.appendChild(row);
}

async function saveCard() {
    const title = document.getElementById('card-title-input').value.trim();
    if (!title) {
        alert('Title is required');
        return;
    }

    const linkRows = document.querySelectorAll('.link-row');
    const links = [];

    linkRows.forEach(row => {
        const text = row.querySelector('.link-text').value.trim();
        const url = row.querySelector('.link-url').value.trim();
        if (text && url) {
            links.push({ text, url });
        }
    });

    if (links.length === 0) {
        alert('At least one link is required');
        return;
    }

    try {
        let cardId, order;

        if (currentEditingCard) {
            cardId = currentEditingCard.id;
            order = Number.isFinite(currentEditingCard.order) ? currentEditingCard.order : 0;
        } else {
            cardId = `card-${Date.now()}`;
            const cardsRef = window.firebase.db.ref(window.firebase.db.database, 'cards');
            const snapshot = await window.firebase.db.get(cardsRef);

            if (snapshot.exists()) {
                const cards = snapshot.val();
                const maxOrder = Math.max(...Object.values(cards).map(c => c.order || 0));
                order = maxOrder + 1;
            } else {
                order = 0;
            }
        }

        const cardData = { title, links, order };
        const cardRef = window.firebase.db.ref(window.firebase.db.database, `cards/${cardId}`);
        await window.firebase.db.set(cardRef, cardData);

        closeModal();
        await loadCardsFromFirebase();
    } catch (error) {
        console.error('Save error:', error);
        alert('Failed to save card');
    }
}

async function deleteCard() {
    if (!currentEditingCard) return;

    if (!confirm('Delete this card?')) return;

    try {
        const cardRef = window.firebase.db.ref(
            window.firebase.db.database,
            `cards/${currentEditingCard.id}`
        );
        await window.firebase.db.remove(cardRef);

        closeModal();
        await loadCardsFromFirebase();
    } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete card');
    }
}

async function loadCardsFromFirebase() {
    try {
        const cardsRef = window.firebase.db.ref(window.firebase.db.database, 'cards');
        const snapshot = await window.firebase.db.get(cardsRef);

        if (!snapshot.exists()) {
            // Migrate default cards
            await migrateDefaultCards();
            return;
        }

        const cardsData = snapshot.val();
        const cardsArray = Object.entries(cardsData).map(([id, data]) => ({
            id,
            ...data
        }));

        cardsArray.sort((a, b) => (a.order || 0) - (b.order || 0));
        renderCards(cardsArray);
    } catch (error) {
        console.error('Load error:', error);
    }
}

async function migrateDefaultCards() {
    try {
        const promises = DEFAULT_CARDS.map(card => {
            const cardRef = window.firebase.db.ref(
                window.firebase.db.database,
                `cards/${card.id}`
            );
            return window.firebase.db.set(cardRef, {
                title: card.title,
                links: card.links,
                order: card.order
            });
        });

        await Promise.all(promises);
        await loadCardsFromFirebase();
    } catch (error) {
        console.error('Migration error:', error);
    }
}

function renderDefaultCards() {
    renderCards(DEFAULT_CARDS);
}

function renderCards(cards) {
    const grid = document.querySelector('.cards-grid');
    grid.querySelectorAll('.card').forEach(card => card.remove());

    cards.forEach(cardData => {
        const card = createCardElement(cardData);
        grid.appendChild(card);
    });

    if (editMode) {
        removeEditButtons();
        addEditButtons();
    }
}

function createCardElement(cardData) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.cardId = cardData.id;
    card.dataset.order = cardData.order;

    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = cardData.title;

    const linksList = document.createElement('ul');
    linksList.className = 'card-links';

    cardData.links.forEach(link => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.url;
        a.textContent = link.text;
        a.target = '_blank';
        li.appendChild(a);
        linksList.appendChild(li);
    });

    card.appendChild(title);
    card.appendChild(linksList);

    return card;
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFirebase);
} else {
    initFirebase();
}
