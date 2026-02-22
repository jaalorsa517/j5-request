import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { GitStatus } from '@/shared/types';

export const useGitStore = defineStore('git', () => {
    const repositories = ref<string[]>([]);
    const selectedRepo = ref<string>('');
    const status = ref<GitStatus | null>(null);
    const branches = ref<string[]>([]);
    const loading = ref(false);
    const hasRepo = ref(true);

    const currentBranch = computed(() => status.value?.current || '');

    async function loadRepositories(workspacePath: string) {
        loading.value = true;
        // Reset state for new workspace
        selectedRepo.value = '';
        repositories.value = [];
        status.value = null;
        branches.value = [];
        hasRepo.value = false;

        try {
            hasRepo.value = await window.electron.git.isRepository(workspacePath);
            repositories.value = await window.electron.git.findRepos(workspacePath);
            if (repositories.value.length > 0 && !selectedRepo.value) {
                selectedRepo.value = repositories.value[0];
                await updateStatus();
            }
        } finally {
            loading.value = false;
        }
    }

    async function initRepository(path: string) {
        loading.value = true;
        try {
            await window.electron.git.initRepository(path);
            await loadRepositories(path);
        } finally {
            loading.value = false;
        }
    }

    async function updateStatus() {
        if (!selectedRepo.value) return;
        loading.value = true;
        try {
            status.value = await window.electron.git.getStatus(selectedRepo.value);
            branches.value = await window.electron.git.getBranches(selectedRepo.value);
        } finally {
            loading.value = false;
        }
    }

    async function selectRepo(path: string) {
        selectedRepo.value = path;
        await updateStatus();
    }

    async function checkout(branch: string) {
        if (!selectedRepo.value) return;
        loading.value = true;
        try {
            await window.electron.git.checkout(selectedRepo.value, branch);
            await updateStatus();
        } finally {
            loading.value = false;
        }
    }

    async function stage(files: string[]) {
        if (!selectedRepo.value) return;
        try {
            await window.electron.git.stage(selectedRepo.value, files);
            await updateStatus();
        } catch (error) {
            console.error(error);
        }
    }

    async function unstage(files: string[]) {
        if (!selectedRepo.value) return;
        try {
            await window.electron.git.unstage(selectedRepo.value, files);
            await updateStatus();
        } catch (error) {
            console.error(error);
        }
    }

    async function commit(message: string) {
        if (!selectedRepo.value) return;
        loading.value = true;
        try {
            await window.electron.git.commit(selectedRepo.value, message);
            await updateStatus();
        } finally {
            loading.value = false;
        }
    }

    async function push() {
        if (!selectedRepo.value) return;
        loading.value = true;
        try {
            await window.electron.git.push(selectedRepo.value);
            await updateStatus();
        } finally {
            loading.value = false;
        }
    }

    async function pull() {
        if (!selectedRepo.value) return;
        loading.value = true;
        try {
            await window.electron.git.pull(selectedRepo.value);
            await updateStatus();
        } finally {
            loading.value = false;
        }
    }

    async function sync() {
        await pull();
        await push();
    }

    return {
        repositories,
        selectedRepo,
        status,
        branches,
        currentBranch,
        loading,
        hasRepo,

        loadRepositories,
        initRepository,
        selectRepo,
        updateStatus,
        checkout,
        stage,
        unstage,
        commit,
        push,
        pull,
        sync
    };
});
