document.addEventListener('DOMContentLoaded', function() {
    // --- CONFIGURATION ---
    // URL ab bohat simple ho gaya hai
    const API_ENDPOINT_URL = '/remove-background';

    // --- ELEMENTS ---
    const uploadBox = document.getElementById('uploadBox');
    const fileInput = document.getElementById('fileInput');
    const removeBtn = document.getElementById('removeBtn');
    const statusText = document.getElementById('statusText');
    const originalPreview = document.getElementById('originalPreview');
    const originalPlaceholder = document.getElementById('originalPlaceholder');
    const processedPreview = document.getElementById('processedPreview');
    const processedPlaceholder = document.getElementById('processedPlaceholder');
    const downloadBtn = document.getElementById('downloadBtn');
    const trialCountSpan = document.getElementById('trialCount');
    
    let selectedFile = null;
    let processedImageBlob = null;
    
    let trialsLeft = localStorage.getItem('zeroBgTrials') === null ? 3 : parseInt(localStorage.getItem('zeroBgTrials'));
    updateTrialCountUI();

    // --- EVENT LISTENERS ---
    uploadBox.addEventListener('click', () => {
        if (trialsLeft > 0 || isSubscribed()) {
            fileInput.click();
        } else {
            alert('Your free trials are over. Please subscribe!');
        }
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            selectedFile = file;
            const reader = new FileReader();
            reader.onload = function(e) {
                originalPlaceholder.style.display = 'none';
                originalPreview.src = e.target.result;
                originalPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
            
            statusText.textContent = `File ready: ${file.name}`;
            removeBtn.disabled = false;
            processedPlaceholder.style.display = 'flex';
            processedPreview.style.display = 'none';
            downloadBtn.style.display = 'none';
        } else {
            statusText.textContent = 'Please select a valid image file (JPG, PNG).';
            selectedFile = null;
        }
    });
    
    removeBtn.addEventListener('click', handleRemoveBackground);

    downloadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!processedImageBlob) {
            alert('No processed image to download.');
            return;
        }
        
        const url = URL.createObjectURL(processedImageBlob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'ZeroBG_Master_Result.png';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });

    // --- FUNCTIONS ---
    async function handleRemoveBackground() {
        if (!selectedFile) {
            alert('Please upload an image first.');
            return;
        }
        if (trialsLeft <= 0 && !isSubscribed()) {
            alert('Your free trials are over. Please subscribe!');
            return;
        }

        statusText.textContent = 'Uploading and processing... Please wait.';
        removeBtn.disabled = true;
        processedPlaceholder.style.display = 'flex';
        processedPreview.style.display = 'none';
        downloadBtn.style.display = 'none';

        const formData = new FormData();
        formData.append('image_file', selectedFile);

        try {
            const response = await fetch(API_ENDPOINT_URL, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            processedImageBlob = await response.blob();
            const imageObjectURL = URL.createObjectURL(processedImageBlob);
            
            processedPlaceholder.style.display = 'none';
            processedPreview.src = imageObjectURL;
            processedPreview.style.display = 'block';
            downloadBtn.style.display = 'flex';
            
            statusText.textContent = 'Background removed successfully!';

            if (!isSubscribed()) {
                trialsLeft--;
                localStorage.setItem('zeroBgTrials', trialsLeft);
                updateTrialCountUI();
                 if (trialsLeft <= 0) {
                    alert('You have used all your free trials. Please subscribe for more.');
                    statusText.textContent = 'Trial finished. Please subscribe.';
                    uploadBox.style.cursor = 'not-allowed';
                }
            }
        } catch (error) {
            console.error('API Error:', error);
            statusText.textContent = error.message;
        } finally {
            if (trialsLeft > 0 || isSubscribed()) {
               removeBtn.disabled = false;
            }
        }
    }

    function updateTrialCountUI() {
        if (isSubscribed()) {
            trialCountSpan.parentElement.innerHTML = '<i class="fa-solid fa-crown"></i> <strong>Pro User</strong>';
        } else {
            trialCountSpan.textContent = trialsLeft;
             if (trialsLeft <= 0) {
                trialCountSpan.textContent = 0;
            }
        }
    }
    
    function isSubscribed() {
        return false;
    }
});