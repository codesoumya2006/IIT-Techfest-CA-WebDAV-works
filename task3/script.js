document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const submitBtn = document.getElementById('submitBtn');
    const formStatus = document.getElementById('formStatus');
    const projectTopicInput = document.getElementById('project-topic');
    const aiAssistantBtn = document.getElementById('ai-assistant-btn');

    // --- New AI Idea Generator Elements ---
    const ideaTopicInput = document.getElementById('idea-topic');
    const ideaButtons = document.querySelectorAll('.idea-btn');
    const ideaResultsContainer = document.getElementById('idea-results-container');


    const inputs = [nameInput, emailInput, messageInput];

    // --- Validation Functions ---
    const setError = (input, message) => {
        const errorMessageElement = document.getElementById(`${input.id}-error`);
        input.setAttribute('aria-invalid', 'true');
        errorMessageElement.textContent = message;
    };

    const clearError = (input) => {
        const errorMessageElement = document.getElementById(`${input.id}-error`);
        input.setAttribute('aria-invalid', 'false');
        errorMessageElement.textContent = ''; // Clear message
    };

    const validateField = (input) => {
        let isValid = true;
        const value = input.value.trim();

        switch (input.id) {
            case 'name':
                if (value === '') {
                    setError(input, 'Please enter your full name.');
                    isValid = false;
                } else {
                    clearError(input);
                }
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value === '') {
                     setError(input, 'Email address is required.');
                     isValid = false;
                } else if (!emailRegex.test(value)) {
                    setError(input, 'Please enter a valid email address.');
                    isValid = false;
                } else {
                    clearError(input);
                }
                break;
            case 'message':
                if (value === '') {
                    setError(input, 'Please enter your message.');
                    isValid = false;
                } else {
                    clearError(input);
                }
                break;
        }
        return isValid;
    };
    
    // --- Live Validation ---
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
           if (input.getAttribute('aria-invalid') === 'true') {
               validateField(input);
           }
        });
    });

    projectTopicInput.addEventListener('input', () => {
        // Clear the AI-specific error when the user starts typing
        if (projectTopicInput.getAttribute('aria-invalid') === 'true') {
            clearError(projectTopicInput);
        }
    });

    // --- New AI Idea Generator Logic ---
    const getAIdea = async (button) => {
        const ideaType = button.dataset.ideaType;
        const topic = ideaTopicInput.value.trim();

        // Validation
        if (topic === '') {
            setError(ideaTopicInput, 'Please enter your project idea first.');
            ideaTopicInput.focus();
            return;
        }
        clearError(ideaTopicInput);

        const loader = button.querySelector('.loader');
        ideaButtons.forEach(btn => btn.disabled = true);
        loader.style.display = 'inline-block';
        ideaResultsContainer.style.display = 'block';
        ideaResultsContainer.innerHTML = `<div class="idea-loader-container"><span class="loader"></span></div>`;

        const prompts = {
            design: {
                system: `You are a creative web design consultant. Provide 3 innovative and distinct design ideas. Focus on visual themes, color palettes, and typography. Format your response as a simple, unnumbered list with each item starting with '- '.`,
                user: `Generate web design ideas for a project about: "${topic}".`
            },
            development: {
                system: `You are a practical web developer. Suggest 3 key features that would be essential or innovative for a website. Explain briefly why each feature is valuable. Format your response as a simple, unnumbered list with each item starting with '- '.`,
                user: `Suggest key web development features for a project about: "${topic}".`
            },
            accessibility: {
                system: `You are a web accessibility expert. Provide 3 crucial accessibility tips that would be particularly relevant for this type of website. Format your response as a simple, unnumbered list with each item starting with '- '.`,
                user: `Provide crucial accessibility tips for a project about: "${topic}".`
            }
        };

        const selectedPrompt = prompts[ideaType];
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: selectedPrompt.user }] }],
            systemInstruction: { parts: [{ text: selectedPrompt.system }] },
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);

            const result = await response.json();
            const candidate = result.candidates?.[0];

            if (candidate && candidate.content?.parts?.[0]?.text) {
                const generatedText = candidate.content.parts[0].text;
                const items = generatedText.split('- ').filter(item => item.trim() !== '');
                const listHtml = items.map(item => `<li>${item.trim()}</li>`).join('');
                const title = button.textContent.trim();
                ideaResultsContainer.innerHTML = `<h3>${title} for "${topic}"</h3><ul>${listHtml}</ul>`;
            } else {
                throw new Error('Unexpected response format from API.');
            }
        } catch (error) {
            console.error("Gemini API Error:", error);
            ideaResultsContainer.innerHTML = `<p style="color: var(--error-text);">Sorry, we couldn't generate ideas at this time. Please try again later.</p>`;
        } finally {
            loader.style.display = 'none';
            ideaButtons.forEach(btn => btn.disabled = false);
        }
    };
    
    ideaButtons.forEach(button => {
        button.addEventListener('click', () => getAIdea(button));
    });

    ideaTopicInput.addEventListener('input', () => {
        if(ideaTopicInput.getAttribute('aria-invalid') === 'true') {
            clearError(ideaTopicInput);
        }
    });


    // --- AI Assistant Handler ---
    aiAssistantBtn.addEventListener('click', async () => {
        // Clear previous AI-specific errors
        clearError(nameInput);
        clearError(projectTopicInput);
        formStatus.style.display = 'none';
        formStatus.className = 'form-status';

        const name = nameInput.value.trim();
        const topic = projectTopicInput.value.trim();

        let hasError = false;
        if (name === '') {
            setError(nameInput, 'Please enter your name to use the AI assistant.');
            hasError = true;
        }
        if (topic === '') {
            setError(projectTopicInput, 'Please describe your project to use the AI assistant.');
            hasError = true;
        }

        if (hasError) {
            if(name === '') nameInput.focus();
            else projectTopicInput.focus();
            return;
        }

        const loader = aiAssistantBtn.querySelector('.loader');
        loader.style.display = 'inline-block';
        aiAssistantBtn.disabled = true;

        const systemPrompt = `You are a friendly and professional potential client writing an inquiry to a web design agency named 'Innovate Solutions'. Your tone should be enthusiastic but concise. Write a short message, about 3-4 sentences. Do not use placeholders like "[Your Name]".`;
        const userQuery = `My name is ${name}. I'm interested in getting a website for my project: "${topic}". Please write the inquiry message for me.`;
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }

            const result = await response.json();
            const candidate = result.candidates?.[0];

            if (candidate && candidate.content?.parts?.[0]?.text) {
                const generatedText = candidate.content.parts[0].text;
                messageInput.value = generatedText;
                validateField(messageInput); // Validate the new content
            } else {
                throw new Error('Unexpected response format from API.');
            }

        } catch (error) {
            console.error("Gemini API Error:", error);
            formStatus.textContent = 'The AI assistant could not generate a message. Please write your own.';
            formStatus.className = 'form-status error';
            formStatus.style.display = 'block';
        } finally {
            loader.style.display = 'none';
            aiAssistantBtn.disabled = false;
        }
    });


    // --- Form Submission Handler ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        let isFormValid = true;
        inputs.forEach(input => {
            if (!validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            const firstInvalid = inputs.find(input => input.getAttribute('aria-invalid') === 'true');
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        formStatus.style.display = 'none';
        formStatus.className = 'form-status';

        const mockEndpoint = 'https://jsonplaceholder.typicode.com/posts';
        const formData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            message: messageInput.value.trim()
        };

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const response = await fetch(mockEndpoint, {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: { 'Content-type': 'application/json; charset=UTF-8' },
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            formStatus.textContent = 'Thank you! Your message has been sent successfully.';
            formStatus.classList.add('success');
            form.reset();
            inputs.forEach(clearError);

        } catch (error) {
            console.error('Submission error:', error);
            formStatus.textContent = 'Sorry, something went wrong. Please try again later.';
            formStatus.classList.add('error');
        } finally {
            formStatus.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }
    });

    // --- Intersection Observer for Fade-in Animation ---
    const animatedElements = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    animatedElements.forEach(el => observer.observe(el));
});
