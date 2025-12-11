// Do not modify this file unless you know what you are doing!
// If you find yourself needing to modify this file, please consider
// submitting a pull request to improve the code for everyone.

window.onload = async function() {
    // Load JSON data first
    let parsedData;
    try {
        const response = await fetch('./data.json');
        parsedData = await response.json();
        console.log('Loaded credits data, length:', Object.keys(parsedData).length);
    } catch (error) {
        console.error('Failed to load credits data:', error);
        return;
    }

    // Ensure slideshow config has defaults
    if (!config.slideshow) {
        config.slideshow = {};
    }
    if (config.slideshow.maxRows === undefined) {
        config.slideshow.maxRows = 3;
    }
    if (config.slideshow.maxColumns === undefined) {
        config.slideshow.maxColumns = 4;
    }
    if (config.slideshow.slideDuration === undefined) {
        config.slideshow.slideDuration = 5000;
    }
    if (config.slideshow.fadeOutDuration === undefined) {
        config.slideshow.fadeOutDuration = 500;
    }
    if (config.slideshow.fadeInDuration === undefined) {
        config.slideshow.fadeInDuration = 500;
    }
    if (config.slideshow.initialFadeInDuration === undefined) {
        config.slideshow.initialFadeInDuration = 0;
    }
    if (config.slideshow.finalFadeOutDuration === undefined) {
        config.slideshow.finalFadeOutDuration = 2000;
    }
    if (config.slideshow.categoryHeaderEnabled === undefined) {
        config.slideshow.categoryHeaderEnabled = true;
    }
    if (config.slideshow.fadeBetweenSameCategorySlides === undefined) {
        config.slideshow.fadeBetweenSameCategorySlides = true;
    }

    // Route to appropriate display mode
    if (config.displayMode === 'slideshow') {
        await runSlideshowMode(parsedData);
    } else {
        await runScrollMode(parsedData);
    }
};

async function runScrollMode(parsedData) {
    const creditsContainer = document.getElementById('credits-container');
    creditsContainer.innerHTML = '';
    const creditsContainerParentHeight = creditsContainer.parentElement.offsetHeight;

    let totalDuration = 2000;

    let hasPreviousSection = false;
    for (const section of sectionsConfig) {
        if (!section.hasOwnProperty('header')) {
            console.warn('Section is missing required "header" property:', section);
            continue;
        }

        if (!section.hasOwnProperty('key')) {
            console.warn('Section is missing required "key" property:', section);
            continue;
        }

        const entries = parsedData[section.key] || [];
        if (entries.length === 0) {
            console.log(`Skipping section: ${section.header} (${section.key}: no entries)`);
            continue;
        }

        let htmlCode = '{image}<p class="user-display-name">{displayName}</p>';
        if (section.hasOwnProperty('html')) {
            htmlCode = section.html;
        }

        let limit = entries.length;
        if (section.hasOwnProperty('limit')) {
            limit = section.limit;
        }

        let durationPerUser = config.durationPerUser;
        if (section.hasOwnProperty('durationPerUser')) {
            durationPerUser = section.durationPerUser;
        }

        let durationPerCategory = config.durationPerCategory;
        if (section.hasOwnProperty('durationPerCategory')) {
            durationPerCategory = section.durationPerCategory;
        }

        let imageClass = 'avatar';
        if (section.hasOwnProperty('imageClass')) {
            imageClass = section.imageClass;
        }

        totalDuration += durationPerCategory;

        if (hasPreviousSection) {
            const separatorDiv = document.createElement('div');
            separatorDiv.className = 'separator';
            separatorDiv.innerHTML = `<hr class="separator-line" />`;
            creditsContainer.appendChild(separatorDiv);
        }
        hasPreviousSection = true;

        const sectionDiv = document.createElement('div');

        const header = document.createElement('h2');
        if (section.allowHeaderHTML === true) {
            header.innerHTML = section.header;
        } else {
            header.textContent = section.header;
        }
        sectionDiv.appendChild(header);

        for (const entry of entries) {
            limit--;
            if (limit < 0) {
                console.log(`Reached limit for section: ${section.header} (${section.key})`);
                break;
            }

            totalDuration += durationPerUser;

            console.log(`Adding entry: ${entry.userDisplayName} (${section.header})`);
            const entryDiv = document.createElement('div');
            entryDiv.className = 'entry';

            if (section.hasOwnProperty('htmlFunction')) {
                if (typeof section.htmlFunction !== 'function') {
                    console.warn(`Section ${section.key} has htmlFunction but it is not a function:`, section.htmlFunction);
                } else {
                    const evaluatedHtmlCode = section.htmlFunction(entry);
                    if (typeof evaluatedHtmlCode !== 'string') {
                        console.warn(`Section ${section.key} htmlFunction did not return a string:`, evaluatedHtmlCode);
                    } else {
                        htmlCode = evaluatedHtmlCode;
                    }
                }
            }

            const img = new Image();
            img.src = entry.profilePicUrl;
            img.alt = `${entry.username}'s avatar`;
            img.className = imageClass;

            entryDiv.innerHTML = htmlCode
                .replace('{image}', img.outerHTML)
                .replace('{displayName}', entry.userDisplayName)
                .replace('{amount}', entry.amount)
                .replace('{profilePicUrl}', entry.profilePicUrl)
                .replace('{username}', entry.username);
            sectionDiv.appendChild(entryDiv);
        }

        creditsContainer.appendChild(sectionDiv);
    }

    const creditsContainerHeight = creditsContainer.offsetHeight;
    creditsContainer.style.top = `${creditsContainerParentHeight + config.extraPanelPadding - (creditsContainerParentHeight + creditsContainerHeight + config.extraPanelPadding)}px`;
    creditsContainer.parentElement.style.display = 'block';

    const startTime = performance.now();

    function animate() {
        const elapsedTime = performance.now() - startTime;
        const progress = Math.min(elapsedTime / totalDuration, 1);
        creditsContainer.style.transform = `translateY(${(creditsContainerParentHeight + creditsContainerHeight + config.extraPanelPadding) * (1-progress)}px)`;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            console.log('Credits animation completed.');
            creditsContainer.parentElement.style.display = 'none'; // Hide after animation completes
            fetch('./complete', { method: 'GET' })
        }
    }

    console.log(`Beginning credits animation with total duration: ${totalDuration}ms`);
    requestAnimationFrame(animate);
}

