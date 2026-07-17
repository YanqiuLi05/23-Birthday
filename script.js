const screens = {
  intro: document.querySelector("#intro"),
  verification: document.querySelector("#verification"),
  letter: document.querySelector("#letter"),
  rewards: document.querySelector("#rewards"),
  finale: document.querySelector("#finale"),
};

const terminalOutput = document.querySelector("#terminalOutput");
const continueButton = document.querySelector("#continueButton");
const verificationForm = document.querySelector("#verificationForm");
const accessCode = document.querySelector("#accessCode");
const codeSlots = document.querySelectorAll(".code-slot");
const verificationMessage = document.querySelector("#verificationMessage");
const letterNextButton = document.querySelector("#letterNextButton");
const checkboxes = document.querySelectorAll(".check-row input");
const selectionBox = document.querySelector("#selectionBox");
const rewardsSubmitButton = document.querySelector("#rewardsSubmitButton");

const correctCode = "1016";
const typeDelay = 14;
const lineDelay = 260;

const terminalLines = [
  "Unknown process detected...",
  "Scanning...",
  "Virus detected.",
  "Name: Birthday.exe",
  "Identity confirmed.",
  "Happy Birthday, Birthday Boy.",
];

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("is-active"));
  screens[name].classList.add("is-active");
}

async function typeLine(text) {
  const line = document.createElement("span");
  line.className = "terminal-line cursor";
  terminalOutput.appendChild(line);

  for (const char of text) {
    line.textContent += char;
    await wait(typeDelay);
  }

  line.classList.remove("cursor");
  await wait(lineDelay);
}

async function runScanAnimation() {
  const scan = document.createElement("div");
  scan.className = "terminal-scan";
  scan.innerHTML = `
    <div class="scan-track" aria-hidden="true">
      <div class="scan-fill"></div>
    </div>
    <span class="scan-percent">0%</span>
  `;
  terminalOutput.appendChild(scan);

  const percent = scan.querySelector(".scan-percent");
  const fill = scan.querySelector(".scan-fill");
  const duration = 2200;
  const startedAt = performance.now();

  await new Promise((resolve) => {
    function update(now) {
      const progress = Math.min((now - startedAt) / duration, 1);
      percent.textContent = `${Math.round(progress * 100)}%`;
      fill.style.transform = `scaleX(${progress})`;

      if (progress < 1) {
        requestAnimationFrame(update);
        return;
      }

      resolve();
    }

    requestAnimationFrame(update);
  });

  await wait(360);
}

async function runTerminal() {
  await typeLine(terminalLines[0]);
  await typeLine(terminalLines[1]);
  await runScanAnimation();

  for (const line of terminalLines.slice(2)) {
    await typeLine(line);
  }

  continueButton.classList.remove("is-hidden");
  continueButton.focus();
}

continueButton.addEventListener("click", () => {
  showScreen("verification");
  window.setTimeout(() => codeSlots[0].focus(), 100);
});

function syncAccessCode() {
  accessCode.value = Array.from(codeSlots)
    .map((slot) => slot.value)
    .join("");
}

codeSlots.forEach((slot, index) => {
  slot.addEventListener("input", () => {
    slot.value = slot.value.replace(/\D/g, "").slice(0, 1);
    syncAccessCode();

    if (slot.value && codeSlots[index + 1]) {
      codeSlots[index + 1].focus();
    }
  });

  slot.addEventListener("keydown", (event) => {
    if (event.key === "Backspace" && !slot.value && codeSlots[index - 1]) {
      codeSlots[index - 1].focus();
    }
  });

  slot.addEventListener("paste", (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);

    pasted.split("").forEach((digit, digitIndex) => {
      if (codeSlots[digitIndex]) {
        codeSlots[digitIndex].value = digit;
      }
    });

    syncAccessCode();
    codeSlots[Math.min(pasted.length, codeSlots.length) - 1]?.focus();
  });
});

verificationForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  syncAccessCode();

  if (accessCode.value.trim() === correctCode) {
    verificationMessage.textContent = "Access Granted";
    verificationMessage.className = "status-message success";
    await wait(650);
    showScreen("letter");
    return;
  }

  verificationMessage.textContent = "Incorrect.\nYou definitely should know this.";
  verificationMessage.className = "status-message error";
  codeSlots.forEach((slot) => {
    slot.value = "";
  });
  syncAccessCode();
  codeSlots[0].focus();
});

letterNextButton.addEventListener("click", () => {
  showScreen("rewards");
});

function updateSelection() {
  const selected = Array.from(checkboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);

  if (!selected.length) {
    selectionBox.innerHTML = "<p>Select anything you want.</p>";
    return;
  }

  selectionBox.innerHTML = `<p>Selected:\n${selected
    .map((item) => `- ${item}`)
    .join("\n")}\n\nBirthday.exe completed successfully.\nSee you soon. <3</p>`;
}

checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", updateSelection);
});

rewardsSubmitButton.addEventListener("click", () => {
  showScreen("finale");
});

runTerminal();
