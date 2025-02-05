document.addEventListener('DOMContentLoaded', function() {
    const confirmWipeButton = document.getElementById('confirmWipeButton');
    const createArchiveButton = document.getElementById('createArchiveButton');
    const validArchiveAlert = document.getElementById('validArchiveAlert');

    if (confirmWipeButton) {
        confirmWipeButton.addEventListener('click', function() {
            fetch('/dashboard/wipe-uploads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                } else {
                    alert('Error wiping uploads');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error wiping uploads');
            });
        });
    } else {
        console.error('confirmWipeButton not found');
    }

    if (createArchiveButton) {
        createArchiveButton.addEventListener('click', function() {
            const originalText = createArchiveButton.innerHTML;
            createArchiveButton.innerHTML = '<span class="loading loading-ring loading-md"></span>';
            createArchiveButton.disabled = true;

            fetch('/dashboard/archives/download-uploads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    createArchiveButton.innerHTML = originalText;
                    const link = document.createElement('a');
                    link.href = `${window.location.origin}${data.archivePath}`;
                    link.download = data.archivePath.split('/').pop();
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    loadArchives();
                } else {
                    alert('Error creating archive');
                }
                createArchiveButton.disabled = false;
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error creating archive');
                createArchiveButton.disabled = false;
            });
        });
    } else {
        console.error('createArchiveButton not found');
    }

    function loadArchives() {
        fetch('/dashboard/archives/get-archives', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text); });
            }
            return response.json();
        })
        .then(data => {
            const archivesList = document.getElementById('archivesList');
            const noArchivesMessage = document.getElementById('noArchivesMessage');
            archivesList.innerHTML = '';
            if (data.archives.length === 0) {
                noArchivesMessage.style.display = 'block';
            } else {
                noArchivesMessage.style.display = 'none';
                data.archives.forEach(archive => {
                    const listItem = document.createElement('li');
                    listItem.className = 'flex justify-between items-center p-4 border-b border-neutral-200 rounded-lg'; 

                    const createdAt = new Date(archive.createdAt);
                    const remainingDays = Math.max(0, 30 - Math.floor((new Date() - createdAt) / (1000 * 60 * 60 * 24)));
                    const archiveText = `${archive.name} - ${createdAt.toLocaleString()} - ${archive.size} MB (Expires in ${remainingDays} days)`;

                    if (!archive.valid) {
                        listItem.classList.add('text-neutral-400', 'line-through');
                        listItem.textContent = archiveText;
                    } else {
                        listItem.textContent = archiveText;

                        const downloadButton = document.createElement('button');
                        downloadButton.className = 'btn btn-sm btn-soft btn-primary text-base-content';
                        downloadButton.textContent = 'Download';
                        downloadButton.addEventListener('click', () => {
                            const link = document.createElement('a');
                            link.href = `/dashboard/archives/download-archive/${archive.name}`;
                            link.download = archive.name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            showAlert('success', 'Successfully created archive');
                        });
                        listItem.appendChild(downloadButton);
                    }

                    archivesList.appendChild(listItem);
                });
            }

            if (data.hasValidArchive) {
                validArchiveAlert.classList.remove('hidden');
                createArchiveButton.disabled = true;
                createArchiveButton.classList.add('line-through', 'text-neutral-400');
            } else {
                validArchiveAlert.classList.add('hidden');
                createArchiveButton.classList.remove('line-through', 'text-neutral-400');
                createArchiveButton.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('error', 'Error loading archives');
        });
    }

    loadArchives();
});