async function runSlideshowMode(parsedData) {
    const slides = generateSlides(parsedData);

    if (slides.length === 0) {
        console.log('No slides to display');
        return;
    }

    // Show slideshow container, hide scroll container
    document.getElementById('credits-container').style.display = 'none';
    const slideshowContainer = document.getElementById('slideshow-container');
    slideshowContainer.style.display = 'flex';

    // Handle initial fade-in if configured
    if (config.slideshow.initialFadeInDuration > 0) {
        slideshowContainer.style.opacity = '0'; // Start transparent
        slideshowContainer.style.transition = `opacity ${config.slideshow.initialFadeInDuration}ms ease-in-out`;
        document.getElementById('credits-outer-container').style.display = 'block';

        // Trigger fade-in
        setTimeout(() => {
            slideshowContainer.style.opacity = '1';
        }, 10); // Small delay to ensure transition is applied

        // Wait for initial fade-in to complete
        await sleep(config.slideshow.initialFadeInDuration);
    } else {
        slideshowContainer.style.opacity = '1'; // Start fully visible
        document.getElementById('credits-outer-container').style.display = 'block';
    }

    console.log(`Beginning slideshow with ${slides.length} slides`);

    // Play through all slides
    for (let i = 0; i < slides.length; i++) {
        const isFirstSlide = i === 0;
        const isLastSlide = i === slides.length - 1;
        const isCategoryChange = isFirstSlide || (slides[i].categoryHeader !== slides[i - 1].categoryHeader);

        console.log(`Displaying slide ${i + 1}/${slides.length}: ${slides[i].categoryHeader} (${slides[i].entries.length} entries)`);
        await displaySlide(slides[i], isCategoryChange, isLastSlide);
    }

    // Fade out the final slide before completing
    console.log('Slideshow completed. Fading out to transparent...');

    // Apply fade transition and fade to completely transparent
    slideshowContainer.style.transition = `opacity ${config.slideshow.finalFadeOutDuration}ms ease-in-out`;
    slideshowContainer.style.opacity = '0';

    await sleep(config.slideshow.finalFadeOutDuration);

    // Complete
    document.getElementById('credits-outer-container').style.display = 'none';
    fetch('./complete', { method: 'GET' });
}

