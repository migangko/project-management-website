
        // State management
        let projects = [];
        let currentView = 'grid';
        let deleteProjectId = null;
        const userId = localStorage.getItem('userId') || 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
        const appSlug = 'codecraft-academy';

        // Utility functions
        const showLoading = () => document.getElementById('loading').classList.remove('hidden');
        const hideLoading = () => document.getElementById('loading').classList.add('hidden');

        const showToast = (message, type = 'success') => {
            const toast = document.getElementById('toast');
            document.getElementById('toast-message').textContent = message;
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), 3000);
        };

        // Database operations
        async function dbOperation(action, table, data = null, id = null) {
            showLoading();
            try {
                const response = await fetch('https://r0c8kgwocscg8gsokogwwsw4.zetaverse.one/db', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer OBu8mNUDybQGnxSxQdqnsGY9IbR2',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId,
                        appSlug,
                        action,
                        table,
                        id,
                        data
                    })
                });
                const result = await response.json();
                hideLoading();
                return result;
            } catch (error) {
                hideLoading();
                console.error('Error:', error);
                return { error: 'Operation failed' };
            }
        }

        // UI Functions
        function toggleView(view) {
            currentView = view;
            document.getElementById('grid-view').style.display = view === 'grid' ? 'grid' : 'none';
            document.getElementById('list-view').style.display = view === 'list' ? 'block' : 'none';
            document.getElementById('admin-view').style.display = view === 'admin' ? 'block' : 'none';
            if (view !== 'admin') {
                document.getElementById('project-form').reset();
                document.querySelector('input[name="projectId"]').value = '';
            }
        }

        function createProjectCard(project) {
            const card = document.createElement('div');
            card.className = 'bg-white p-4 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all';
            
            const content = `
                <img src="${project.data.thumbnail || 'https://source.unsplash.com/random/400x300'}" 
                     alt="${project.data.title}" 
                     class="w-full h-48 object-cover mb-4 border-2 border-black">
                <h3 class="text-xl font-bold mb-2">${project.data.title}</h3>
                <p class="mb-4 text-gray-600">${project.data.description}</p>
                <div class="flex flex-wrap gap-2 mb-4">
                    ${project.data.tags.split(',').map(tag => 
                        `<span class="bg-[#FFD700] px-2 py-1 text-sm border border-black">${tag.trim()}</span>`
                    ).join('')}
                </div>
                <div class="flex justify-between items-center">
                    <span class="bg-green-200 px-2 py-1 border border-black">${project.data.difficulty}</span>
                    <div class="flex gap-2">
                        <button onclick="viewSource('${project.id}')" 
                                class="bg-[#FFD700] px-2 py-1 border border-black hover:bg-[#FFE44D] transition-colors">
                            <i class="bi bi-code-slash"></i> Source
                        </button>
                        <button onclick="viewDemo('${project.id}')" 
                                class="bg-[#FFD700] px-2 py-1 border border-black hover:bg-[#FFE44D] transition-colors">
                            <i class="bi bi-play-fill"></i> Demo
                        </button>
                        <button onclick="editProject('${project.id}')" 
                                class="bg-blue-500 text-white px-2 py-1 border border-black hover:bg-blue-600 transition-colors">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button onclick="showDeleteConfirmation('${project.id}')" 
                                class="bg-red-500 text-white px-2 py-1 border border-black hover:bg-red-600 transition-colors">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            card.innerHTML = content;
            return card;
        }

        function createProjectListItem(project) {
            const item = document.createElement('div');
            item.className = 'bg-white p-4 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all';
            
            const content = `
                <div class="flex flex-col md:flex-row gap-4">
                    <img src="${project.data.thumbnail || 'https://source.unsplash.com/random/400x300'}" 
                         alt="${project.data.title}" 
                         class="w-full md:w-48 h-48 object-cover border-2 border-black">
                    <div class="flex-1">
                        <h3 class="text-xl font-bold mb-2">${project.data.title}</h3>
                        <p class="mb-4 text-gray-600">${project.data.description}</p>
                        <div class="flex flex-wrap gap-2 mb-4">
                            ${project.data.tags.split(',').map(tag => 
                                `<span class="bg-[#FFD700] px-2 py-1 text-sm border border-black">${tag.trim()}</span>`
                            ).join('')}
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="bg-green-200 px-2 py-1 border border-black">${project.data.difficulty}</span>
                            <div class="flex gap-2">
                                <button onclick="viewSource('${project.id}')" 
                                        class="bg-[#FFD700] px-2 py-1 border border-black hover:bg-[#FFE44D] transition-colors">
                                    <i class="bi bi-code-slash"></i> Source
                                </button>
                                <button onclick="viewDemo('${project.id}')" 
                                        class="bg-[#FFD700] px-2 py-1 border border-black hover:bg-[#FFE44D] transition-colors">
                                    <i class="bi bi-play-fill"></i> Demo
                                </button>
                                <button onclick="editProject('${project.id}')" 
                                        class="bg-blue-500 text-white px-2 py-1 border border-black hover:bg-blue-600 transition-colors">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button onclick="showDeleteConfirmation('${project.id}')" 
                                        class="bg-red-500 text-white px-2 py-1 border border-black hover:bg-red-600 transition-colors">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            item.innerHTML = content;
            return item;
        }

        function viewSource(projectId) {
            const project = projects.find(p => p.id === projectId);
            document.getElementById('modal-title').textContent = `Source: ${project.data.title}`;
            document.getElementById('modal-content').innerHTML = `
                <pre><code class="language-javascript">${project.data.sourceCode}</code></pre>
            `;
            document.getElementById('modal').classList.remove('hidden');
            Prism.highlightAll();
        }

        function viewDemo(projectId) {
            const project = projects.find(p => p.id === projectId);
            document.getElementById('modal-title').textContent = `Demo: ${project.data.title}`;
            document.getElementById('modal-content').innerHTML = `
                <iframe src="${project.data.demoUrl}" class="w-full h-96 border-2 border-black"></iframe>
            `;
            document.getElementById('modal').classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('modal').classList.add('hidden');
        }

        function editProject(projectId) {
            const project = projects.find(p => p.id === projectId);
            const form = document.getElementById('project-form');
            form.elements.projectId.value = projectId;
            form.elements.title.value = project.data.title;
            form.elements.description.value = project.data.description;
            form.elements.sourceCode.value = project.data.sourceCode;
            form.elements.demoUrl.value = project.data.demoUrl;
            form.elements.tags.value = project.data.tags;
            form.elements.difficulty.value = project.data.difficulty;
            toggleView('admin');
        }

        function showDeleteConfirmation(projectId) {
            deleteProjectId = projectId;
            document.getElementById('delete-modal').classList.remove('hidden');
        }

        // Event Listeners
        document.getElementById('project-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const projectId = formData.get('projectId');
            const projectData = {
                title: formData.get('title'),
                description: formData.get('description'),
                sourceCode: formData.get('sourceCode'),
                demoUrl: formData.get('demoUrl'),
                thumbnail: formData.get('thumbnail')?.name || 'default.jpg',
                tags: formData.get('tags'),
                difficulty: formData.get('difficulty')
            };
            
            const action = projectId ? 'update' : 'create';
            const result = await dbOperation(action, 'projects', projectData, projectId);
            
            if (!result.error) {
                showToast(`Project ${action}d successfully!`);
                loadProjects();
                e.target.reset();
                toggleView('grid');
            }
        });

        document.getElementById('confirm-delete').addEventListener('click', async () => {
            if (deleteProjectId) {
                const result = await dbOperation('delete', 'projects', null, deleteProjectId);
                if (!result.error) {
                    showToast('Project deleted successfully!');
                    loadProjects();
                }
                document.getElementById('delete-modal').classList.add('hidden');
                deleteProjectId = null;
            }
        });

        document.getElementById('cancel-delete').addEventListener('click', () => {
            document.getElementById('delete-modal').classList.add('hidden');
            deleteProjectId = null;
        });

        document.getElementById('search').addEventListener('input', filterProjects);
        document.getElementById('difficulty').addEventListener('change', filterProjects);
        document.getElementById('technology').addEventListener('change', filterProjects);

        // Filter projects
        function filterProjects() {
            const searchTerm = document.getElementById('search').value.toLowerCase();
            const difficulty = document.getElementById('difficulty').value;
            const technology = document.getElementById('technology').value;

            const filtered = projects.filter(project => {
                const matchesSearch = project.data.title.toLowerCase().includes(searchTerm) ||
                                    project.data.description.toLowerCase().includes(searchTerm);
                const matchesDifficulty = !difficulty || project.data.difficulty === difficulty;
                const matchesTechnology = !technology || project.data.tags.toLowerCase().includes(technology);
                return matchesSearch && matchesDifficulty && matchesTechnology;
            });

            displayProjects(filtered);
        }

        // Display projects
        function displayProjects(projectsToShow) {
            const gridContainer = document.getElementById('grid-view');
            const listContainer = document.getElementById('list-view');
            
            gridContainer.innerHTML = '';
            listContainer.innerHTML = '';
            
            projectsToShow.forEach(project => {
                gridContainer.appendChild(createProjectCard(project));
                listContainer.appendChild(createProjectListItem(project));
            });
        }

        // Initial load
        async function loadProjects() {
            const result = await dbOperation('read', 'projects');
            if (!result.error) {
                projects = result.data;
                displayProjects(projects);
            }
        }

        // Initialize
        loadProjects();