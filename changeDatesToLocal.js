// ==UserScript==
// @name         IV dates and time
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Changes dates to tour timezone and adds "time left" info for every template
// @author       d3ple
// @match        https://instantview.telegram.org/contest/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const checkForPluralForm = digit => digit === 1 ? '' : 's';


    const countTimeUntilEnd = (publicationDate) => {
        const endDate = publicationDate;
        endDate.setHours(endDate.getHours() + 71);

        const msPerDay = 24 * 60 * 60 * 1000;
        const timeLeft = (endDate.getTime() - new Date().getTime());
        const e_daysLeft = timeLeft / msPerDay;
        const daysLeft = Math.floor(e_daysLeft);
        const e_hrsLeft = (e_daysLeft - daysLeft) * 24;
        const hoursLeft = Math.floor(e_hrsLeft);
        const minutesLeft = Math.floor((e_hrsLeft - hoursLeft) * 60);

        const daysString = daysLeft === 0 ? '' : `${daysLeft} day${checkForPluralForm(daysLeft)}, `;
        const hoursString = hoursLeft === 0 ? '' : `${hoursLeft} hour${checkForPluralForm(hoursLeft)}, `;

        const minutesString = daysString === ''
            ? `${minutesLeft} minutes${checkForPluralForm(minutesLeft)}`
            : `${minutesLeft} min`;

        return daysLeft < 0
            ? `${daysString.replace('-', '')}${hoursString}${minutesString} on checking`
            : `${daysString}${hoursString}${minutesString} left`;
    };


    const changeDatesToLocal = () => {
        const publishingDates = $("div.contest-item-date");
        const activeTemplates = $("div.list-group-contest", $("section.contest-section").has("p.about-text")).get(0);

        for (let i = 0; i < $(publishingDates).length; i++) {
            const curTemplate = $(publishingDates)[i];
            const publicationDateString = $(curTemplate).text();
            let publicationDate = new Date(publicationDateString.replace(/(\w+\s\d+)\s(\w+)\s(\d+\W\d+\s\w+)/, `$1, ${(new Date()).getFullYear()}, $3 UTC`));

            if (!Boolean(+publicationDate)) {
                publicationDate = new Date(publicationDateString.replace(/(\w+\s\d+)\W\s(\d+)\s(\w+)\s(\d+\W\d+\s\w+)/, `$1, $2, $4 UTC`));
            }

            const options = publicationDate.getFullYear() === (new Date()).getFullYear()
                ? { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' }
                : { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };

            if (typeof activeTemplates !== 'undefined') {
                if ($.contains(activeTemplates, $(curTemplate).get(0))) {
                    const localPublishingDate = `<p>Published: ${publicationDate.toLocaleString('en-GB', options)}</p>`;
                    const status = `<p style='margin-bottom: -4px;'>Status: ${countTimeUntilEnd(publicationDate)}</p>`;
                    curTemplate.innerHTML = `${localPublishingDate}${status}`;
                }
            } else {
                const localPublishingDate = `${publicationDate.toLocaleString('en-GB', options)}`;
                curTemplate.innerHTML = `${localPublishingDate}`;
            }
        }
    };


    changeDatesToLocal();
})();