function generateSlides(parsedData) {
    const slides = [];

    for (const section of sectionsConfig) {
        if (!section.hasOwnProperty('header')) {
            console.warn('Section is missing required "header" property:', section);
            continue;
        }

        if (!section.hasOwnProperty('key')) {
            console.warn('Section is missing required "key" property:', section);
            continue;
        }

        const entries = parsedData[section.key] || [];

        // Check if this is a blank slide that should be displayed even with no entries
        const isBlankSlide = section.slideshow && section.slideshow.isBlankSlide === true;

        if (entries.length === 0 && !isBlankSlide) {
            console.log(`Skipping section: ${section.header} (${section.key}: no entries)`);
            continue;
        }

        // Apply limit if specified
        let limitedEntries = entries;
        if (section.hasOwnProperty('limit')) {
            limitedEntries = entries.slice(0, section.limit);
            console.log(`Applied limit ${section.limit} to section: ${section.header}`);
        }

        const maxRows = (section.slideshow && section.slideshow.maxRows) || config.slideshow.maxRows;
        const maxColumns = (section.slideshow && section.slideshow.maxColumns) || config.slideshow.maxColumns;
        const entriesPerSlide = maxRows * maxColumns;

        // Handle blank slides (display one slide with no entries)
        if (isBlankSlide) {
            console.log(`Creating blank slide: ${section.header} (${section.key})`);
            slides.push({
                categoryHeader: section.header,
                entries: [], // Empty array for blank slide
                duration: (section.slideshow && section.slideshow.slideDuration) || config.slideshow.slideDuration,
                maxRows: maxRows,
                maxColumns: maxColumns,
                fadeBetweenSameCategorySlides: (section.slideshow && section.slideshow.fadeBetweenSameCategorySlides !== undefined)
                    ? section.slideshow.fadeBetweenSameCategorySlides
                    : config.slideshow.fadeBetweenSameCategorySlides,
                section: section,
                isBlank: true // Flag to indicate this is a blank slide
            });
        } else {
            // Split entries into multiple slides if needed
            for (let i = 0; i < limitedEntries.length; i += entriesPerSlide) {
                const slideEntries = limitedEntries.slice(i, i + entriesPerSlide);
                slides.push({
                    categoryHeader: section.header,
                    entries: slideEntries,
                    duration: (section.slideshow && section.slideshow.slideDuration) || config.slideshow.slideDuration,
                    maxRows: maxRows,
                    maxColumns: maxColumns,
                    fadeBetweenSameCategorySlides: (section.slideshow && section.slideshow.fadeBetweenSameCategorySlides !== undefined)
                        ? section.slideshow.fadeBetweenSameCategorySlides
                        : config.slideshow.fadeBetweenSameCategorySlides,
                    section: section
                });
            }
        }
    }

    return slides;
}

function resetCategoryCSS() {
    // Reset styles and classes to their CSS defaults
    const slideshowContainer = document.getElementById('slideshow-container');
    const slideContent = document.getElementById('slide-content');
    const categoryHeader = document.getElementById('category-header');
    const slideGrid = document.getElementById('slide-grid');

    // Helper function to reset classes to their defaults
    function resetClasses(element, defaultClasses) {
        if (element) {
            element.className = defaultClasses;
        }
    }

    // Reset classes to their default values
    resetClasses(slideshowContainer, 'slideshow-container');
    resetClasses(slideContent, 'slide-content');
    resetClasses(categoryHeader, 'category-header');
    resetClasses(slideGrid, 'slide-grid');

    // Remove inline styles to let CSS defaults take effect
    // Keep only the essential styles that are dynamically set by JavaScript
    if (slideshowContainer) {
        const display = slideshowContainer.style.display;
        const opacity = slideshowContainer.style.opacity;
        const transition = slideshowContainer.style.transition;
        slideshowContainer.removeAttribute('style');
        if (display) slideshowContainer.style.display = display;
        if (opacity) slideshowContainer.style.opacity = opacity;
        if (transition) slideshowContainer.style.transition = transition;
    }

    if (slideContent) {
        const opacity = slideContent.style.opacity;
        const transition = slideContent.style.transition;
        slideContent.removeAttribute('style');
        if (opacity) slideContent.style.opacity = opacity;
        if (transition) slideContent.style.transition = transition;
    }

    if (categoryHeader) {
        const display = categoryHeader.style.display;
        categoryHeader.removeAttribute('style');
        if (display) categoryHeader.style.display = display;
    }

    if (slideGrid) {
        const gridTemplateRows = slideGrid.style.gridTemplateRows;
        const gridTemplateColumns = slideGrid.style.gridTemplateColumns;
        const gap = slideGrid.style.gap;
        slideGrid.removeAttribute('style');
        if (gridTemplateRows) slideGrid.style.gridTemplateRows = gridTemplateRows;
        if (gridTemplateColumns) slideGrid.style.gridTemplateColumns = gridTemplateColumns;
        if (gap) slideGrid.style.gap = gap;
    }
}

