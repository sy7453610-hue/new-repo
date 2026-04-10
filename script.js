class WatchCollectionGit {
    constructor() {
        // Available watches database
        this.availableWatches = [
            { id: 1, name: "Submariner Date", brand: "Rolex", price: "$10,500", icon: "⌚", year: "2024" },
            { id: 2, name: "Speedmaster Professional", brand: "Omega", price: "$7,200", icon: "⏱️", year: "2023" },
            { id: 3, name: "Royal Oak", brand: "Audemars Piguet", price: "$28,500", icon: "⌚", year: "2024" },
            { id: 4, name: "Nautilus", brand: "Patek Philippe", price: "$35,000", icon: "⌚", year: "2023" },
            { id: 5, name: "Santos de Cartier", brand: "Cartier", price: "$8,100", icon: "⌚", year: "2024" },
            { id: 6, name: "Big Bang", brand: "Hublot", price: "$15,200", icon: "⏱️", year: "2023" }
        ];

        // Staged watches (to be committed)
        this.stagedWatches = [];

        // Commit history
        this.commits = [
            { hash: "a1b2c3d", message: "Initial watch collection", timestamp: new Date(Date.now() - 7200000) },
            { hash: "e4f5g6h", message: "Add Rolex Submariner", timestamp: new Date(Date.now() - 3600000) },
            { hash: "i7j8k9l", message: "Include Omega Speedmaster", timestamp: new Date(Date.now() - 1800000) }
        ];

        // DOM elements
        this.watchGrid = document.getElementById("watchGrid");
        this.stagedList = document.getElementById("stagedWatchesList");
        this.commitHistoryDiv = document.getElementById("commitHistory");
        this.terminalOutput = document.getElementById("terminalOutput");
        this.commitBtn = document.getElementById("commitBtn");
        this.pushBtn = document.getElementById("pushBtn");
        this.clearStagedBtn = document.getElementById("clearStagedBtn");
        this.clearTerminalBtn = document.getElementById("clearTerminalBtn");
        this.commitMessageInput = document.getElementById("commitMessageInput");
        this.totalWatchesSpan = document.getElementById("totalWatches");
        this.stagedWatchesSpan = document.getElementById("stagedWatches");
        this.commitsCountSpan = document.getElementById("commitsCount");
        this.pushStatusSpan = document.getElementById("pushStatus");

        this.init();
    }

    init() {
        this.renderAvailableWatches();
        this.renderStagedWatches();
        this.renderCommitHistory();
        this.updateStats();
        this.attachEvents();
        this.addLog("✨ Horologium Git workflow initialized", "success");
        this.addLog("📦 Available watches loaded. Click + to stage your favorites", "info");
    }

    renderAvailableWatches() {
        this.watchGrid.innerHTML = "";
        this.availableWatches.forEach(watch => {
            const isStaged = this.stagedWatches.some(w => w.id === watch.id);
            const card = document.createElement("div");
            card.className = "watch-card";
            card.innerHTML = `
        <div class="watch-icon">${watch.icon}</div>
        <div class="watch-name">${watch.name}</div>
        <div class="watch-brand">${watch.brand} • ${watch.year}</div>
        <div class="watch-price">${watch.price}</div>
        <div class="watch-actions">
          <button class="stage-btn-watch" data-id="${watch.id}" ${isStaged ? 'disabled style="opacity:0.5"' : ''}>
            <i class="fas fa-${isStaged ? 'check' : 'plus-circle'}"></i> ${isStaged ? 'Staged' : 'Stage'}
          </button>
        </div>
      `;
            this.watchGrid.appendChild(card);
        });

        // Attach stage events
        document.querySelectorAll('.stage-btn-watch').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                this.stageWatch(id);
            });
        });
    }

    stageWatch(watchId) {
        const watch = this.availableWatches.find(w => w.id === watchId);
        if (!watch) return;

        if (this.stagedWatches.some(w => w.id === watchId)) {
            this.addLog(`⚠️ ${watch.name} is already staged`, "error");
            return;
        }

        this.stagedWatches.push({ ...watch });
        this.renderStagedWatches();
        this.renderAvailableWatches();
        this.updateStats();
        this.addLog(`📌 Staged: ${watch.brand} ${watch.name} - ${watch.price}`, "success");
        this.updateCommitButtonState();
    }

    renderStagedWatches() {
        if (this.stagedWatches.length === 0) {
            this.stagedList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-box-open"></i>
          <p>No watches staged. Click the <i class="fas fa-plus-circle"></i> icon on any watch to add.</p>
        </div>
      `;
            return;
        }

        this.stagedList.innerHTML = "";
        this.stagedWatches.forEach((watch, index) => {
            const item = document.createElement("div");
            item.className = "staged-watch-item";
            item.innerHTML = `
        <div class="staged-watch-info">
          <div class="staged-watch-name">${watch.icon} ${watch.name}</div>
          <div class="staged-watch-brand">${watch.brand} • ${watch.price}</div>
        </div>
        <button class="remove-staged" data-index="${index}">
          <i class="fas fa-times"></i>
        </button>
      `;
            this.stagedList.appendChild(item);
        });

        // Attach remove events
        document.querySelectorAll('.remove-staged').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(btn.dataset.index);
                this.removeStagedWatch(index);
            });
        });
    }

    removeStagedWatch(index) {
        const removed = this.stagedWatches[index];
        this.stagedWatches.splice(index, 1);
        this.renderStagedWatches();
        this.renderAvailableWatches();
        this.updateStats();
        this.addLog(`🗑️ Removed from staging: ${removed.brand} ${removed.name}`, "info");
        this.updateCommitButtonState();
    }

    clearAllStaged() {
        if (this.stagedWatches.length === 0) {
            this.addLog("❌ No watches to clear from staging", "error");
            return;
        }
        const count = this.stagedWatches.length;
        this.stagedWatches = [];
        this.renderStagedWatches();
        this.renderAvailableWatches();
        this.updateStats();
        this.addLog(`🧹 Cleared ${count} watch(es) from staging area`, "info");
        this.updateCommitButtonState();
    }

    commitStaged() {
        if (this.stagedWatches.length === 0) {
            this.addLog("❌ Cannot commit: No watches in staging area", "error");
            return;
        }

        let message = this.commitMessageInput.value.trim();
        if (!message) {
            message = `Add ${this.stagedWatches.length} watch(es) to collection`;
        }

        const newHash = Math.random().toString(36).substring(2, 9);
        const newCommit = {
            hash: newHash,
            message: message,
            timestamp: new Date()
        };

        this.commits.unshift(newCommit);

        // Log commit details
        const watchNames = this.stagedWatches.map(w => `${w.brand} ${w.name}`).join(", ");
        this.addLog(`📝 Commit: ${newHash} - "${message}"`, "success");
        this.addLog(`   Includes: ${watchNames}`, "info");

        // Clear staged watches and input
        this.stagedWatches = [];
        this.commitMessageInput.value = "";
        this.renderStagedWatches();
        this.renderAvailableWatches();
        this.renderCommitHistory();
        this.updateStats();
        this.updateCommitButtonState();
        this.addLog(`✅ Commit successful! ${this.commits.length} total commits in history`, "success");
    }

    renderCommitHistory() {
        this.commitHistoryDiv.innerHTML = "";
        this.commits.forEach(commit => {
            const item = document.createElement("div");
            item.className = "commit-item";
            item.innerHTML = `
        <div class="commit-hash">${commit.hash}</div>
        <div class="commit-msg">${commit.message}</div>
        <div class="commit-time">${this.formatTime(commit.timestamp)}</div>
      `;
            this.commitHistoryDiv.appendChild(item);
        });
        this.commitsCountSpan.innerText = this.commits.length;
    }

    pushToRemote() {
        this.addLog(`🚀 Pushing ${this.commits.length} commits to origin/main...`, "info");

        // Simulate push delay
        setTimeout(() => {
            this.pushStatusSpan.innerHTML = "✅ Pushed to origin";
            this.pushStatusSpan.style.color = "#4ade80";
            this.addLog(`✅ Successfully pushed ${this.commits.length} commits to remote repository`, "success");
            this.addLog(`🌐 Remote: origin/main updated at ${new Date().toLocaleTimeString()}`, "info");

            // Reset status after 3 seconds
            setTimeout(() => {
                this.pushStatusSpan.innerHTML = "● Ready to push";
                this.pushStatusSpan.style.color = "#a0a0b0";
            }, 3000);
        }, 800);
    }

    updateStats() {
        this.totalWatchesSpan.innerText = this.availableWatches.length;
        this.stagedWatchesSpan.innerText = this.stagedWatches.length;
    }

    updateCommitButtonState() {
        this.commitBtn.disabled = this.stagedWatches.length === 0;
    }

    formatTime(date) {
        const diff = Date.now() - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);

        if (minutes < 1) return "just now";
        if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    }

    addLog(message, type = "info") {
        const logDiv = document.createElement("div");
        logDiv.className = `log-line ${type === "error" ? "error" : type === "success" ? "success" : ""}`;
        logDiv.innerHTML = `$ ${message}`;
        this.terminalOutput.appendChild(logDiv);
        logDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });

        // Limit terminal lines
        if (this.terminalOutput.children.length > 30) {
            this.terminalOutput.removeChild(this.terminalOutput.children[0]);
        }
    }

    clearTerminal() {
        this.terminalOutput.innerHTML = `
      <div class="log-line">$ git status</div>
      <div class="log-line">Terminal cleared</div>
      <div class="log-line success">✔ Ready for new commands</div>
    `;
        this.addLog("Terminal history cleared", "info");
    }

    attachEvents() {
        this.commitBtn.addEventListener("click", () => this.commitStaged());
        this.pushBtn.addEventListener("click", () => this.pushToRemote());
        this.clearStagedBtn.addEventListener("click", () => this.clearAllStaged());
        this.clearTerminalBtn.addEventListener("click", () => this.clearTerminal());

        // Enter key in commit input
        this.commitMessageInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && this.stagedWatches.length > 0) {
                this.commitStaged();
            }
        });
    }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
    new WatchCollectionGit();
});