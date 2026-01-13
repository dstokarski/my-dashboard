// Firebase Manager - Handles authentication, edit mode, and data operations

let currentUser = null;
let editMode = false;
let currentEditingCardId = null;

// Global references to elements
let signInBtn, signOutBtn, userInfo, userName, editModeBtn;
let editModal, modalClose, cardTitleInput, linksEditor, addLinkBtn, saveCardBtn, cancelEditBtn, deleteCardBtn;

// Wait for DOM and Firebase to be ready
function initializeFirebaseManager() {
    // Check if Firebase is available
    if (!window.firebaseAuth || !window.firebaseDB) {
        console.log('Waiting for Firebase to initialize...');
        setTimeout(initializeFirebaseManager, 100);
        return;
    }

    console.log('Firebase initialized, setting up manager...');

    // Authentication UI Elements
    signInBtn = document.getElementById('sign-in-btn');
    signOutBtn = document.getElementById('sign-out-btn');
    userInfo = document.getElementById('user-info');
    userName = document.getElementById('user-name');
    editModeBtn = document.getElementById('edit-mode-btn');

    // Modal Elements
    editModal = document.getElementById('edit-modal');
    modalClose = document.querySelector('.modal-close');
    cardTitleInput = document.getElementById('card-title-input');
    linksEditor = document.getElementById('links-editor');
    addLinkBtn = document.getElementById('add-link-btn');
    saveCardBtn = document.getElementById('save-card-btn');
    cancelEditBtn = document.getElementById('cancel-edit-btn');
    deleteCardBtn = document.getElementById('delete-card-btn');

    // Initialize authentication listener
    window.firebaseAuth.onAuthStateChanged(window.firebaseAuth.auth, (user) => {
        console.log('Auth state changed:', user ? user.email : 'No user');
        if (user) {
            currentUser = user;
            signInBtn.style.display = 'none';
            userInfo.style.display = 'flex';
            userName.textContent = user.displayName || user.email;
            editModeBtn.style.display = 'block';

            // Check if we need to migrate data
            checkAndMigrateData();
        } else {
            currentUser = null;
            signInBtn.style.display = 'block';
            userInfo.style.display = 'none';
            editModeBtn.style.display = 'none';
            editMode = false;
            removeEditButtons();
        }
    });

    // Sign In
    signInBtn.addEventListener('click', async () => {
        console.log('Sign in button clicked');
        try {
            const result = await window.firebaseAuth.signInWithPopup(
                window.firebaseAuth.auth,
                window.firebaseAuth.provider
            );
            console.log('Sign in successful:', result.user);
        } catch (error) {
            console.error('Sign in error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            alert(`Failed to sign in: ${error.message}`);
        }
    });

    // Sign Out
    signOutBtn.addEventListener('click', async () => {
        try {
            await window.firebaseAuth.signOut(window.firebaseAuth.auth);
            editMode = false;
            removeEditButtons();
        } catch (error) {
            console.error('Sign out error:', error);
        }
    });

    // Toggle Edit Mode
    editModeBtn.addEventListener('click', () => {
        editMode = !editMode;
        document.getElementById('edit-mode-text').textContent = editMode ? 'Done' : 'Edit';
        editModeBtn.classList.toggle('active', editMode);

        if (editMode) {
            addEditButtons();
        } else {
            removeEditButtons();
        }
    });

    // Save card
    saveCardBtn.addEventListener('click', async () => {
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
            const cardId = currentEditingCardId || `card-${Date.now()}`;
            const cardData = {
                title,
                links,
                order: currentEditingCardId ? null : Date.now()
            };

            const cardRef = window.firebaseDB.ref(
                window.firebaseDB.database,
                `cards/${cardId}`
            );

            await window.firebaseDB.set(cardRef, cardData);

            closeEditModal();
            await loadCardsFromFirebase();
        } catch (error) {
            console.error('Error saving card:', error);
            alert('Failed to save card. Please try again.');
        }
    });

    // Delete card
    deleteCardBtn.addEventListener('click', async () => {
        if (!currentEditingCardId) return;

        if (!confirm('Are you sure you want to delete this card?')) return;

        try {
            const cardRef = window.firebaseDB.ref(
                window.firebaseDB.database,
                `cards/${currentEditingCardId}`
            );

            await window.firebaseDB.remove(cardRef);

            closeEditModal();
            await loadCardsFromFirebase();
        } catch (error) {
            console.error('Error deleting card:', error);
            alert('Failed to delete card. Please try again.');
        }
    });

    // Cancel edit
    cancelEditBtn.addEventListener('click', closeEditModal);
    modalClose.addEventListener('click', closeEditModal);

    // Add link button
    addLinkBtn.addEventListener('click', () => addLinkRow());

    // Close modal on outside click
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });

    console.log('Firebase manager setup complete');
}