function applyCategoryCSS(section) {
    // Helper function to apply CSS properties to an element
    function applyStyles(element, cssObj) {
        if (!cssObj || typeof cssObj !== 'object') return;

        Object.keys(cssObj).forEach(property => {
            // Convert camelCase to kebab-case for CSS properties
            const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
            element.style.setProperty(cssProperty, cssObj[property]);
        });
    }

    // Helper function to add CSS classes to an element
    function addClasses(element, classNames) {
        if (!classNames || typeof classNames !== 'string') return;

        // Split by spaces and add each class
        const classes = classNames.trim().split(/\s+/);
        classes.forEach(className => {
            if (className) {
                element.classList.add(className);
            }
        });
    }

    // Get the elements that can be customized
    const slideshowContainer = document.getElementById('slideshow-container');
    const slideContent = document.getElementById('slide-content');
    const categoryHeader = document.getElementById('category-header');
    const slideGrid = document.getElementById('slide-grid');

    // Apply custom classes first (so CSS properties can override class styles)
    const slideshow = section.slideshow || {};

    if (slideshow.containerClass) {
        addClasses(slideshowContainer, slideshow.containerClass);
    }

    if (slideshow.contentClass) {
        addClasses(slideContent, slideshow.contentClass);
    }

    if (slideshow.headerClass) {
        addClasses(categoryHeader, slideshow.headerClass);
    }

    if (slideshow.gridClass) {
        addClasses(slideGrid, slideshow.gridClass);
    }

    // Apply custom styles after classes (so CSS properties override class styles)
    if (slideshow.containerCSS) {
        applyStyles(slideshowContainer, slideshow.containerCSS);
    }

    if (slideshow.contentCSS) {
        applyStyles(slideContent, slideshow.contentCSS);
    }

    if (slideshow.headerCSS) {
        applyStyles(categoryHeader, slideshow.headerCSS);
    }

    if (slideshow.gridCSS) {
        applyStyles(slideGrid, slideshow.gridCSS);
    }
}

