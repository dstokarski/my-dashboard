let currentUser = null;
let editMode = false;
let currentEditingCard = null;

function initializeFirebaseManager() {
    if (!window.firebaseAuth || !window.firebaseDB) {
        window.addEventListener('firebaseReady', () => {
            initializeFirebaseManager();
        }, { once: true });
        return;
    }

    const signInBtn = document.getElementById('sign-in-btn');
    const signOutBtn = document.getElementById('sign-out-btn');
    const userInfo = document.getElementById('user-info');
    const userName = document.getElementById('user-name');
    const editBtn = document.getElementById('edit-btn');
    const modal = document.getElementById('edit-modal');
    const modalClose = document.querySelector('.modal-close');
    const cardTitleInput = document.getElementById('card-title-input');
    const linksEditor = document.getElementById('links-editor');
    const addLinkBtn = document.getElementById('add-link-btn');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const deleteCardBtn = document.getElementById('delete-card-btn');

    // Authentication
    window.firebaseAuth.onAuthStateChanged(window.firebaseAuth.auth, (user) => {
        if (user) {
            currentUser = user;
            signInBtn.style.display = 'none';
            userInfo.style.display = 'flex';
            userName.textContent = user.displayName || user.email;
            checkAndLoadData();
        } else {
            currentUser = null;
            signInBtn.style.display = 'inline-block';
            userInfo.style.display = 'none';
            editMode = false;
            exitEditMode();
        }
    });

    signInBtn.addEventListener('click', async () => {
        try {
            await window.firebaseAuth.signInWithPopup(
                window.firebaseAuth.auth,
                window.firebaseAuth.provider
            );
        } catch (error) {
            console.error('Sign in error:', error);
            alert('Failed to sign in. Please try again.');
        }
    });

    signOutBtn.addEventListener('click', async () => {
        try {
            await window.firebaseAuth.signOut(window.firebaseAuth.auth);
        } catch (error) {
            console.error('Sign out error:', error);
        }
    });

    // Edit Mode
    editBtn.addEventListener('click', () => {
        editMode = !editMode;
        editBtn.textContent = editMode ? 'Done' : 'Edit';
        editBtn.classList.toggle('btn-primary', editMode);
        editBtn.classList.toggle('btn-secondary', !editMode);

        if (editMode) {
            enterEditMode();
        } else {
            exitEditMode();
        }
    });

    // Modal Controls
    addLinkBtn.addEventListener('click', () => addLinkRow());

    saveBtn.addEventListener('click', async () => {
        const title = cardTitleInput.value.trim();
        if (!title) {
            alert('Card title is required');
            return;
        }

        const linkRows = linksEditor.querySelectorAll('.link-row');
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
                order = currentEditingCard.order;
            } else {
                cardId = `card-${Date.now()}`;
                const cardsRef = window.firebaseDB.ref(window.firebaseDB.database, 'cards');
                const snapshot = await window.firebaseDB.get(cardsRef);

                if (snapshot.exists()) {
                    const cardsData = snapshot.val();
                    const maxOrder = Math.max(...Object.values(cardsData).map(card => card.order || 0));
                    order = maxOrder + 1;
                } else {
                    order = 0;
                }
            }

            const cardData = { title, links, order };
            const cardRef = window.firebaseDB.ref(window.firebaseDB.database, `cards/${cardId}`);
            await window.firebaseDB.set(cardRef, cardData);

            closeModal();
            await loadCards();
        } catch (error) {
            console.error('Error saving card:', error);
            alert('Failed to save card. Please try again.');
        }
    });

    deleteCardBtn.addEventListener('click', async () => {
        if (!currentEditingCard) return;

        if (!confirm('Are you sure you want to delete this card?')) return;

        try {
            const cardRef = window.firebaseDB.ref(
                window.firebaseDB.database,
                `cards/${currentEditingCard.id}`
            );
            await window.firebaseDB.remove(cardRef);

            closeModal();
            await loadCards();
        } catch (error) {
            console.error('Error deleting card:', error);
            alert('Failed to delete card. Please try again.');
        }
    });

    cancelBtn.addEventListener('click', closeModal);
    modalClose.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Make clear function available
    window.clearFirebaseData = async function() {
        if (!currentUser) {
            alert('Please sign in first');
            return;
        }

        if (!confirm('WARNING: This will permanently delete ALL cards from Firebase. Continue?')) {
            return;
        }

        try {
            const cardsRef = window.firebaseDB.ref(window.firebaseDB.database, 'cards');
            await window.firebaseDB.remove(cardsRef);
            alert('Database cleared');
            location.reload();
        } catch (error) {
            console.error('Error clearing database:', error);
            alert('Failed to clear database');
        }
    };
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
            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-secondary btn-sm card-edit-btn';
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => openEditModal(card));
            card.insertBefore(editBtn, card.firstChild);
        }
    });
}

