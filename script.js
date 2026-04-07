document.addEventListener('DOMContentLoaded', () => {
    // Required Predefined Skills
    const predefinedSkills = [
        'Python', 'Java', 'C++', 'SQL', 'Machine Learning',
        'Data Analysis', 'Power BI', 'Excel', 'TensorFlow',
        'Pandas', 'NumPy', 'Git', 'GitHub', 'Communication',
        'Teamwork', 'Problem Solving'
    ];

    // DOM Elements
    const analyzeBtn = document.getElementById('analyze-btn');
    const resumeText = document.getElementById('resume-text');
    const scoreText = document.getElementById('score-text');
    const progressBar = document.getElementById('progress-bar');
    const foundSkillsList = document.getElementById('found-skills-list');
    const missingSkillsList = document.getElementById('missing-skills-list');

    // PDF Upload Elements
    const resumeFile = document.getElementById('resume-file');
    const uploadArea = document.getElementById('upload-area');
    const uploadLabelSpan = uploadArea.querySelector('span');

    // Handle File Selection
    resumeFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Please upload a valid PDF file.');
            return;
        }

        uploadLabelSpan.textContent = `Selected: ${file.name}`;

        // Extract text
        try {
            analyzeBtn.innerHTML = '<span>Extracting Text...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
            analyzeBtn.disabled = true;

            const text = await extractTextFromPDF(file);
            resumeText.value = text;

            analyzeBtn.innerHTML = '<span>Analyze Resume</span> <i class="fa-solid fa-wand-magic-sparkles"></i>';
            analyzeBtn.disabled = false;
        } catch (error) {
            console.error('Error extracting text:', error);
            alert('Failed to read the PDF file. Please try pasting the text instead.');
            analyzeBtn.innerHTML = '<span>Analyze Resume</span> <i class="fa-solid fa-wand-magic-sparkles"></i>';
            analyzeBtn.disabled = false;
            uploadLabelSpan.textContent = 'Click to upload PDF or drag & drop';
            resumeFile.value = '';
        }
    });

    // Handle Drag & Drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');

        if (e.dataTransfer.files.length > 0) {
            resumeFile.files = e.dataTransfer.files;
            resumeFile.dispatchEvent(new Event('change'));
        }
    });

    // PDF Extraction Function
    async function extractTextFromPDF(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async function () {
                try {
                    const typedarray = new Uint8Array(this.result);
                    const pdf = await pdfjsLib.getDocument(typedarray).promise;

                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => item.str).join(' ');
                        fullText += pageText + '\n';
                    }
                    resolve(fullText);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    // Event Listener for Analyze Button
    analyzeBtn.addEventListener('click', () => {
        const text = resumeText.value.trim();

        if (!text) {
            alert('Please paste some text into the resume area before analyzing.');
            return;
        }

        // Add loading state to button
        const originalBtnHTML = analyzeBtn.innerHTML;
        analyzeBtn.innerHTML = '<span>Analyzing...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
        analyzeBtn.disabled = true;

        // Simulate a slight delay for aesthetic UX
        setTimeout(() => {
            analyzeResume(text);

            // Restore button
            analyzeBtn.innerHTML = originalBtnHTML;
            analyzeBtn.disabled = false;
        }, 600);
    });

    function analyzeResume(text) {
        // Lowercase for case-insensitive exact matching
        const lowercasedText = text.toLowerCase();

        const foundSkills = [];
        const missingSkills = [];

        // Simple string matching logic
        predefinedSkills.forEach(skill => {
            if (lowercasedText.includes(skill.toLowerCase())) {
                foundSkills.push(skill);
            } else {
                missingSkills.push(skill);
            }
        });

        // Calculate Score
        const totalSkills = predefinedSkills.length;
        const scorePercentage = Math.round((foundSkills.length / totalSkills) * 100);

        // Update UI Dashboard
        updateDashboard(scorePercentage, foundSkills, missingSkills);
    }

    function updateDashboard(score, found, missing) {
        // 1. Animate Progress bar & update Score Text
        progressBar.style.width = `${score}%`;

        // Dynamic color for progress bar based on score
        if (score < 40) {
            progressBar.style.background = 'linear-gradient(90deg, #F43F5E, #FB923C)'; // Red to Orange
            scoreText.style.background = '-webkit-linear-gradient(right, #F43F5E, #FB923C)';
        } else if (score < 75) {
            progressBar.style.background = 'linear-gradient(90deg, #F59E0B, #FBBF24)'; // Orange/Yellow
            scoreText.style.background = '-webkit-linear-gradient(right, #F59E0B, #FBBF24)';
        } else {
            progressBar.style.background = 'linear-gradient(90deg, #10B981, #34D399)'; // Green
            scoreText.style.background = '-webkit-linear-gradient(right, #10B981, #34D399)';
        }

        // Ensure webkit text fill is preserved
        scoreText.style.webkitBackgroundClip = 'text';
        scoreText.style.backgroundClip = 'text';
        scoreText.style.webkitTextFillColor = 'transparent';

        // Animate numbers counting up
        animateValue(scoreText, parseInt(scoreText.innerText) || 0, score, 1000);

        // 2. Clear previous lists
        foundSkillsList.innerHTML = '';
        missingSkillsList.innerHTML = '';

        // 3. Render Found Skills
        if (found.length === 0) {
            foundSkillsList.innerHTML = '<li class="empty-state">No predefined skills found.</li>';
        } else {
            found.forEach((skill, index) => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fa-solid fa-check" style="margin-right: 4px;"></i>${skill}`;
                li.style.animationDelay = `${index * 0.05}s`;
                foundSkillsList.appendChild(li);
            });
        }

        // 4. Render Missing Skills
        if (missing.length === 0) {
            missingSkillsList.innerHTML = '<li class="empty-state">Perfect! All predefined skills found.</li>';
        } else {
            missing.forEach((skill, index) => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fa-solid fa-xmark" style="margin-right: 4px;"></i>${skill}`;
                li.style.animationDelay = `${index * 0.05}s`;
                missingSkillsList.appendChild(li);
            });
        }
    }

    // Quick counter animation function
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start) + '%';
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
});
