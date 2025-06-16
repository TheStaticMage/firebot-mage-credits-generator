window.onload = function() {
    const startTime = Date.now();
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

        if (hasPreviousSection) {
            const separatorDiv = document.createElement('div');
            separatorDiv.className = 'separator';
            separatorDiv.innerHTML = `<hr class="separator-line" />`;
            creditsContainer.appendChild(separatorDiv);
        }
        hasPreviousSection = true;

        totalDuration += entries.length * config.durationPerUser + config.durationPerCategory;
        const sectionDiv = document.createElement('div');

        const header = document.createElement('h2');
        header.textContent = section.header;
        sectionDiv.appendChild(header);

        for (const entry of entries) {
            console.log(`Adding entry: ${entry.displayName} (${section.header})`);
            const entryDiv = document.createElement('div');
            entryDiv.className = 'entry';

            const img = new Image();
            img.src = entry.profilePicUrl;
            img.alt = `${entry.username}'s avatar`;
            img.className = 'avatar';

            entryDiv.innerHTML = htmlCode
                .replace('{image}', img.outerHTML)
                .replace('{displayName}', entry.displayName)
                .replace('{amount}', entry.amount);
            sectionDiv.appendChild(entryDiv);
        }

        creditsContainer.appendChild(sectionDiv);
    }

    const creditsContainerHeight = creditsContainer.offsetHeight;
    creditsContainer.style.top = `${creditsContainerParentHeight + config.extraPanelPadding - (creditsContainerParentHeight + creditsContainerHeight + config.extraPanelPadding)}px`;
    creditsContainer.parentElement.style.display = 'block';

    function animate() {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / totalDuration, 1);
        creditsContainer.style.top = `${creditsContainerParentHeight + config.extraPanelPadding - (creditsContainerParentHeight + creditsContainerHeight + config.extraPanelPadding) * progress}px`;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            if (config.endAnimationEffectListId) {
                // Trigger the end animation effect list in Firebot
                console.log(`Triggering end animation effect list: ${config.endAnimationEffectListId}`);
                const endAnimationUrl = `${config.firebotBaseUrl}/${config.endAnimationEffectListId}`;
                fetch(endAnimationUrl, {
                    method: 'GET',
                })
            }
            console.log('Credits animation completed.');
            creditsContainer.parentElement.style.display = 'none'; // Hide after animation completes
        }
    }

    console.log(`Beginning credits animation with total duration: ${totalDuration}ms`);
    requestAnimationFrame(animate);
};