function removeEditButtons() {
    document.querySelectorAll('.card-edit-btn').forEach(btn => btn.remove());
}

function addAddCardButton() {
    if (!document.getElementById('add-card-btn')) {
        const addCardBtn = document.createElement('div');
        addCardBtn.id = 'add-card-btn';
        addCardBtn.className = 'add-card-btn';
        addCardBtn.textContent = '+ Add Card';
        addCardBtn.addEventListener('click', () => openEditModal(null));
        document.querySelector('.cards-grid').appendChild(addCardBtn);
    }
}

function removeAddCardButton() {
    const addCardBtn = document.getElementById('add-card-btn');
    if (addCardBtn) addCardBtn.remove();
}

function openEditModal(card) {
    if (card) {
        const cardId = card.dataset.cardId;
        const order = parseInt(card.dataset.order);
        const title = card.querySelector('.card-title').textContent;
        const links = Array.from(card.querySelectorAll('.card-links a')).map(a => ({
            text: a.textContent,
            url: a.href
        }));

        currentEditingCard = { id: cardId, order, title, links };
        document.getElementById('card-title-input').value = title;
        document.getElementById('links-editor').innerHTML = '';
        links.forEach(link => addLinkRow(link.text, link.url));
        document.getElementById('delete-card-btn').style.display = 'block';
    } else {
        currentEditingCard = null;
        document.getElementById('card-title-input').value = '';
        document.getElementById('links-editor').innerHTML = '';
        addLinkRow('', '');
        document.getElementById('delete-card-btn').style.display = 'none';
    }

    document.getElementById('edit-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('edit-modal').style.display = 'none';
    currentEditingCard = null;
}

function addLinkRow(text = '', url = '') {
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

    document.getElementById('links-editor').appendChild(row);
}

async function checkAndLoadData() {
    try {
        const cardsRef = window.firebaseDB.ref(window.firebaseDB.database, 'cards');
        const snapshot = await window.firebaseDB.get(cardsRef);

        if (!snapshot.exists()) {
            await migrateDefaultCards();
        } else {
            await loadCards();
        }
    } catch (error) {
        console.error('Error checking data:', error);
    }
}

async function migrateDefaultCards() {
    const cards = document.querySelectorAll('.card');
    const promises = [];

    cards.forEach((card, index) => {
        const cardId = card.dataset.cardId;
        const title = card.querySelector('.card-title').textContent;
        const links = Array.from(card.querySelectorAll('.card-links a')).map(a => ({
            text: a.textContent,
            url: a.href
        }));

        const cardData = { title, links, order: index };
        const cardRef = window.firebaseDB.ref(window.firebaseDB.database, `cards/${cardId}`);
        promises.push(window.firebaseDB.set(cardRef, cardData));
    });

    try {
        await Promise.all(promises);
        console.log('Default cards migrated to Firebase');
        await loadCards();
    } catch (error) {
        console.error('Error migrating cards:', error);
    }
}

async function loadCards() {
    try {
        const cardsRef = window.firebaseDB.ref(window.firebaseDB.database, 'cards');
        const snapshot = await window.firebaseDB.get(cardsRef);

        if (!snapshot.exists()) return;

        const cardsData = snapshot.val();
        const cardsArray = Object.entries(cardsData).map(([id, data]) => ({
            id,
            ...data
        }));

        cardsArray.sort((a, b) => (a.order || 0) - (b.order || 0));

        const cardsGrid = document.querySelector('.cards-grid');
        cardsGrid.querySelectorAll('.card').forEach(card => card.remove());

        cardsArray.forEach(cardData => {
            const cardElement = createCardElement(cardData);
            cardsGrid.appendChild(cardElement);
        });

        if (editMode) {
            removeEditButtons();
            addEditButtons();
        }
    } catch (error) {
        console.error('Error loading cards:', error);
    }
}

function createCardElement(cardData) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.cardId = cardData.id;
    card.dataset.order = cardData.order;

    const title = document.createElement('h2');
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFirebaseManager);
} else {
    initializeFirebaseManager();
}
