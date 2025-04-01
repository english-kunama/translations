<script type="module">
        // Import Firebase modules
        import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
        import { getDatabase, ref, push, set, query, get, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
        import { 
            getAuth, 
            signInAnonymously, 
            onAuthStateChanged, 
            createUserWithEmailAndPassword, 
            signInWithEmailAndPassword, 
            signOut,
            updateProfile
        } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

        // Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyDyOgYzDMZdo5V21T8fgHTvPhfgIavuxBA",
            authDomain: "kunama-academy-data.firebaseapp.com",
            databaseURL: "https://kunama-academy-data-default-rtdb.firebaseio.com",
            projectId: "kunama-academy-data",
            storageBucket: "kunama-academy-data.firebasestorage.app",
            messagingSenderId: "1089407925060",
            appId: "1:1089407925060:web:260a1f597ed520fc977511"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);
        const auth = getAuth(app);
        
        // Authentication state
        let currentUser = null;
        let isAnonymous = true;

        // User authentication management
        function setupAuthentication() {
            // Auth state changes
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    // User is signed in
                    currentUser = user;
                    isAnonymous = user.isAnonymous;
                    console.log("User is signed in with ID:", user.uid);
                    
                    // Store the user ID as contributor ID
                    localStorage.setItem("kunama_contributor_id", user.uid);
                    
                    // Update UI for authenticated user
                    updateAuthUI();
                } else {
                    // User is signed out
                    console.log("User is signed out");
                    currentUser = null;
                    isAnonymous = true;
                    
                    // Update UI for signed out user
                    updateAuthUI();
                }
            });
            
            // Add click event to user menu button
            document.getElementById('userMenuBtn').addEventListener('click', () => {
                if (currentUser) {
                    // Show profile section
                    toggleProfileSection();
                } else {
                    // Show auth modal
                    showAuthModal();
                }
            });
            
            // Setup auth modal
            setupAuthModal();
            
            // Setup profile section
            setupProfileSection();
        }
        
        // Update UI based on authentication state
        function updateAuthUI() {
            const userNameElement = document.getElementById('userName');
            const userIconElement = document.getElementById('userIcon');
            
            if (currentUser) {
                // Get display name from different sources in order of preference
                let displayName = getDisplayName();
                
                // Update user menu
                userNameElement.textContent = displayName;
                userIconElement.textContent = '👤';
                
                // Update profile section
                document.getElementById('profileName').textContent = displayName;
                document.getElementById('profileEmail').textContent = currentUser.email || 'Anonymous User';
                document.getElementById('profileAvatar').textContent = getInitials(displayName);
                document.getElementById('displayNameInput').value = displayName;
            } else {
                // Update for non-authenticated user
                userNameElement.textContent = 'Sign in';
                userIconElement.textContent = '👤';
                
                // Hide profile section if it's open
                document.getElementById('userProfileSection').style.display = 'none';
            }
        }
        
        // Toggle profile section visibility
        function toggleProfileSection() {
            const profileSection = document.getElementById('userProfileSection');
            
            if (profileSection.style.display === 'none' || !profileSection.style.display) {
                profileSection.style.display = 'block';
            } else {
                profileSection.style.display = 'none';
            }
        }
        
        // Get display name from various sources
        function getDisplayName() {
            // Order of preference: 
            // 1. Custom display name in localStorage
            // 2. Firebase auth display name
            // 3. Email username
            // 4. "Anonymous User"
            const storedName = localStorage.getItem('kunama_display_name');
            
            if (storedName) {
                return storedName;
            } else if (currentUser && currentUser.displayName) {
                return currentUser.displayName;
            } else if (currentUser && currentUser.email) {
                return currentUser.email.split('@')[0];
            } else {
                return 'Anonymous User';
            }
        }
        
        // Get initials from name for avatar
        function getInitials(name) {
            if (!name || name === 'Anonymous User') return '?';
            
            const parts = name.split(' ');
            if (parts.length === 1) {
                return name.charAt(0).toUpperCase();
            } else {
                return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
            }
        }
        
        // Setup auth modal
        function setupAuthModal() {
            // Tab switching
            document.querySelectorAll('.auth-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    // Remove active class from all tabs
                    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
                    
                    // Add active class to clicked tab
                    tab.classList.add('active');
                    document.getElementById(tab.dataset.tab + 'Form').classList.add('active');
                });
            });
            
            // Switch between forms
            document.getElementById('switchToSignup').addEventListener('click', () => {
                document.querySelector('.auth-tab[data-tab="signup"]').click();
            });
            
            document.getElementById('switchToSignin').addEventListener('click', () => {
                document.querySelector('.auth-tab[data-tab="signin"]').click();
            });
            
            // Continue anonymously
            document.getElementById('continueAnonymously').addEventListener('click', () => {
                signInAnonymously(auth)
                    .then(() => {
                        hideAuthModal();
                        showNotification('Continuing anonymously');
                    })
                    .catch(error => {
                        console.error('Error signing in anonymously:', error);
                        showNotification('Failed to sign in anonymously', 'error');
                    });
            });
            
            document.getElementById('continueAnonymously2').addEventListener('click', () => {
                signInAnonymously(auth)
                    .then(() => {
                        hideAuthModal();
                        showNotification('Continuing anonymously');
                    })
                    .catch(error => {
                        console.error('Error signing in anonymously:', error);
                        showNotification('Failed to sign in anonymously', 'error');
                    });
            });
            
            // Sign in
            document.getElementById('signinBtn').addEventListener('click', () => {
                const email = document.getElementById('signinEmail').value;
                const password = document.getElementById('signinPassword').value;
                
                if (!email || !password) {
                    showNotification('Please enter both email and password', 'error');
                    return;
                }
                
                signInWithEmailAndPassword(auth, email, password)
                    .then(() => {
                        hideAuthModal();
                        showNotification('Signed in successfully');
                    })
                    .catch(error => {
                        console.error('Error signing in:', error);
                        showNotification('Failed to sign in: ' + error.message, 'error');
                    });
            });
            
            // Sign up
            document.getElementById('signupBtn').addEventListener('click', () => {
                const name = document.getElementById('signupName').value;
                const email = document.getElementById('signupEmail').value;
                const password = document.getElementById('signupPassword').value;
                
                if (!name || !email || !password) {
                    showNotification('Please fill in all fields', 'error');
                    return;
                }
                
                createUserWithEmailAndPassword(auth, email, password)
                    .then(userCredential => {
                        // Set display name
                        updateProfile(userCredential.user, {
                            displayName: name
                        }).then(() => {
                            // Also save to localStorage
                            localStorage.setItem('kunama_display_name', name);
                            
                            hideAuthModal();
                            showNotification('Account created successfully');
                        });
                    })
                    .catch(error => {
                        console.error('Error signing up:', error);
                        showNotification('Failed to create account: ' + error.message, 'error');
                    });
            });
        }
        
        // Setup profile section
        function setupProfileSection() {
            // Save profile button
            document.getElementById('saveProfileBtn').addEventListener('click', () => {
                const displayName = document.getElementById('displayNameInput').value;
                
                if (!displayName) {
                    showNotification('Please enter a display name', 'error');
                    return;
                }
                
                // Save to localStorage
                localStorage.setItem('kunama_display_name', displayName);
                
                // If user is authenticated (not anonymous), update profile in Firebase
                if (currentUser && !isAnonymous) {
                    updateProfile(currentUser, {
                        displayName: displayName
                    }).then(() => {
                        updateAuthUI();
                        showNotification('Profile saved successfully');
                    }).catch(error => {
                        console.error('Error updating profile:', error);
                        // Still update local UI since we saved to localStorage
                        updateAuthUI();
                        showNotification('Profile saved locally');
                    });
                } else {
                    // Just update the UI for anonymous users
                    updateAuthUI();
                    showNotification('Profile saved locally');
                }
            });
            
            // Sign out button
            document.getElementById('signOutBtn').addEventListener('click', () => {
                signOut(auth).then(() => {
                    showNotification('Signed out successfully');
                    
                    // Create a placeholder anonymous user for app functionality
                    const contributorId = "anonymous_" + Math.random().toString(36).substr(2, 9);
                    localStorage.setItem("kunama_contributor_id", contributorId);
                    updateAuthUI();
                }).catch(error => {
                    console.error('Error signing out:', error);
                    showNotification('Failed to sign out', 'error');
                });
            });
        }
        
        // Show auth modal
        function showAuthModal() {
            document.getElementById('authModal').style.display = 'flex';
        }
        
        // Hide auth modal
        function hideAuthModal() {
            document.getElementById('authModal').style.display = 'none';
            
            // Clear inputs
            document.getElementById('signinEmail').value = '';
            document.getElementById('signinPassword').value = '';
            document.getElementById('signupName').value = '';
            document.getElementById('signupEmail').value = '';
            document.getElementById('signupPassword').value = '';
        }

        // Utility functions
        function escapeHTML(str) {
            if (!str) return '';
            return str
                .toString()
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function formatRelativeTime(timestamp) {
            if (!timestamp) return "Recently";
            
            const now = new Date();
            const date = new Date(timestamp);
            const diffSeconds = Math.floor((now - date) / 1000);
            
            if (diffSeconds < 60) return "Just now";
            if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
            if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
            if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)} days ago`;
            
            return date.toLocaleDateString();
        }

        function showNotification(message, type = "success") {
            const notification = document.createElement("div");
            notification.className = `notification ${type}`;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            // Fade in
            setTimeout(() => {
                notification.style.opacity = "1";
                notification.style.transform = "translateY(0)";
            }, 10);
            
            // Fade out and remove
            setTimeout(() => {
                notification.style.opacity = "0";
                notification.style.transform = "translateY(-20px)";
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 2000);
        }

        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                showNotification("Copied to clipboard!");
            }).catch(err => {
                console.error('Could not copy text: ', err);
                showNotification("Copy failed", "error");
            });
        }

        // Progress bar functionality
        function updateProgressBar() {
            const goal = 5000; // Total goal of submissions
            const submissionCountRef = ref(db, 'submission_count');  // Reference to 'submission_count'

            // Get the current submission count
            get(submissionCountRef).then((snapshot) => {
                const numSubmissions = snapshot.exists() ? snapshot.val() : 0;  // Get the current submission count
                const percentage = Math.min((numSubmissions / goal) * 100, 100);  // Ensure percentage does not exceed 100%

                // Update the progress bar
                document.getElementById("progressBar").style.width = percentage + "%";
                document.getElementById("progressText").innerText = `${numSubmissions} / ${goal} submissions (${Math.round(percentage)}%)`;
            }).catch((error) => {
                console.error("Error fetching submission count:", error);
            });
        }

        // Character counter functionality
        function setupCharacterCounters() {
            const inputFields = [
                { input: document.getElementById("newPhrase"), counter: "phraseCounter", limit: 200 },
                { input: document.getElementById("newTranslation"), counter: "translationCounter", limit: 200 }
            ];
            
            // Create counter elements if they don't exist
            inputFields.forEach(field => {
                const counterEl = document.createElement("span");
                counterEl.id = field.counter;
                counterEl.className = "char-counter";
                field.input.parentNode.insertBefore(counterEl, field.input.nextSibling);
                
                // Initial count
                updateCounter(field.input, counterEl, field.limit);
                
                // Add event listener for input changes
                field.input.addEventListener("input", () => {
                    updateCounter(field.input, counterEl, field.limit);
                });
            });
        }

        // Update counter display
        function updateCounter(inputElement, counterElement, limit) {
            const currentLength = inputElement.value.length;
            counterElement.textContent = `${currentLength}/${limit}`;
            
            // Visual feedback for approaching limit
            if (currentLength > limit * 0.8) {
                counterElement.style.color = "#ff9800";
            } else {
                counterElement.style.color = "#777";
            }
            
            // Visual feedback for exceeding limit
            if (currentLength > limit) {
                counterElement.style.color = "#f44336";
            }
        }

        // Auto-save functionality
        function setupAutoSave() {
            const inputFields = [
                { id: "newPhrase", storageKey: "kunama_autosave_phrase" },
                { id: "newTranslation", storageKey: "kunama_autosave_translation" },
                { id: "newCategory", storageKey: "kunama_autosave_category" }
            ];
            
            // Load saved data on page load
            inputFields.forEach(field => {
                const savedValue = localStorage.getItem(field.storageKey);
                if (savedValue) {
                    document.getElementById(field.id).value = savedValue;
                }
                
                // Set up auto-save on input
                document.getElementById(field.id).addEventListener("input", (e) => {
                    localStorage.setItem(field.storageKey, e.target.value);
                    showAutoSaveIndicator();
                });
            });
        }

        function showAutoSaveIndicator() {
            // Create or update autosave indicator
            let indicator = document.getElementById("autosaveIndicator");
            if (!indicator) {
                indicator = document.createElement("span");
                indicator.id = "autosaveIndicator";
                indicator.className = "autosave-indicator";
                document.getElementById("addFormContainer").appendChild(indicator);
            }
            
            // Show saving message
            indicator.innerHTML = "Auto-saving...";
            indicator.style.opacity = "1";
            
            // Hide message after delay
            setTimeout(() => {
                indicator.innerHTML = "Saved";
                setTimeout(() => {
                    indicator.style.opacity = "0";
                }, 800);
            }, 700);
        }

        // Clear saved data after successful submission
        function clearAutoSavedData() {
            localStorage.removeItem("kunama_autosave_phrase");
            localStorage.removeItem("kunama_autosave_translation");
            localStorage.removeItem("kunama_autosave_category");
        }

        // Confirmation dialog for submission
        function confirmSubmission(phrase, translation, category, onConfirm) {
            // Create modal elements
            const modalOverlay = document.createElement("div");
            modalOverlay.className = "modal-overlay";
            
            const modalContent = document.createElement("div");
            modalContent.className = "modal-content";
            
            // Add content to modal
            modalContent.innerHTML = `
                <h3>Confirm Submission</h3>
                <p>Are you sure you want to submit the following translation?</p>
                <div class="confirm-details">
                    <p><strong>English:</strong> ${escapeHTML(phrase)}</p>
                    <p><strong>Kunama:</strong> ${escapeHTML(translation)}</p>
                    ${category ? `<p><strong>Category:</strong> ${escapeHTML(category)}</p>` : ''}
                </div>
                <div class="confirm-buttons">
                    <button id="confirmCancel" class="button button-secondary">Cancel</button>
                    <button id="confirmSubmit" class="button">Submit</button>
                </div>
            `;
            
            // Add modal to page
            modalOverlay.appendChild(modalContent);
            document.body.appendChild(modalOverlay);
            
            // Handle buttons
            document.getElementById("confirmCancel").addEventListener("click", () => {
                document.body.removeChild(modalOverlay);
            });
            
            document.getElementById("confirmSubmit").addEventListener("click", () => {
                document.body.removeChild(modalOverlay);
                onConfirm();
            });
        }

        // Add new phrase to Firebase with contributor name
        function addNewPhraseToFirebase(phrase, translation, category = "") {
            // Get contributor ID from Firebase Auth or generate a temporary one
            const contributorId = currentUser ? currentUser.uid : "anonymous_" + Math.random().toString(36).substr(2, 9);
            
            // Get contributor name from various sources
            const contributorName = getDisplayName();
            
            // Save contribution information
            const newSubmissionsRef = ref(db, 'pending_submissions');
            const newPhraseRef = push(newSubmissionsRef);
            set(newPhraseRef, { 
                phrase, 
                translation,
                category, 
                timestamp: new Date().toISOString(),
                contributorId: contributorId,
                contributorName: contributorName
            }).then(() => {
                // Increment the submission count
                const submissionCountRef = ref(db, 'submission_count');
                get(submissionCountRef).then((snapshot) => {
                    const currentCount = snapshot.exists() ? snapshot.val() : 0;
                    const newCount = currentCount + 1;

                    // Update the submission count
                    set(submissionCountRef, newCount)
                        .then(() => {
                            console.log("Submission count updated successfully!");
                        })
                        .catch((error) => {
                            console.error("Error updating submission count:", error);
                        });
                }).catch((error) => {
                    console.error("Error fetching submission count:", error);
                });

                document.getElementById("statusMessage").innerText = "✅ Added, waiting for approval!";
                document.getElementById("newPhrase").value = "";  
                document.getElementById("newTranslation").value = "";
                document.getElementById("newCategory").value = "";
                
                // Clear auto-saved data after successful submission
                clearAutoSavedData();

                // Update the progress bar after successful submission
                updateProgressBar();
                
                // Update contributor leaderboard
                fetchContributorLeaderboard();

                // Show success notification
                showNotification("Translation submitted successfully!", "success");

                setTimeout(() => {
                    document.getElementById("statusMessage").innerText = "";
                }, 3000);  // Clear the status message after 3 seconds
            }).catch((error) => {
                document.getElementById("statusMessage").innerText = "❌ Error: " + error.message;
                showNotification("Error submitting translation", "error");
            });
        }

        // Recent translations display
        function fetchRecentTranslations() {
            const recentContainer = document.getElementById("recentTranslations");
            const approvedPhrasesRef = ref(db, 'approved_phrases');
            
            // Query to get the 5 most recent approved phrases
            const recentQuery = query(approvedPhrasesRef, orderByChild('timestamp'), limitToLast(5));
            
            get(recentQuery).then((snapshot) => {
                recentContainer.innerHTML = "<h3>Recently Added</h3>";
                
                if (snapshot.exists()) {
                    // Convert to array and reverse to get newest first
                    const entries = [];
                    snapshot.forEach(childSnapshot => {
                        entries.push({
                            id: childSnapshot.key,
                            ...childSnapshot.val()
                        });
                    });
                    
                    // Sort by timestamp (newest first) and take the top 3
                    entries.sort((a, b) => {
                        return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
                    }).slice(0, 3).forEach(entry => {
                        const entryElement = document.createElement("div");
                        entryElement.className = "recent-item";
                        entryElement.innerHTML = `
                            <p><strong>${escapeHTML(entry.phrase)}</strong> → ${escapeHTML(entry.translation)}</p>
                            <span class="recent-date">${formatRelativeTime(entry.timestamp)}</span>
                        `;
                        recentContainer.appendChild(entryElement);
                    });
                } else {
                    recentContainer.innerHTML += "<p>No recent translations available.</p>";
                }
            }).catch((error) => {
                console.error("Error fetching recent translations:", error);
                recentContainer.innerHTML += "<p>❌ Error loading recent translations.</p>";
            });
        }

        // Contributor leaderboard - filtering out system/admin contributions
        function fetchContributorLeaderboard() {
            const leaderboardContainer = document.getElementById("contributorLeaderboard");
            const submissionsRef = ref(db, 'approved_phrases');
            
            get(submissionsRef).then((snapshot) => {
                if (snapshot.exists()) {
                    // Count contributions by contributor ID/name
                    const contributors = {};
                    
                    // System IDs to exclude from leaderboard
                    const systemIds = [
                        'system', 'admin', 'bot', 'initialize', 'initial',
                        'admin_user', 'administrator', 'init_data', 'migration'
                    ];
                    
                    snapshot.forEach(childSnapshot => {
                        const data = childSnapshot.val();
                        
                        // Get contributor name or ID
                        const contributorName = data.contributorName || data.contributor || "Anonymous";
                        const contributorId = data.contributorId || "";
                        
                        // Skip system/admin/initial contributions
                        if (systemIds.some(id => 
                            contributorId.toLowerCase().includes(id) || 
                            contributorName.toLowerCase().includes(id)
                        )) {
                            return; // Skip this iteration
                        }
                        
                        // Skip entries without timestamp (likely initial data)
                        if (!data.timestamp) {
                            return; // Skip this iteration
                        }
                        
                        // Track contributions
                        if (!contributors[contributorName]) {
                            contributors[contributorName] = 0;
                        }
                        
                        contributors[contributorName]++;
                    });
                    
                    // Convert to array and sort
                    const sortedContributors = Object.entries(contributors)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 10); // Top 10 contributors
                    
                    // Display leaderboard
                    leaderboardContainer.innerHTML = "<h3>Top Contributors</h3>";
                    
                    if (sortedContributors.length > 0) {
                        const leaderboardList = document.createElement("ol");
                        leaderboardList.className = "leaderboard-list";
                        
                        sortedContributors.forEach(([name, count], index) => {
                            const listItem = document.createElement("li");
                            let medal = "";
                            
                            // Add medals for top 3
                            if (index === 0) medal = "🥇 ";
                            else if (index === 1) medal = "🥈 ";
                            else if (index === 2) medal = "🥉 ";
                            
                            listItem.innerHTML = `
                                <span class="contributor-name">${medal}${escapeHTML(name)}</span>
                                <span class="contribution-count">${count} translation${count !== 1 ? 's' : ''}</span>
                            `;
                            
                            leaderboardList.appendChild(listItem);
                        });
                        
                        leaderboardContainer.appendChild(leaderboardList);
                    } else {
                        leaderboardContainer.innerHTML += "<p>No user contributions yet. Be the first!</p>";
                    }
                } else {
                    leaderboardContainer.innerHTML = "<h3>Top Contributors</h3><p>No contributors yet.</p>";
                }
            }).catch((error) => {
                console.error("Error fetching contributor data:", error);
                leaderboardContainer.innerHTML = "<h3>Top Contributors</h3><p>❌ Error loading contributor data.</p>";
            });
        }

        // Voting system functionality
        function handleVote(phraseId, voteType) {
            console.log(`Processing vote: ${voteType} for phrase ID: ${phraseId}`);
            
            // Reference to the votes in the database
            const voteRef = ref(db, `votes/${phraseId}`);
            
            // Get current vote counts
            get(voteRef).then((snapshot) => {
                let upvotes = 0;
                let downvotes = 0;
                
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    upvotes = data.upvotes || 0;
                    downvotes = data.downvotes || 0;
                    console.log(`Current votes - Up: ${upvotes}, Down: ${downvotes}`);
                }
                
                // Update votes based on vote type
                if (voteType === 'up') {
                    upvotes++;
                } else if (voteType === 'down') {
                    downvotes++;
                }
                
                console.log(`Updating to - Up: ${upvotes}, Down: ${downvotes}`);
                
                // Save updated votes
                set(voteRef, {
                    upvotes,
                    downvotes,
                    score: upvotes - downvotes,
                    timestamp: new Date().toISOString()
                }).then(() => {
                    console.log("Vote saved successfully");
                    
                    // Update UI immediately
                    updateVoteDisplay(phraseId, upvotes, downvotes);
                    
                    // Save voted items to localStorage to prevent duplicate votes
                    saveVoteToLocalStorage(phraseId);
                    
                    // Show notification
                    showNotification("Vote recorded!", "success");
                }).catch((error) => {
                    console.error("Error updating votes:", error);
                    showNotification("Error recording vote", "error");
                });
            }).catch((error) => {
                console.error("Error fetching votes:", error);
                showNotification("Error fetching votes", "error");
            });
        }

        // Add vote buttons to search results
        function addVoteButtons(resultItem, phraseId) {
            console.log(`Adding vote buttons for phrase ID: ${phraseId}`);
            
            // Create vote container
            const voteContainer = document.createElement("div");
            voteContainer.className = "vote-container";
            voteContainer.innerHTML = `
                <span class="vote-label">Helpful?</span>
                <button class="vote-button upvote" data-id="${phraseId}">👍 <span class="vote-count">0</span></button>
                <button class="vote-button downvote" data-id="${phraseId}">👎 <span class="vote-count">0</span></button>
            `;
            
            // Append to result item
            resultItem.appendChild(voteContainer);
            
            // Add event listeners
            voteContainer.querySelector(".upvote").addEventListener("click", (e) => {
                if (!hasVoted(phraseId)) {
                    handleVote(phraseId, 'up');
                } else {
                    showVoteMessage(e.target, "You've already voted");
                }
            });
            
            voteContainer.querySelector(".downvote").addEventListener("click", (e) => {
                if (!hasVoted(phraseId)) {
                    handleVote(phraseId, 'down');
                } else {
                    showVoteMessage(e.target, "You've already voted");
                }
            });
            
            // Load current votes
            loadVotes(phraseId);
        }

        // Load current votes from Firebase
        function loadVotes(phraseId) {
            const voteRef = ref(db, `votes/${phraseId}`);
            get(voteRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    updateVoteDisplay(phraseId, data.upvotes || 0, data.downvotes || 0);
                }
            }).catch((error) => {
                console.error("Error loading votes:", error);
            });
        }

        // Update vote display
        function updateVoteDisplay(phraseId, upvotes, downvotes) {
            const resultItem = document.querySelector(`.result-item[data-id="${phraseId}"]`);
            if (resultItem) {
                resultItem.querySelector(".upvote .vote-count").textContent = upvotes;
                resultItem.querySelector(".downvote .vote-count").textContent = downvotes;
            }
        }

        // Save voted items to localStorage
        function saveVoteToLocalStorage(phraseId) {
            const votedItems = JSON.parse(localStorage.getItem("kunama_voted_items") || "[]");
            if (!votedItems.includes(phraseId)) {
                votedItems.push(phraseId);
                localStorage.setItem("kunama_voted_items", JSON.stringify(votedItems));
            }
        }

        // Check if user has already voted
        function hasVoted(phraseId) {
            const votedItems = JSON.parse(localStorage.getItem("kunama_voted_items") || "[]");
            return votedItems.includes(phraseId);
        }

        // Show vote message
        function showVoteMessage(element, message) {
            const messageEl = document.createElement("span");
            messageEl.className = "vote-message";
            messageEl.textContent = message;
            
            element.parentNode.appendChild(messageEl);
            
            setTimeout(() => {
                messageEl.remove();
            }, 2000);
        }

        // Text-to-speech functionality
        function setupTextToSpeech() {
            // Check if browser supports speech synthesis
            if ('speechSynthesis' in window) {
                console.log("Text-to-speech is supported in this browser");
            } else {
                console.log("Text-to-speech is not supported in this browser");
            }
        }

        // Function to speak text using the Web Speech API
        function speakText(text) {
            if ('speechSynthesis' in window) {
                // Cancel any ongoing speech
                window.speechSynthesis.cancel();
                
                // Create a new speech utterance
                const utterance = new SpeechSynthesisUtterance(text);
                
                // Set language based on content
                // Try to detect if it's English or Kunama by checking for common English words
                const commonEnglishWords = ["the", "is", "and", "to", "of", "a", "in", "that", "have", "it"];
                const words = text.toLowerCase().split(/\s+/);
                const containsEnglishWords = words.some(word => commonEnglishWords.includes(word));
                
                // Set language based on detection
                utterance.lang = containsEnglishWords ? 'en-US' : 'und'; // 'und' for undefined/unknown language
                
                // Get available voices
                const voices = window.speechSynthesis.getVoices();
                if (voices.length > 0) {
                    // Try to find an appropriate voice
                    if (containsEnglishWords) {
                        // Find an English voice
                        const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
                        if (englishVoice) utterance.voice = englishVoice;
                    }
                }
                
                // Speak the utterance
                window.speechSynthesis.speak(utterance);
                
                // Show notification
                showNotification("Playing audio...");
            } else {
                showNotification("Text-to-speech is not supported in your browser", "error");
            }
        }

        // Client-side caching
        function setupCaching() {
            // Create an in-memory cache for search results
            window.kunamaCache = {
                searchResults: {},
                maxCacheSize: 20,
                
                // Add results to cache
                addToCache: function(searchTerm, results) {
                    // Only cache if we have results and it's not a super short query
                    if (results.length > 0 && searchTerm.length >= 3) {
                        this.searchResults[searchTerm.toLowerCase()] = {
                            results: results,
                            timestamp: Date.now()
                        };
                        
                        // Prune cache if it's too large
                        this.pruneCache();
                    }
                },
                
                // Get results from cache
                getFromCache: function(searchTerm) {
                    const cacheEntry = this.searchResults[searchTerm.toLowerCase()];
                    if (cacheEntry) {
                        // Check if cache is still fresh (less than 5 minutes old)
                        const isFresh = (Date.now() - cacheEntry.timestamp) < (5 * 60 * 1000);
                        if (isFresh) {
                            return cacheEntry.results;
                        } else {
                            // Remove stale entry
                            delete this.searchResults[searchTerm.toLowerCase()];
                        }
                    }
                    return null;
                },
                
                // Prune cache when it gets too big
                pruneCache: function() {
                    const keys = Object.keys(this.searchResults);
                    if (keys.length > this.maxCacheSize) {
                        // Sort by timestamp (oldest first)
                        keys.sort((a, b) => {
                            return this.searchResults[a].timestamp - this.searchResults[b].timestamp;
                        });
                        
                        // Remove oldest entries
                        const keysToRemove = keys.slice(0, keys.length - this.maxCacheSize);
                        keysToRemove.forEach(key => {
                            delete this.searchResults[key];
                        });
                    }
                },
                
                // Clear the entire cache
                clearCache: function() {
                    this.searchResults = {};
                }
            };
        }

        // Dark mode functionality
        function setupDarkMode() {
            // Create dark mode toggle button
            const darkModeToggle = document.createElement("button");
            darkModeToggle.id = "darkModeToggle";
            darkModeToggle.className = "dark-mode-toggle";
            darkModeToggle.title = "Toggle Dark Mode";
            darkModeToggle.innerHTML = "🌓";
            
            // Add to page
            document.querySelector(".container").appendChild(darkModeToggle);
            
            // Check for saved preference
            const darkModeEnabled = localStorage.getItem("kunama_dark_mode") === "true";
            if (darkModeEnabled) {
                document.body.classList.add("dark-mode");
            }
            
            // Toggle dark mode
            darkModeToggle.addEventListener("click", () => {
                document.body.classList.toggle("dark-mode");
                const isDarkMode = document.body.classList.contains("dark-mode");
                localStorage.setItem("kunama_dark_mode", isDarkMode);
            });
        }

        // Search filters functionality
        function setupSearchFilters() {
            // Create filter container
            const filterContainer = document.createElement("div");
            filterContainer.id = "searchFilterContainer";
            filterContainer.className = "search-filter-container";
            
            // Add filter options
            filterContainer.innerHTML = `
                <button id="toggleFilters" class="filter-toggle">🔍 Filters</button>
                <div id="filterOptions" class="filter-options">
                    <div class="filter-group">
                        <label>Category:</label>
                        <select id="categoryFilter">
                            <option value="">All Categories</option>
                            <option value="greetings">Greetings</option>
                            <option value="food">Food</option>
                            <option value="family">Family</option>
                            <option value="numbers">Numbers</option>
                            <option value="common">Common Phrases</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Sort By:</label>
                        <select id="sortFilter">
                            <option value="relevance">Relevance</option>
                            <option value="newest">Newest First</option>
                            <option value="votes">Highest Rated</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Search In:</label>
                        <div class="checkbox-group">
                            <label><input type="checkbox" id="searchEnglish" checked> English</label>
                            <label><input type="checkbox" id="searchKunama" checked> Kunama</label>
                        </div>
                    </div>
                    <button id="applyFilters" class="button button-small">Apply Filters</button>
                </div>
            `;
            
            // Insert after search input
            const searchInput = document.getElementById("searchInput");
            searchInput.parentNode.insertBefore(filterContainer, searchInput.nextSibling);
            
            // Toggle filter options visibility
            document.getElementById("toggleFilters").addEventListener("click", () => {
                const filterOptions = document.getElementById("filterOptions");
                filterOptions.style.display = filterOptions.style.display === "block" ? "none" : "block";
            });
            
            // Apply filters button
            document.getElementById("applyFilters").addEventListener("click", () => {
                const searchTerm = document.getElementById("searchInput").value;
                if (searchTerm) {
                    searchPhraseWithFilters(searchTerm);
                }
                document.getElementById("filterOptions").style.display = "none";
            });
        }

        // Search history functionality
        function setupSearchHistory() {
            // Create history button
            const historyButton = document.createElement("button");
            historyButton.id = "searchHistoryButton";
            historyButton.className = "history-button";
            historyButton.title = "Search History";
            historyButton.innerHTML = "📜";
            
            // Create history container
            const historyContainer = document.createElement("div");
            historyContainer.id = "searchHistoryContainer";
            historyContainer.className = "search-history-container";
            historyContainer.style.display = "none";
            
            // Add elements to page
            const searchInput = document.getElementById("searchInput");
            searchInput.parentNode.insertBefore(historyButton, searchInput.nextSibling);
            searchInput.parentNode.insertBefore(historyContainer, historyButton.nextSibling);
            
            // Toggle history visibility
            historyButton.addEventListener("click", () => {
                if (historyContainer.style.display === "none") {
                    displaySearchHistory();
                    historyContainer.style.display = "block";
                } else {
                    historyContainer.style.display = "none";
                }
            });
        }

        // Function to save search to history
        function saveSearchToHistory(searchTerm) {
            // Don't save empty searches
            if (!searchTerm.trim()) return;
            
            // Get existing history
            let searchHistory = JSON.parse(localStorage.getItem("kunama_search_history") || "[]");
            
            // Check if search term already exists in history
            const existingIndex = searchHistory.indexOf(searchTerm);
            if (existingIndex !== -1) {
                // Remove existing entry to move it to top
                searchHistory.splice(existingIndex, 1);
            }
            
            // Add to beginning of array
            searchHistory.unshift(searchTerm);
            
            // Limit to 10 items
            searchHistory = searchHistory.slice(0, 10);
            
            // Save back to localStorage
            localStorage.setItem("kunama_search_history", JSON.stringify(searchHistory));
            
            // Update UI if history drawer is open
            if (document.getElementById("searchHistoryContainer") && 
                document.getElementById("searchHistoryContainer").style.display === "block") {
                displaySearchHistory();
            }
        }

        // Function to display search history
        function displaySearchHistory() {
            const historyContainer = document.getElementById("searchHistoryContainer");
            const searchHistory = JSON.parse(localStorage.getItem("kunama_search_history") || "[]");
            
            if (searchHistory.length === 0) {
                historyContainer.innerHTML = "<p>No search history</p>";
                return;
            }
            
            const historyList = document.createElement("ul");
            historyList.className = "search-history-list";
            
            searchHistory.forEach(term => {
                const listItem = document.createElement("li");
                listItem.className = "history-item";
                
                // Create item content
                const historyText = document.createElement("span");
                historyText.textContent = term;
                historyText.className = "history-text";
                
                const historyActions = document.createElement("div");
                historyActions.className = "history-actions";
                historyActions.innerHTML = `
                    <button class="history-search" title="Search Again">🔍</button>
                    <button class="history-delete" title="Remove">❌</button>
                `;
                
                listItem.appendChild(historyText);
                listItem.appendChild(historyActions);
                historyList.appendChild(listItem);
                
                // Add event listeners
                listItem.querySelector(".history-search").addEventListener("click", () => {
                    document.getElementById("searchInput").value = term;
                    searchPhraseWithFilters(term);
                    historyContainer.style.display = "none";
                });
                
                listItem.querySelector(".history-delete").addEventListener("click", () => {
                    removeFromSearchHistory(term);
                    listItem.remove();
                    if (historyList.children.length === 0) {
                        historyContainer.innerHTML = "<p>No search history</p>";
                    }
                });
            });
            
            // Clear button
            const clearButton = document.createElement("button");
            clearButton.className = "button button-small";
            clearButton.textContent = "Clear History";
            clearButton.addEventListener("click", () => {
                clearSearchHistory();
                historyContainer.innerHTML = "<p>No search history</p>";
            });
            
            // Update container
            historyContainer.innerHTML = "";
            historyContainer.appendChild(historyList);
            historyContainer.appendChild(clearButton);
        }

        // Function to remove item from search history
        function removeFromSearchHistory(term) {
            const searchHistory = JSON.parse(localStorage.getItem("kunama_search_history") || "[]");
            const index = searchHistory.indexOf(term);
            
            if (index !== -1) {
                searchHistory.splice(index, 1);
                localStorage.setItem("kunama_search_history", JSON.stringify(searchHistory));
            }
        }

        // Function to clear all search history
        function clearSearchHistory() {
            localStorage.removeItem("kunama_search_history");
        }

        // Search functionality
        let debounceTimer;

        async function searchPhraseInFirebase(searchTerm) {
            if (!searchTerm) {
                document.getElementById("results").innerHTML = ""; // Clear results if no search term
                return [];
            }

            // Save search to history
            saveSearchToHistory(searchTerm);
            
            // Check cache first
            const cachedResults = window.kunamaCache ? window.kunamaCache.getFromCache(searchTerm) : null;
            if (cachedResults) {
                console.log("Using cached results for:", searchTerm);
                const resultsContainer = document.getElementById("results");
                resultsContainer.innerHTML = "";  // Clear previous results
                displayResults(cachedResults, resultsContainer);
                return cachedResults;
            }

            const approvedPhrasesRef = ref(db, 'approved_phrases');
            const searchTermLower = searchTerm.toLowerCase();

            document.getElementById("results").innerHTML = "<p>Loading...</p>"; // Show loading indicator

            try {
                // Parallel queries for approved phrases
                const [snapshotApproved] = await Promise.all([get(approvedPhrasesRef)]);

                const resultsContainer = document.getElementById("results");
                resultsContainer.innerHTML = "";  // Clear previous results

                let exactMatches = [];
                let partialMatches = [];
                
                // Function to process snapshot data
                const processSnapshot = (snapshot) => {
                    snapshot.forEach((childSnapshot) => {
                        const entry = childSnapshot.val();
                        entry.id = childSnapshot.key; // Store the database key
                        
                        const phraseLower = entry.phrase.toLowerCase();
                        const translationLower = entry.translation.toLowerCase();

                        // Check for exact match first
                        if (phraseLower === searchTermLower || translationLower === searchTermLower) {
                            exactMatches.push(entry); // Add exact match
                        }
                        // Check for partial match if no exact match
                        else if (phraseLower.includes(searchTermLower) || translationLower.includes(searchTermLower)) {
                            partialMatches.push(entry); // Add partial match
                        }
                    });
                };

                // Process both snapshots
                if (snapshotApproved.exists()) {
                    processSnapshot(snapshotApproved);
                }

                // Combine exact and partial matches
                const allResults = [...exactMatches, ...partialMatches];

                // Sort results to prioritize exact matches
                allResults.sort((a, b) => {
                    const aIsExact = a.phrase.toLowerCase() === searchTermLower || a.translation.toLowerCase() === searchTermLower;
                    const bIsExact = b.phrase.toLowerCase() === searchTermLower || b.translation.toLowerCase() === searchTermLower;
                    return bIsExact - aIsExact; // Prioritize exact matches (true > false)
                });

                // Cache these results
                if (window.kunamaCache) {
                    window.kunamaCache.addToCache(searchTerm, allResults);
                }

                // Display results with pagination
                displayResults(allResults, resultsContainer);
                
                // Check for misspellings and suggest alternatives
                if (allResults.length === 0) {
                    suggestAlternatives(searchTerm, snapshotApproved);
                }
                
                return allResults; // Return results for caching
            } catch (error) {
                console.error("Error searching phrase:", error);
                document.getElementById("results").innerHTML = "<p>❌ Error fetching data.</p>";
                return []; // Return empty array on error
            }
        }

        // Debounce function to limit the number of calls to the search function
        function debounceSearch(event) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const searchTerm = event.target.value;
                if (searchTerm) {
                    // Check if filters are active
                    const hasActiveFilters = 
                        document.getElementById("categoryFilter") && document.getElementById("categoryFilter").value !== "" ||
                        document.getElementById("sortFilter") && document.getElementById("sortFilter").value !== "relevance" ||
                        document.getElementById("searchEnglish") && !document.getElementById("searchEnglish").checked ||
                        document.getElementById("searchKunama") && !document.getElementById("searchKunama").checked;
                    
                    if (hasActiveFilters) {
                        searchPhraseWithFilters(searchTerm);
                    } else {
                        searchPhraseInFirebase(searchTerm);
                    }
                } else {
                    document.getElementById("results").innerHTML = "";
                }
            }, 300);  // Wait 300ms after the user stops typing
        }

        // "Did you mean" suggestions
        function suggestAlternatives(searchTerm, snapshot) {
            if (!snapshot.exists() || searchTerm.length < 3) return;
            
            const searchTermLower = searchTerm.toLowerCase();
            const allPhrases = [];
            
            // Collect all phrases
            snapshot.forEach(childSnapshot => {
                const entry = childSnapshot.val();
                allPhrases.push(entry.phrase.toLowerCase());
                allPhrases.push(entry.translation.toLowerCase());
            });
            
            // Find closest matches using Levenshtein distance
            const suggestions = findClosestMatches(searchTermLower, allPhrases, 3);
            
            if (suggestions.length > 0) {
                const suggestionsContainer = document.createElement("div");
                suggestionsContainer.className = "search-suggestions";
                suggestionsContainer.innerHTML = "<p>Did you mean:</p>";
                
                const suggestionList = document.createElement("ul");
                
                suggestions.forEach(suggestion => {
                    const listItem = document.createElement("li");
                    const suggestionLink = document.createElement("a");
                    suggestionLink.href = "#";
                    suggestionLink.textContent = suggestion;
                    suggestionLink.addEventListener("click", (e) => {
                        e.preventDefault();
                        document.getElementById("searchInput").value = suggestion;
                        searchPhraseInFirebase(suggestion);
                    });
                    
                    listItem.appendChild(suggestionLink);
                    suggestionList.appendChild(listItem);
                });
                
                suggestionsContainer.appendChild(suggestionList);
                document.getElementById("results").appendChild(suggestionsContainer);
            }
        }

        // Find closest matches using Levenshtein distance
        function findClosestMatches(searchTerm, phrases, maxResults = 3) {
            // Calculate Levenshtein distance between two strings
            function levenshteinDistance(a, b) {
                if (a.length === 0) return b.length;
                if (b.length === 0) return a.length;
                
                const matrix = [];
                
                // Initialize matrix
                for (let i = 0; i <= b.length; i++) {
                    matrix[i] = [i];
                }
                
                for (let j = 0; j <= a.length; j++) {
                    matrix[0][j] = j;
                }
                
                // Fill matrix
                for (let i = 1; i <= b.length; i++) {
                    for (let j = 1; j <= a.length; j++) {
                        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
                        matrix[i][j] = Math.min(
                            matrix[i - 1][j] + 1,          // deletion
                            matrix[i][j - 1] + 1,          // insertion
                            matrix[i - 1][j - 1] + cost    // substitution
                        );
                    }
                }
                
                return matrix[b.length][a.length];
            }
            
            // Calculate distances and sort
            const phraseDistances = phrases
                .filter((phrase, index, self) => self.indexOf(phrase) === index) // Remove duplicates
                .map(phrase => ({
                    phrase,
                    distance: levenshteinDistance(searchTerm, phrase)
                }))
                .sort((a, b) => a.distance - b.distance);
            
            // Return top matches that are reasonably close (distance less than half the length of search term)
            const maxDistance = Math.max(2, Math.floor(searchTerm.length / 2));
            return phraseDistances
                .filter(item => item.distance <= maxDistance)
                .slice(0, maxResults)
                .map(item => item.phrase);
        }

        // Display search results - limited to 3 results with no pagination
        function displayResults(results, container) {
            if (results.length === 0) {
                container.innerHTML = "<p>No matching phrases found.</p>";
                return;
            }
            
            // Clear container
            container.innerHTML = "";
            
            // Limit to 3 results only
            const limitedResults = results.slice(0, 3);
            
            // Display results
            limitedResults.forEach(entry => {
                const resultItem = document.createElement("div");
                resultItem.className = "result-item";
                resultItem.setAttribute("data-id", entry.id);
                
                // Format the result item
                resultItem.innerHTML = `
                    <div class="result-content">
                        <p><strong>${escapeHTML(entry.phrase)}</strong> → ${escapeHTML(entry.translation)}</p>
                        ${entry.category ? `<span class="category-tag">${escapeHTML(entry.category)}</span>` : ''}
                    </div>
                    <div class="result-actions">
                        <button class="copy-button" title="Copy to Clipboard">📋</button>
                    </div>
                `;
                
                container.appendChild(resultItem);
                
                // Add event listener for copy button
                resultItem.querySelector(".copy-button").addEventListener("click", () => {
                    copyToClipboard(`${entry.phrase} - ${entry.translation}`);
                });
                
                // Add text-to-speech button if supported
                if ('speechSynthesis' in window) {
                    const actionsContainer = resultItem.querySelector('.result-actions');
                    
                    // Add TTS button for phrase (English)
                    const ttsButtonPhrase = document.createElement('button');
                    ttsButtonPhrase.className = 'tts-button';
                    ttsButtonPhrase.title = 'Speak English';
                    ttsButtonPhrase.setAttribute('data-text', entry.phrase);
                    ttsButtonPhrase.innerHTML = '🔊 EN';
                    actionsContainer.appendChild(ttsButtonPhrase);
                    
                    // Add TTS button for translation (Kunama)
                    const ttsButtonTrans = document.createElement('button');
                    ttsButtonTrans.className = 'tts-button';
                    ttsButtonTrans.title = 'Speak Kunama';
                    ttsButtonTrans.setAttribute('data-text', entry.translation);
                    ttsButtonTrans.innerHTML = '🔊 KU';
                    actionsContainer.appendChild(ttsButtonTrans);
                    
                    // Add event listeners for TTS buttons
                    ttsButtonPhrase.addEventListener('click', () => {
                        speakText(entry.phrase);
                    });
                    
                    ttsButtonTrans.addEventListener('click', () => {
                        speakText(entry.translation);
                    });
                }
                
                // Add vote buttons
                addVoteButtons(resultItem, entry.id);
            });
            
            // Show total results count if more than 3 results exist
            if (results.length > 3) {
                const moreResultsMessage = document.createElement("p");
                moreResultsMessage.style.marginTop = "10px";
                moreResultsMessage.style.fontStyle = "italic";
                moreResultsMessage.textContent = `Showing top 3 of ${results.length} matching results`;
                container.appendChild(moreResultsMessage);
            }
        }

        // Filtered search functionality
        function searchPhraseWithFilters(searchTerm) {
            // Save search to history
            saveSearchToHistory(searchTerm);
            
            // Check cache first
            const cachedResults = window.kunamaCache ? window.kunamaCache.getFromCache(searchTerm) : null;
            if (cachedResults) {
                console.log("Using cached results for:", searchTerm);
                const resultsContainer = document.getElementById("results");
                resultsContainer.innerHTML = "";  // Clear previous results
                displayFilteredResults(cachedResults, resultsContainer);
                return;
            }
            
            // Get filter values
            const category = document.getElementById("categoryFilter").value;
            const sortBy = document.getElementById("sortFilter").value;
            const searchEnglish = document.getElementById("searchEnglish").checked;
            const searchKunama = document.getElementById("searchKunama").checked;
            
            const approvedPhrasesRef = ref(db, 'approved_phrases');
            const searchTermLower = searchTerm.toLowerCase();
            
            document.getElementById("results").innerHTML = "<p>Loading...</p>";
            
            get(approvedPhrasesRef).then((snapshot) => {
                const resultsContainer = document.getElementById("results");
                resultsContainer.innerHTML = "";
                
                if (snapshot.exists()) {
                    let results = [];
                    
                    snapshot.forEach((childSnapshot) => {
                        const entry = childSnapshot.val();
                        entry.id = childSnapshot.key; // Store the database key
                        
                        const phraseMatch = searchEnglish && entry.phrase.toLowerCase().includes(searchTermLower);
                        const translationMatch = searchKunama && entry.translation.toLowerCase().includes(searchTermLower);
                        
                        // Category filter
                        const categoryMatch = !category || entry.category === category;
                        
                        if ((phraseMatch || translationMatch) && categoryMatch) {
                            results.push({
                                ...entry,
                                exactMatch: entry.phrase.toLowerCase() === searchTermLower || 
                                           entry.translation.toLowerCase() === searchTermLower
                            });
                        }
                    });
                    
                    // Cache these results
                    if (window.kunamaCache) {
                        window.kunamaCache.addToCache(searchTerm, results);
                    }
                    
                    // Display results based on sort option
                    displayFilteredResults(results, resultsContainer, sortBy);
                    
                    // Check for misspellings if no results
                    if (results.length === 0) {
                        suggestAlternatives(searchTerm, snapshot);
                    }
                } else {
                    resultsContainer.innerHTML = "<p>No matching phrases found.</p>";
                }
            }).catch((error) => {
                console.error("Error searching phrase:", error);
                document.getElementById("results").innerHTML = "<p>❌ Error fetching data.</p>";
            });
        }

        // Display filtered results based on sort option
        function displayFilteredResults(results, container, sortBy = "relevance") {
            // Sort results based on selected sorting method
            switch (sortBy) {
                case "newest":
                    results.sort((a, b) => {
                        return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
                    });
                    break;
                case "votes":
                    // This requires an additional fetch for each entry to get votes
                    // We'll do this asynchronously
                    const resultsWithScores = [];
                    const fetchPromises = [];
                    
                    results.forEach(result => {
                        const voteRef = ref(db, `votes/${result.id}`);
                        
                        // Create a promise for each vote fetch
                        const fetchPromise = get(voteRef).then(snapshot => {
                            const voteData = snapshot.exists() ? snapshot.val() : { score: 0 };
                            resultsWithScores.push({
                                ...result,
                                score: voteData.score || 0
                            });
                        }).catch(() => {
                            // If fetch fails, add with score 0
                            resultsWithScores.push({
                                ...result,
                                score: 0
                            });
                        });
                        
                        fetchPromises.push(fetchPromise);
                    });
                    
                    // Wait for all vote fetches to complete, then sort and display
                    Promise.all(fetchPromises).then(() => {
                        resultsWithScores.sort((a, b) => b.score - a.score);
                        displayResults(resultsWithScores, container);
                    });
                    
                    return; // Exit early as we're handling display in the Promise
                case "relevance":
                default:
                    // Sort by exact match first, then by partial match
                    results.sort((a, b) => {
                        if (a.exactMatch && !b.exactMatch) return -1;
                        if (!a.exactMatch && b.exactMatch) return 1;
                        return 0;
                    });
            }
            
            // Display results
            displayResults(results, container);
        }

        // Event listeners setup
        function setupEventListeners() {
            document.getElementById("searchInput").addEventListener("input", debounceSearch);

            // Event listener for add new phrase checkbox
            document.getElementById("addNewCheckbox").addEventListener("change", function() {
                document.getElementById("addFormContainer").style.display = this.checked ? "block" : "none";
            });

            // Event listener for add phrase button
            document.getElementById("addPhraseButton").addEventListener("click", () => {
                const phrase = document.getElementById("newPhrase").value.trim();
                const translation = document.getElementById("newTranslation").value.trim();
                const category = document.getElementById("newCategory").value;
                
                if (phrase && translation) {
                    confirmSubmission(phrase, translation, category, () => {
                        addNewPhraseToFirebase(phrase, translation, category);
                    });
                } else {
                    document.getElementById("statusMessage").innerText = "❗ Please enter both phrase and translation.";
                }
            });
            
            // Close auth modal when clicking outside
            document.getElementById("authModal").addEventListener("click", (e) => {
                if (e.target === document.getElementById("authModal")) {
                    hideAuthModal();
                }
            });
            
            // Add keyboard event listener to close modals with Escape key
            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape") {
                    // Hide auth modal
                    if (document.getElementById("authModal").style.display === "flex") {
                        hideAuthModal();
                    }
                    
                    // Hide profile section
                    if (document.getElementById("userProfileSection").style.display === "block") {
                        document.getElementById("userProfileSection").style.display = "none";
                    }
                    
                    // Hide filter options
                    if (document.getElementById("filterOptions") && document.getElementById("filterOptions").style.display === "block") {
                        document.getElementById("filterOptions").style.display = "none";
                    }
                    
                    // Hide search history
                    if (document.getElementById("searchHistoryContainer") && document.getElementById("searchHistoryContainer").style.display === "block") {
                        document.getElementById("searchHistoryContainer").style.display = "none";
                    }
                }
            });
            
            // Submit auth forms on Enter key
            document.getElementById("signinPassword").addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    document.getElementById("signinBtn").click();
                }
            });
            
            document.getElementById("signupPassword").addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    document.getElementById("signupBtn").click();
                }
            });
        }

        // Initialize application
        window.onload = function() {
            try {
                // Create a placeholder anonymous user ID for app functionality
                if (!localStorage.getItem("kunama_contributor_id")) {
                    const contributorId = "anonymous_" + Math.random().toString(36).substr(2, 9);
                    localStorage.setItem("kunama_contributor_id", contributorId);
                }
                
                // Setup base functionality
                setupEventListeners();
                updateProgressBar();
                setupCharacterCounters();
                setupAutoSave();
                
                // Setup enhanced features
                setupSearchFilters();
                setupSearchHistory();
                setupDarkMode();
                setupTextToSpeech();
                setupCaching();
                
                // Fetch data
                fetchRecentTranslations();
                fetchContributorLeaderboard();
                
                // Setup authentication (now optional)
                setupAuthentication();
                
                // Load available voices for TTS (some browsers need this)
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.onvoiceschanged = function() {
                        // Voices loaded
                        const voices = window.speechSynthesis.getVoices();
                        console.log(`Loaded ${voices.length} voices for speech synthesis`);
                    };
                }
                
                console.log("Application initialization completed successfully.");
            } catch (error) {
                console.error("Error during application initialization:", error);
                showNotification("There was a problem initializing the application. Please refresh the page.", "error");
            }
        };
    </script>
