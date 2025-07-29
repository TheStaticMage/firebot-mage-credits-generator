// Do not modify this file unless you know what you are doing!
// If you find yourself needing to modify this file, please consider
// submitting a pull request to improve the code for everyone.

window.onload = function() {
    const creditsContainer = document.getElementById('credits-container');
    creditsContainer.innerHTML = '';
    const creditsContainerParentHeight = creditsContainer.parentElement.offsetHeight;

    let totalDuration = 2000;
    const parsedData = JSON.parse(atob(data));
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
        header.textContent = section.header;
        sectionDiv.appendChild(header);

        for (const entry of entries) {
            limit--;
            if (limit < 0) {
                console.log(`Reached limit for section: ${section.header} (${section.key})`);
                break;
            }

            totalDuration += durationPerUser;

            console.log(`Adding entry: ${entry.displayName} (${section.header})`);
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
                .replace('{displayName}', entry.displayName)
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
            fetch('complete' + window.location.search, { method: 'GET' })
        }
    }

    console.log(`Beginning credits animation with total duration: ${totalDuration}ms`);
    requestAnimationFrame(animate);
};
