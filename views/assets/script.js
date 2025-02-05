$(document).ready(function() {
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme') || (userPrefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);

    
    $('#themeSelector').val(savedTheme);

    
    $('#themeSelector').change(function() {
        const selectedTheme = $(this).val();
        document.documentElement.setAttribute('data-theme', selectedTheme);
    });

    
    $('#saveTheme').click(function() {
        const selectedTheme = $('#themeSelector').val();
        localStorage.setItem('theme', selectedTheme);
        document.documentElement.setAttribute('data-theme', selectedTheme);

        
        const alertElement = $('#themeAlert');
        alertElement.removeClass('hidden');
        setTimeout(() => {
            alertElement.addClass('hidden');
        }, 3000); 
    });

    $('.theme-controller').prop('checked', savedTheme === 'dark');
    $('.theme-controller').change(function() {
        const selectedTheme = $(this).is(':checked') ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', selectedTheme);
        localStorage.setItem('theme', selectedTheme); 
    });

    $("#toggleKeyVisibility").click(function() {
        const keyElement = $("#uploadKey");
        const iconElement = $(this);
        if (keyElement.hasClass("blurred")) {
            keyElement.removeClass("blurred");
            iconElement.removeClass("bi-eye-fill").addClass("bi-eye-slash-fill");
        } else {
            keyElement.addClass("blurred");
            iconElement.removeClass("bi-eye-slash-fill").addClass("bi-eye-fill");
        }
    });
});

function showUserDetails(userId) {
    fetch(`/admin/user/${userId}`)
        .then(response => response.json())
        .then(user => {
            document.getElementById('userId').value = user.id;
            document.getElementById('username').value = user.username || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('permissionLevel').value = user.permission_level || '';
            document.getElementById('storageCapacity').value = user.storage_capacity_id || '';
            document.getElementById('vanityURL').value = user.vanityURL || '';
            document.getElementById('private').checked = user.private;

            
            const userBadges = Array.isArray(user.badges) ? user.badges : [];

            
            const badgeCheckboxes = document.querySelectorAll('.badge-checkbox');
            badgeCheckboxes.forEach(checkbox => {
                checkbox.checked = userBadges.includes(parseInt(checkbox.value));
            });

            document.getElementById('userDetailsModal').classList.add('modal-open');
        })
        .catch(error => console.error('Error fetching user details:', error));
}

function saveUserDetails() {
    const form = document.getElementById('userDetailsForm');
    const formData = new FormData(form);

    
    const badges = [];
    document.querySelectorAll('.badge-checkbox:checked').forEach(checkbox => {
        badges.push(checkbox.value);
    });
    formData.append('badges', JSON.stringify(badges));

    
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    fetch(`/admin/user/${data.userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                closeModal();
                location.reload();
            } else {
                alert('Error saving user details');
            }
        })
        .catch(error => console.error('Error saving user details:', error));
}

function closeModal() {
    document.getElementById('userDetailsModal').classList.remove('modal-open');
}


let userIdToDelete = null;

function showDeleteUserModal(userId) {
    userIdToDelete = userId;
    document.getElementById('deleteUserModal').classList.add('modal-open');
}

function confirmDeleteUser() {
    fetch(`/admin/user/${userIdToDelete}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                closeDeleteModal();
                location.reload();
            } else {
                alert('Error deleting user');
            }
        })
        .catch(error => console.error('Error deleting user:', error));
}

function closeDeleteModal() {
    document.getElementById('deleteUserModal').classList.remove('modal-open');
}

let domainIdToDelete = null;

function showDomainDetails(domainId) {
    fetch(`/admin/domain/${domainId}`)
        .then(response => response.json())
        .then(domain => {
            document.getElementById('domainId').value = domain.id;
            document.getElementById('domainName').value = domain.domain_name || '';
            document.getElementById('domainDetailsModal').classList.add('modal-open');
        })
        .catch(error => console.error('Error fetching domain details:', error));
}

function saveDomainDetails() {
    const form = document.getElementById('domainDetailsForm');
    const formData = new FormData(form);

    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    fetch(`/admin/domain/${data.domainId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                closeDomainModal();
                location.reload();
            } else {
                alert('Error saving domain details');
            }
        })
        .catch(error => console.error('Error saving domain details:', error));
}

function closeDomainModal() {
    document.getElementById('domainDetailsModal').classList.remove('modal-open');
}

function showAddDomainModal() {
    document.getElementById('addDomainModal').classList.add('modal-open');
}

function addDomain() {
    const form = document.getElementById('addDomainForm');
    const formData = new FormData(form);

    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    fetch(`/admin/domain`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                closeAddDomainModal();
                location.reload();
            } else {
                alert('Error adding domain');
            }
        })
        .catch(error => console.error('Error adding domain:', error));
}

function closeAddDomainModal() {
    document.getElementById('addDomainModal').classList.remove('modal-open');
}

function showDeleteDomainModal(domainId) {
    domainIdToDelete = domainId;
    document.getElementById('deleteDomainModal').classList.add('modal-open');
}

function confirmDeleteDomain() {
    fetch(`/admin/domain/${domainIdToDelete}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                closeDeleteDomainModal();
                location.reload();
            } else {
                alert('Error deleting domain');
            }
        })
        .catch(error => console.error('Error deleting domain:', error));
}

function closeDeleteDomainModal() {
    document.getElementById('deleteDomainModal').classList.remove('modal-open');
}