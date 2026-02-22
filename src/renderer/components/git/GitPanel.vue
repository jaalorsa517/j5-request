<template>
  <div class="git-panel">
    <div v-if="loading && !status" class="git-loading">
        <span>Loading git info...</span>
    </div>
    
    <div v-else-if="!selectedRepo" class="git-empty">
      <div v-if="!hasRepo">
        <p>This folder is not a Git repository.</p>
        <button @click="handleInit" class="git-btn-init">Initialize Git</button>
      </div>
      <div v-else>
        <p>No git repository found in workspace.</p>
        <button @click="checkRepos" class="git-btn-retry">Scan again</button>
      </div>
    </div>

    <div v-else class="git-content">
      <GitRepositoryItem
        :repoPath="selectedRepo"
        :currentBranch="currentBranch"
        :branches="branches"
        @checkout="handleCheckout"
        @refresh="updateStatus"
      />

      <GitChangesList
        :status="status"
        @stage="handleStage"
        @unstage="handleUnstage"
        @openDiff="handleOpenDiff"
      />
      
      <GitCommitBox
        @commit="handleCommit"
        @sync="handleSync"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useGitStore } from '@/renderer/stores/git';
import { useFileSystemStore } from '@/renderer/stores/file-system';
import GitRepositoryItem from '@/renderer/components/git/GitRepositoryItem.vue';
import GitChangesList from '@/renderer/components/git/GitChangesList.vue';
import GitCommitBox from '@/renderer/components/git/GitCommitBox.vue';

const gitStore = useGitStore();
const fsStore = useFileSystemStore();

const { selectedRepo, currentBranch, branches, status, loading, hasRepo } = storeToRefs(gitStore);
const { currentPath } = storeToRefs(fsStore);

// Emit openDiff so parent (MainLayout) can handle showing the diff view
const emit = defineEmits<{
    (e: 'openDiff', file: string, repoPath: string): void;
}>();

async function checkRepos() {
    if (currentPath.value) {
        await gitStore.loadRepositories(currentPath.value);
    }
}

async function handleInit() {
    if (currentPath.value) {
        try {
            await gitStore.initRepository(currentPath.value);
        } catch (error: any) {
            alert(`Error initializing Git: ${error.message}`);
        }
    }
}

async function updateStatus() {
    await gitStore.updateStatus();
}

async function handleCheckout(branch: string) {
    await gitStore.checkout(branch);
}

async function handleStage(files: string[]) {
    await gitStore.stage(files);
}

async function handleUnstage(files: string[]) {
    await gitStore.unstage(files);
}

async function handleCommit(message: string) {
    await gitStore.commit(message);
}

async function handleSync() {
    await gitStore.sync();
}

function handleOpenDiff(file: string) {
    if (selectedRepo.value) {
        emit('openDiff', file, selectedRepo.value);
    }
}

watch(currentPath, async (newPath) => {
    if (newPath) {
        await gitStore.loadRepositories(newPath);
    }
});

onMounted(async () => {
    if (currentPath.value) {
        await gitStore.loadRepositories(currentPath.value);
    }
});
</script>

<style scoped>
.git-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  overflow: hidden;
}

.git-loading, .git-empty {
    padding: 20px;
    text-align: center;
    font-size: 0.9em;
    color: var(--text-secondary);
}

.git-content {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.git-btn-retry, .git-btn-init {
    margin-top: 10px;
    padding: 8px 16px;
    background-color: var(--accent-color);
    color: var(--text-inverse);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
}

.git-btn-retry:hover, .git-btn-init:hover {
    background-color: var(--accent-hover);
    filter: none;
}
</style>