async function displaySlide(slide, isCategoryChange = true, isLastSlide = false) {
    const slideContent = document.getElementById('slide-content');
    const categoryHeader = document.getElementById('category-header');
    const slideGrid = document.getElementById('slide-grid');

    // Set dynamic transition durations based on configuration
    slideContent.style.transition = `opacity ${config.slideshow.fadeOutDuration}ms ease-in-out`;
    slideGrid.style.transition = `opacity ${config.slideshow.fadeOutDuration}ms ease-in-out`;

    // Determine what should fade based on configuration and slide context
    const shouldFadeAll = isCategoryChange; // Always fade everything on category change
    const shouldFadeGridOnly = !isCategoryChange && slide.fadeBetweenSameCategorySlides; // Only fade grid within same category

    // Fade out current content if needed
    if (shouldFadeAll) {
        // Fade out entire slide content (header + grid) for category changes
        slideContent.classList.add('fade-out');
        await sleep(config.slideshow.fadeOutDuration);
    } else if (shouldFadeGridOnly) {
        // Only fade out the grid for same-category transitions
        slideGrid.classList.add('fade-out');
        await sleep(config.slideshow.fadeOutDuration);
    }

    // Reset CSS styles on category change to prevent styles from previous category
    if (isCategoryChange) {
        resetCategoryCSS();
    }

    // Set up new content
    if (config.slideshow.categoryHeaderEnabled) {
        if (slide.section && slide.section.allowHeaderHTML === true) {
            categoryHeader.innerHTML = slide.categoryHeader;
        } else {
            categoryHeader.textContent = slide.categoryHeader;
        }
        categoryHeader.style.display = 'block';
    } else {
        categoryHeader.style.display = 'none';
    }

    slideGrid.innerHTML = '';

    // For blank slides, we don't need to configure the grid layout
    if (!slide.isBlank) {
        // Dynamically configure grid layout using CSS properties
        slideGrid.style.gridTemplateRows = `repeat(${slide.maxRows}, 1fr)`;
        slideGrid.style.gridTemplateColumns = `repeat(${slide.maxColumns}, 1fr)`;

        // Optional: Adjust gap based on grid size for better spacing
        const baseGap = 15;
        const adjustedGap = Math.max(10, baseGap - Math.floor((slide.maxRows + slide.maxColumns) / 4));
        slideGrid.style.gap = `${adjustedGap}px`;
    }

    // Apply custom CSS styles for this category if specified
    applyCategoryCSS(slide.section);

    // Special handling for blank slides to enable true vertical centering
    if (slide.isBlank) {
        // Hide the grid completely for blank slides
        slideGrid.style.display = 'none';

        // For blank slides, if no custom contentCSS is provided, set up perfect centering
        const slideshow = slide.section.slideshow || {};
        if (!slideshow.contentCSS) {
            slideContent.style.justifyContent = 'center';
            slideContent.style.alignItems = 'center';
            slideContent.style.display = 'flex';
            slideContent.style.flexDirection = 'column';
        }

        // If no custom headerCSS margin is set, remove default margins for better centering
        if (!slideshow.headerCSS || !slideshow.headerCSS.hasOwnProperty('margin')) {
            categoryHeader.style.margin = '0';
        }
    } else {
        // Ensure normal layout for non-blank slides
        slideGrid.style.display = 'grid';
    }

    // Add entries to grid
    slide.entries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'slide-entry';

        // Use existing HTML templating logic
        let htmlCode = '{image}<p class="user-display-name">{displayName}</p>';
        if (slide.section.hasOwnProperty('html')) {
            htmlCode = slide.section.html;
        }

        // Handle htmlFunction if specified
        if (slide.section.hasOwnProperty('htmlFunction')) {
            if (typeof slide.section.htmlFunction !== 'function') {
                console.warn(`Section ${slide.section.key} has htmlFunction but it is not a function:`, slide.section.htmlFunction);
            } else {
                const evaluatedHtmlCode = slide.section.htmlFunction(entry);
                if (typeof evaluatedHtmlCode !== 'string') {
                    console.warn(`Section ${slide.section.key} htmlFunction did not return a string:`, evaluatedHtmlCode);
                } else {
                    htmlCode = evaluatedHtmlCode;
                }
            }
        }

        const img = new Image();
        img.src = entry.profilePicUrl;
        img.alt = `${entry.username}'s avatar`;
        img.className = slide.section.imageClass || 'avatar';

        entryDiv.innerHTML = htmlCode
            .replace('{image}', img.outerHTML)
            .replace('{displayName}', entry.userDisplayName)
            .replace('{amount}', entry.amount)
            .replace('{profilePicUrl}', entry.profilePicUrl)
            .replace('{username}', entry.username);

        slideGrid.appendChild(entryDiv);
    });

    // Fade in new content if we faded out
    if (shouldFadeAll) {
        // Update transition for fade-in duration
        slideContent.style.transition = `opacity ${config.slideshow.fadeInDuration}ms ease-in-out`;
        slideContent.classList.remove('fade-out');
        // Wait for fade-in to complete
        await sleep(config.slideshow.fadeInDuration);
    } else if (shouldFadeGridOnly) {
        // Update transition for fade-in duration
        slideGrid.style.transition = `opacity ${config.slideshow.fadeInDuration}ms ease-in-out`;
        slideGrid.classList.remove('fade-out');
        // Wait for fade-in to complete
        await sleep(config.slideshow.fadeInDuration);
    }

    // Wait for slide duration
    await sleep(slide.duration);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
