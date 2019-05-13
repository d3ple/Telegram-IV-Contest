// ==UserScript==
// @name         IV dates and time
// @version      0.2
// @description  The script changes dates and time on the contest pages into your timezone, adds dynamic status and remaining time counter for each template.
// @author       d3ple
// @match        https://instantview.telegram.org/contest/*
// @grant        none
// ==/UserScript==


(function () {
  "use strict";

  const pickStatusColor = status => {
    if (status === "normal") {
      return "color: white; background-color: #00b5ad;";
    }
    if (status === "soon") {
      return "color: white; background-color: #db2828;";
    }
    if (status === "checking") {
      return "color: rgba(0,0,0,.6); background-color: #e0e1e2;";
    }
  };

  const countTimeUntilEnd = publicationDate => {
    const endDate = publicationDate;
    endDate.setHours(endDate.getHours() + 72);
    const timeLeft = endDate.getTime() - new Date().getTime();

    const floatHoursLeft = timeLeft / (60 * 60 * 1000);
    const hoursLeft = Math.floor(floatHoursLeft);
    const minutesLeft = Math.floor((floatHoursLeft - hoursLeft) * 60);

    const hoursString = hoursLeft === 0 ? "" : `${hoursLeft} hr, `;
    const minutesString = `${minutesLeft} min`;

    if (hoursLeft < 0) {
      return { status: "checking", text: "checking" };
    } else if (hoursLeft >= 0) {
      return hoursLeft < 5
        ? { status: "soon", text: `${hoursString}${minutesString} left` }
        : { status: "normal", text: `${hoursString}${minutesString} left` };
    }
  };

  const changeDatesToLocal = () => {
    const publishingDates = $("div.contest-item-date");
    const activeTemplates = $(
      "div.list-group-contest",
      $("section.contest-section").has("p.about-text")
    ).get(0);

    for (let i = 0; i < $(publishingDates).length; i++) {
      const curTemplate = $(publishingDates)[i];
      const publicationDateString = $(curTemplate).text();
      let publicationDate = new Date(
        publicationDateString.replace(
          /(\w+\s\d+)\s(\w+)\s(\d+\W\d+\s\w+)/,
          `$1, ${new Date().getFullYear()}, $3 UTC`
        )
      );

      if (!Boolean(+publicationDate)) {
        publicationDate = new Date(
          publicationDateString.replace(
            /(\w+\s\d+)\W\s(\d+)\s(\w+)\s(\d+\W\d+\s\w+)/,
            `$1, $2, $4 UTC`
          )
        );
      }

      const options =
        publicationDate.getFullYear() === new Date().getFullYear()
          ? {
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric"
          }
          : {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric"
          };

      const localPublishingDate = `${publicationDate.toLocaleString("en-GB", options)}`;
      let status = "";

      const templateStatus = countTimeUntilEnd(publicationDate);
      if (typeof activeTemplates !== "undefined") {
        if ($.contains(activeTemplates, $(curTemplate).get(0))) {
          status = `<span style='font-size: 0.8em; margin-left: 7px; border-radius: 5px; padding: 1px 7px; ${pickStatusColor(
            templateStatus.status
          )}'>${templateStatus.text}</span>`;
        }
      }

      curTemplate.innerHTML = `${localPublishingDate}${status}`;
    }
  };

  changeDatesToLocal();

  const changeDateOnIssuePage = () => {
    const date = $("dd", $("dt:contains('Reported')").parent());
    const publicationDateString = $(date).text();
    const publicationDate = new Date(
      publicationDateString.replace(
        /(\w+\s\d+)\s(\w+)\s(\d+\W\d+\s\w+)/,
        `$1, ${new Date().getFullYear()}, $3 UTC`
      )
    );
    const options = {
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric"
    };
    const localPublishingDate = `${publicationDate.toLocaleString("en-GB", options)}`;
    $(date).text(localPublishingDate);
  };

  changeDateOnIssuePage();
})();