// Add edit buttons to all non-widget cards
function addEditButtons() {
    const cards = document.querySelectorAll('.card:not(.card-widget)');
    cards.forEach((card, index) => {
        if (!card.querySelector('.card-edit-btn')) {
            const editBtn = document.createElement('button');
            editBtn.className = 'card-edit-btn';
            editBtn.textContent = 'Edit';
            editBtn.dataset.cardId = `card-${index}`;
            editBtn.addEventListener('click', () => openEditModal(card, `card-${index}`));
            card.querySelector('.card-title').appendChild(editBtn);
        }
    });

    // Add "Add New Card" button
    if (!document.getElementById('add-card-btn')) {
        const addCardBtn = document.createElement('button');
        addCardBtn.id = 'add-card-btn';
        addCardBtn.className = 'add-card-btn';
        addCardBtn.textContent = '+ Add Card';
        addCardBtn.addEventListener('click', () => openEditModal(null, null));
        document.querySelector('.cards-grid').appendChild(addCardBtn);
    }
}

// Remove all edit buttons
function removeEditButtons() {
    document.querySelectorAll('.card-edit-btn').forEach(btn => btn.remove());
    const addCardBtn = document.getElementById('add-card-btn');
    if (addCardBtn) addCardBtn.remove();
}

// Open edit modal
function openEditModal(card, cardId) {
    currentEditingCardId = cardId;

    if (card) {
        // Editing existing card
        const title = card.querySelector('.card-title').textContent.replace('Edit', '').trim();
        const links = Array.from(card.querySelectorAll('.links-list a')).map(a => ({
            text: a.textContent,
            url: a.href
        }));

        cardTitleInput.value = title;
        linksEditor.innerHTML = '';
        links.forEach(link => addLinkRow(link.text, link.url));
        deleteCardBtn.style.display = 'block';
    } else {
        // Adding new card
        cardTitleInput.value = '';
        linksEditor.innerHTML = '';
        addLinkRow('', '');
        deleteCardBtn.style.display = 'none';
    }

    editModal.style.display = 'flex';
}

// Close edit modal
function closeEditModal() {
    editModal.style.display = 'none';
    currentEditingCardId = null;
}

// Add a link row to the editor
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

    linksEditor.appendChild(row);
}

// Check if data needs to be migrated
async function checkAndMigrateData() {
    try {
        const cardsRef = window.firebaseDB.ref(window.firebaseDB.database, 'cards');
        const snapshot = await window.firebaseDB.get(cardsRef);

        if (!snapshot.exists()) {
            // No data in Firebase, migrate from HTML
            console.log('No data found, migrating from HTML...');
            await migrateDataFromHTML();
        } else {
            // Data exists, load from Firebase
            console.log('Data found, loading from Firebase...');
            await loadCardsFromFirebase();
        }
    } catch (error) {
        console.error('Error checking data:', error);
    }
}

// Migrate existing cards from HTML to Firebase
async function migrateDataFromHTML() {
    const cards = document.querySelectorAll('.card:not(.card-widget)');
    const promises = [];

    cards.forEach((card, index) => {
        const title = card.querySelector('.card-title').textContent.trim();
        const links = Array.from(card.querySelectorAll('.links-list a')).map(a => ({
            text: a.textContent,
            url: a.href
        }));

        const cardData = {
            title,
            links,
            order: index
        };

        const cardRef = window.firebaseDB.ref(
            window.firebaseDB.database,
            `cards/card-${index}`
        );

        promises.push(window.firebaseDB.set(cardRef, cardData));
    });

    try {
        await Promise.all(promises);
        console.log('Data migration completed');
        await loadCardsFromFirebase();
    } catch (error) {
        console.error('Error migrating data:', error);
    }
}

// Load cards from Firebase and render
async function loadCardsFromFirebase() {
    try {
        const cardsRef = window.firebaseDB.ref(window.firebaseDB.database, 'cards');
        const snapshot = await window.firebaseDB.get(cardsRef);

        if (!snapshot.exists()) return;

        const cardsData = snapshot.val();
        const cardsArray = Object.entries(cardsData).map(([id, data]) => ({
            id,
            ...data
        }));

        // Sort by order
        cardsArray.sort((a, b) => a.order - b.order);

        // Find the cards grid and remove existing non-widget cards
        const cardsGrid = document.querySelector('.cards-grid');
        const existingCards = cardsGrid.querySelectorAll('.card:not(.card-widget)');
        existingCards.forEach(card => card.remove());

        // Get widget cards to insert regular cards before them
        const firstWidget = cardsGrid.querySelector('.card-widget');

        // Render cards
        cardsArray.forEach(cardData => {
            const cardElement = createCardElement(cardData);
            if (firstWidget) {
                cardsGrid.insertBefore(cardElement, firstWidget);
            } else {
                cardsGrid.appendChild(cardElement);
            }
        });

        // Re-add edit buttons if in edit mode
        if (editMode) {
            removeEditButtons();
            addEditButtons();
        }
    } catch (error) {
        console.error('Error loading cards:', error);
    }
}

// Create a card element from data
function createCardElement(cardData) {
    const card = document.createElement('div');
    card.className = 'card';

    const title = document.createElement('h2');
    title.className = 'card-title';
    title.textContent = cardData.title;

    const linksList = document.createElement('ul');
    linksList.className = 'links-list';

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

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFirebaseManager);
} else {
    initializeFirebaseManager();
}
